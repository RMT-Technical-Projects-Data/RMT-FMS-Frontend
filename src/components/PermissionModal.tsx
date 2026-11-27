import React, { useEffect, useMemo, useState } from "react";
import { Dialog } from "@headlessui/react";
import { useUsers } from "../hooks/useAuth";
import {
  useAssignPermission,
  useResourcePermissions,
  useRemovePermission,
} from "../hooks/usePermissions";
import type { User } from "../types";
import { FiKey, FiX, FiEye, FiDownload } from "react-icons/fi";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

interface PermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  resourceId: number;
  resourceType: "folder" | "file";
  showToast?: (
    message: string,
    type: "success" | "error" | "info" | "warning"
  ) => void;
}

type TabKey = "none" | "view" | "view_download";

const isSuperAdminRole = (role: unknown) => {
  const r = String(role ?? "")
    .toLowerCase()
    .replace(/\s+/g, "");
  return r === "superadmin" || r === "super_admin";
};

const PermissionModal: React.FC<PermissionModalProps> = ({
  isOpen,
  onClose,
  resourceId,
  resourceType,
}) => {
  const { data: users } = useUsers();
  const assignPermission = useAssignPermission();
  const removePermission = useRemovePermission();
  const { data: resourcePermissions } = useResourcePermissions(
    resourceId,
    resourceType
  );
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<TabKey>("none");
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [permissions, setPermissions] = useState({
    can_read: false,
    can_download: false,
  });
  const [initialPermissions, setInitialPermissions] = useState<{
    can_read: boolean;
    can_download: boolean;
  } | null>(null);

  const availableUsers: User[] = useMemo(() => {
    const map = new Map<number, User>();
    for (const u of users ?? []) {
      const idNum = Number((u as any).id ?? (u as any)._id);
      if (!Number.isFinite(idNum) || isSuperAdminRole((u as any).role)) continue;
      map.set(idNum, { ...u, id: idNum } as User);
    }
    return Array.from(map.values()).sort((a, b) => Number(a.id) - Number(b.id));
  }, [users]);

  const availableUserIdSet = useMemo(
    () => new Set(availableUsers.map((u) => Number(u.id))),
    [availableUsers]
  );

  const { noPermissionUsers, viewOnlyUsers, viewDownloadUsers } = useMemo(() => {
    const noPerms: User[] = [];
    const viewOnly: User[] = [];
    const viewDownload: User[] = [];

    for (const user of availableUsers) {
      const idNum = Number(user.id);
      const perm = (resourcePermissions as any[])?.find(
        (p) => Number(p.user_id ?? p.userId) === idNum
      );
      const canRead = !!perm?.can_read;
      const canDownload = !!perm?.can_download;
      if (canRead && canDownload) viewDownload.push(user);
      else if (canRead) viewOnly.push(user);
      else noPerms.push(user);
    }

    return {
      noPermissionUsers: noPerms,
      viewOnlyUsers: viewOnly,
      viewDownloadUsers: viewDownload,
    };
  }, [availableUsers, resourcePermissions]);

  const usersDisplay =
    activeTab === "view_download"
      ? viewDownloadUsers
      : activeTab === "view"
        ? viewOnlyUsers
        : noPermissionUsers;

  useEffect(() => {
    if (!isOpen) return;
    setSelectedUsers([]);
    setPermissions({ can_read: false, can_download: false });
    setInitialPermissions(null);
    setActiveTab("none");
  }, [isOpen]);

  useEffect(() => {
    if (!resourcePermissions) return;
    const validSelected = selectedUsers.filter((id) =>
      availableUserIdSet.has(Number(id))
    );
    if (validSelected.length !== selectedUsers.length) {
      setSelectedUsers(validSelected);
      return;
    }

    if (validSelected.length === 1) {
      const perm = (resourcePermissions as any[]).find(
        (p) => Number(p.user_id ?? p.userId) === validSelected[0]
      );
      const snapshot = {
        can_read: !!perm?.can_read,
        can_download: !!perm?.can_download,
      };
      setPermissions(snapshot);
      setInitialPermissions(snapshot);
    } else if (validSelected.length > 1) {
      const allCanRead = validSelected.every((userId) => {
        const perm = (resourcePermissions as any[]).find(
          (p) => Number(p.user_id ?? p.userId) === userId
        );
        return !!perm?.can_read;
      });
      const allCanDownload = validSelected.every((userId) => {
        const perm = (resourcePermissions as any[]).find(
          (p) => Number(p.user_id ?? p.userId) === userId
        );
        return !!perm?.can_download;
      });
      const snap = {
        can_read: allCanRead,
        can_download: allCanRead && allCanDownload,
      };
      setPermissions(snap);
      setInitialPermissions(snap);
    } else {
      setInitialPermissions(null);
      setPermissions({ can_read: false, can_download: false });
    }
  }, [selectedUsers, resourcePermissions, availableUserIdSet]);

  const isAssigning =
    assignPermission.isPending || removePermission.isPending;

  const hasChanges = useMemo(() => {
    if (selectedUsers.length === 0) return false;
    if (!initialPermissions) {
      return permissions.can_read || permissions.can_download;
    }
    return (
      permissions.can_read !== initialPermissions.can_read ||
      permissions.can_download !== initialPermissions.can_download
    );
  }, [selectedUsers, permissions, initialPermissions]);

  const toggleUser = (userIdRaw: number) => {
    const userId = Number(userIdRaw);
    if (!availableUserIdSet.has(userId)) return;
    setSelectedUsers((prev) => {
      const s = new Set(prev);
      if (s.has(userId)) s.delete(userId);
      else s.add(userId);
      return Array.from(s).sort((a, b) => a - b);
    });
  };

  const handlePermissionChange = (key: "can_read" | "can_download", checked: boolean) => {
    setPermissions((prev) => {
      const next = { ...prev, [key]: checked };
      if (key === "can_read" && !checked) next.can_download = false;
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!hasChanges) {
      toast.info("No changes made to permissions");
      onClose();
      return;
    }

    const current = selectedUsers.filter((id) => availableUserIdSet.has(id));
    const toRemove: number[] = [];
    const toAssign: number[] = [];

    for (const id of current) {
      if (!permissions.can_read && !permissions.can_download) toRemove.push(id);
      else toAssign.push(id);
    }

    try {
      await Promise.all([
        ...toAssign.map((user_id) =>
          assignPermission.mutateAsync({
            user_id,
            resource_id: resourceId,
            resource_type: resourceType,
            ...permissions,
          })
        ),
        ...toRemove.map(async (user_id) => {
          const permObj = (resourcePermissions as any[])?.find(
            (p) => Number(p.user_id ?? p.userId) === user_id
          );
          if (permObj?.id) return removePermission.mutateAsync(permObj.id);
          return assignPermission.mutateAsync({
            user_id,
            resource_id: resourceId,
            resource_type: resourceType,
            can_read: false,
            can_download: false,
          });
        }),
      ]);
      toast.success("Permissions updated");
      await queryClient.invalidateQueries({
        queryKey: ["permissions", resourceId, resourceType],
      });
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update permissions");
    }
  };

  const tabs: { key: TabKey; label: string; count: number }[] = [
    { key: "none", label: "No access", count: noPermissionUsers.length },
    { key: "view", label: "View", count: viewOnlyUsers.length },
    {
      key: "view_download",
      label: "View + Download",
      count: viewDownloadUsers.length,
    },
  ];

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-ink/40" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto">
        <Dialog.Panel className="bg-white rounded-lg shadow-xl border border-rule w-full max-w-xl h-[min(640px,90vh)] flex flex-col my-auto">
          <div className="flex items-center justify-between px-5 py-4 border-b border-rule shrink-0">
            <div className="flex items-center gap-3">
              <span className="h-9 w-9 rounded-md bg-[#0b1622] text-white flex items-center justify-center">
                <FiKey size={16} />
              </span>
              <div>
                <Dialog.Title className="text-[15px] font-semibold text-ink">
                  Permissions
                </Dialog.Title>
                <p className="text-xs text-muted capitalize">
                  {resourceType} access control
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-[#f3f1ea] rounded-md"
            >
              <FiX size={18} className="text-muted" />
            </button>
          </div>

          <div className="flex border-b border-rule shrink-0">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setActiveTab(tab.key);
                  setSelectedUsers([]);
                }}
                className={`flex-1 py-2.5 text-[13px] font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? "border-ink text-ink"
                    : "border-transparent text-muted hover:text-ink"
                }`}
              >
                {tab.label}
                <span className="ml-1.5 inline-flex min-w-5 h-5 px-1.5 rounded bg-[#f3f1ea] text-[11px] tabular-nums items-center justify-center">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-4">
            <div>
              <p className="text-[13px] font-medium text-ink mb-2">Users</p>
              <div className="border border-rule rounded-md max-h-56 overflow-y-auto divide-y divide-[#eeeae1]">
                {usersDisplay.map((u) => {
                  const idNum = Number(u.id);
                  const checked = selectedUsers.includes(idNum);
                  return (
                    <label
                      key={idNum}
                      className="flex items-center gap-3 px-3 py-2.5 hover:bg-[#f8f7f3] cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleUser(idNum)}
                        className="rounded border-rule"
                      />
                      <span className="min-w-0">
                        <span className="block text-[13px] font-medium text-ink truncate">
                          {(u as any).username ?? (u as any).name ?? `User ${idNum}`}
                        </span>
                        <span className="block text-[11px] text-muted capitalize">
                          {(u as any).role ?? "user"}
                        </span>
                      </span>
                    </label>
                  );
                })}
                {usersDisplay.length === 0 && (
                  <p className="text-sm text-muted text-center py-8">
                    No users in this category
                  </p>
                )}
              </div>
            </div>

            {selectedUsers.length > 0 && (
              <div>
                <p className="text-[13px] font-medium text-ink mb-2">
                  Access for {selectedUsers.length} selected
                </p>
                <div className="space-y-2">
                  <label className="flex items-start gap-3 p-3 border border-rule rounded-md cursor-pointer hover:bg-[#f8f7f3]">
                    <input
                      type="checkbox"
                      checked={permissions.can_read}
                      onChange={(e) =>
                        handlePermissionChange("can_read", e.target.checked)
                      }
                      className="mt-0.5 rounded border-rule"
                    />
                    <span>
                      <span className="flex items-center gap-1.5 text-[13px] font-medium text-ink">
                        <FiEye size={14} /> View
                      </span>
                      <span className="block text-xs text-muted mt-0.5">
                        Can open and browse this {resourceType}
                      </span>
                    </span>
                  </label>
                  {permissions.can_read && (
                    <label className="flex items-start gap-3 p-3 border border-rule rounded-md cursor-pointer hover:bg-[#f8f7f3]">
                      <input
                        type="checkbox"
                        checked={permissions.can_download}
                        onChange={(e) =>
                          handlePermissionChange(
                            "can_download",
                            e.target.checked
                          )
                        }
                        className="mt-0.5 rounded border-rule"
                      />
                      <span>
                        <span className="flex items-center gap-1.5 text-[13px] font-medium text-ink">
                          <FiDownload size={14} /> Download
                        </span>
                        <span className="block text-xs text-muted mt-0.5">
                          Can download this {resourceType}
                        </span>
                      </span>
                    </label>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 px-5 py-4 border-t border-rule shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-4 rounded-md border border-rule text-[13px] font-medium text-ink"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!hasChanges || isAssigning}
              className="h-9 px-4 rounded-md bg-[#0b1622] text-white text-[13px] font-medium hover:bg-ink-soft disabled:opacity-50 inline-flex items-center gap-2"
            >
              {isAssigning && (
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              Save
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default PermissionModal;
