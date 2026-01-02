import React, { useEffect, useMemo, useState } from "react";
import { Dialog } from "@headlessui/react";
import { useUsers } from "../hooks/useAuth";
import { useAssignPermission, useResourcePermissions, useRemovePermission } from "../hooks/usePermissions";
import type { User } from "../types";
import { FiKey, FiX, FiEye, FiDownload } from "react-icons/fi";
import { useQueryClient } from "@tanstack/react-query";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface PermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  resourceId: number;
  resourceType: "folder" | "file";
  showToast?: (message: string, type: "success" | "error" | "info" | "warning") => void;
}

const TOAST_DURATION_MS = 3000;

const PermissionModal: React.FC<PermissionModalProps> = ({
  isOpen,
  onClose,
  resourceId,
  resourceType,
  showToast,
}) => {
  const { data: users } = useUsers();
  const assignPermission = useAssignPermission();
  const removePermission = useRemovePermission();
  const { data: resourcePermissions } = useResourcePermissions(resourceId, resourceType);
  const queryClient = useQueryClient();

  // ---------------------------
  // Canonical users: exclude super admins ALWAYS
  // Normalize ids to Number, support `id` or `_id`, dedupe, sort ascending
  // ---------------------------
  const availableUsers: User[] = useMemo(() => {
    const raw = (users ?? []).filter(Boolean);

    // helper to normalize role string and identify super-admin variants
    const isSuperAdminRole = (role: any) => {
      if (!role && role !== "") return false;
      const r = String(role).toLowerCase().replace(/\s+/g, "");
      return r === "superadmin" || r === "super_admin" || r === "superadmin";
    };

    const map = new Map<number, User>();

    for (const u of raw) {
      // Accept either u.id or u._id
      const rawId = (u as any).id ?? (u as any)._id;
      const idNum = Number(rawId);

      if (!Number.isFinite(idNum)) continue;

      const role = (u as any).role ?? "";
      if (isSuperAdminRole(role)) continue; // ALWAYS exclude super admin

      // preserve username/name and other fields, but normalize id to number
      const normalized: any = { ...u, id: idNum };

      // dedupe by numeric id
      map.set(idNum, normalized as User);
    }

    return Array.from(map.values()).sort((a, b) => Number(a.id) - Number(b.id));
  }, [users]);

  // quick lookup of allowed ids (never includes super_admin ids)
  const availableUserIdSet = useMemo(() => new Set(availableUsers.map((u) => Number((u as any).id))), [availableUsers]);

  // Tab state
  const [activeTab, setActiveTab] = useState<"none" | "view" | "view_download">("none");

  // state: selected user ids (numbers only)
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [originalSelectedUsers, setOriginalSelectedUsers] = useState<number[] | null>(null);

  const [permissions, setPermissions] = useState({ can_read: false, can_download: false });
  const [initialPermissions, setInitialPermissions] = useState<{ can_read: boolean; can_download: boolean } | null>(null);

  // Filter users into categories based on CURRENT permissions
  const { noPermissionUsers, viewOnlyUsers, viewDownloadUsers } = useMemo(() => {
    const noPerms: User[] = [];
    const viewOnly: User[] = [];
    const viewDownload: User[] = [];

    availableUsers.forEach((user) => {
      // Find current permission for this user
      const idNum = Number((user as any).id);
      const perm = (resourcePermissions as any[])?.find(
        (p) => Number((p as any).user_id ?? (p as any).userId) === idNum
      );

      const canRead = !!perm?.can_read;
      const canDownload = !!perm?.can_download;

      if (canRead && canDownload) {
        viewDownload.push(user);
      } else if (canRead) {
        viewOnly.push(user);
      } else {
        noPerms.push(user);
      }
    });

    return {
      noPermissionUsers: noPerms,
      viewOnlyUsers: viewOnly,
      viewDownloadUsers: viewDownload,
    };
  }, [availableUsers, resourcePermissions]);

  // Handle Tab Change
  const handleTabChange = (tab: "none" | "view" | "view_download") => {
    setActiveTab(tab);
    setSelectedUsers([]); // Clear selection on tab switch
  };

  const usersDisplay =
    activeTab === "view_download"
      ? viewDownloadUsers
      : activeTab === "view"
        ? viewOnlyUsers
        : noPermissionUsers;

  const notify = (message: string, type: "success" | "error" | "info" | "warning") => {
    toast.dismiss();
    if (showToast) {
      try { showToast(message, type); } catch { }
    }
    if (type === "success") toast.success(message, { autoClose: TOAST_DURATION_MS });
    else if (type === "error") toast.error(message, { autoClose: TOAST_DURATION_MS });
    else if (type === "info") toast.info(message, { autoClose: TOAST_DURATION_MS });
    else toast.warn(message, { autoClose: TOAST_DURATION_MS });
  };

  const isAssigning =
    (assignPermission as any).isLoading ||
    (assignPermission as any).isPending ||
    (assignPermission as any).status === "loading" ||
    (removePermission as any).isLoading ||
    (removePermission as any).isPending ||
    (removePermission as any).status === "loading";

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedUsers([]);
      setOriginalSelectedUsers(null);
      setPermissions({ can_read: false, can_download: false });
      setInitialPermissions(null);
      setActiveTab("none");
    }
  }, [isOpen]);

  // Build initial ORIGINAL selected users for change tracking, but start with EMPTY selection
  useEffect(() => {
    if (!isOpen || !resourcePermissions) return;

    // Extract user_id from permissions, coerce to number, dedupe
    const idsFromPerms = Array.from(
      new Set(
        (resourcePermissions as any[])
          .filter((p) => p && (p.can_read || p.can_download))
          .map((p) => Number((p as any).user_id ?? (p as any).userId ?? (p as any).user_id))
      )
    )
      .filter((id) => Number.isFinite(id) && availableUserIdSet.has(id))
      .sort((a, b) => a - b);

    setOriginalSelectedUsers(idsFromPerms);
    // CRITICAL: Do NOT set selectedUsers here. Start with empty selection so users must explicitly select who to modify.
    // This prevents accidental modification of users hidden in other tabs.
    // setSelectedUsers(idsFromPerms); 

    setPermissions({ can_read: false, can_download: false });
    setInitialPermissions(null);
  }, [isOpen, resourcePermissions, availableUserIdSet]);

  // When selection changes, ensure only valid ids remain and compute permissions snapshot
  useEffect(() => {
    if (!resourcePermissions) return;

    // Purge invalid ids that might somehow have slipped in
    const validSelected = selectedUsers.filter((id) => availableUserIdSet.has(Number(id)));
    if (validSelected.length !== selectedUsers.length) setSelectedUsers(validSelected);

    if (validSelected.length === 1) {
      const userId = validSelected[0];
      const perm = (resourcePermissions as any[]).find((p) => Number((p as any).user_id ?? (p as any).userId) === userId);
      const snapshot = perm ? { can_read: !!perm.can_read, can_download: !!perm.can_download } : { can_read: false, can_download: false };
      setPermissions(snapshot);
      setInitialPermissions(snapshot);
    } else if (validSelected.length > 1) {
      const allCanRead = validSelected.every((userId) => {
        const perm = (resourcePermissions as any[]).find((p) => Number((p as any).user_id ?? (p as any).userId) === userId);
        return perm?.can_read ?? false;
      });
      const allCanDownload = validSelected.every((userId) => {
        const perm = (resourcePermissions as any[]).find((p) => Number((p as any).user_id ?? (p as any).userId) === userId);
        return perm?.can_download ?? false;
      });
      const snap = { can_read: allCanRead, can_download: allCanRead && allCanDownload };
      setPermissions(snap);
      setInitialPermissions(snap);
    } else {
      setInitialPermissions(null);
      setPermissions({ can_read: false, can_download: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUsers, resourcePermissions, availableUserIdSet]);

  const anyPermissionSet = useMemo(() => permissions.can_read || permissions.can_download, [permissions]);

  const selectedUsersChanged = useMemo(() => {
    if (!originalSelectedUsers) return selectedUsers.length > 0;
    if (originalSelectedUsers.length !== selectedUsers.length) return true;
    const orig = new Set(originalSelectedUsers);
    for (const id of selectedUsers) if (!orig.has(id)) return true;
    return false;
  }, [selectedUsers, originalSelectedUsers]);

  const permissionsChanged = useMemo(() => {
    if (!initialPermissions) return selectedUsers.length > 0 && anyPermissionSet;
    return permissions.can_read !== initialPermissions.can_read || permissions.can_download !== initialPermissions.can_download;
  }, [permissions, initialPermissions, selectedUsers.length, anyPermissionSet]);

  const hasPermissionsChanged = selectedUsersChanged || permissionsChanged;

  const hasNewSelectedUsers = useMemo(() => {
    if (!originalSelectedUsers) return selectedUsers.length > 0;
    const orig = new Set(originalSelectedUsers);
    return selectedUsers.some((id) => !orig.has(id));
  }, [selectedUsers, originalSelectedUsers]);

  // Toggle user selection — only allowed ids from availableUserIdSet
  const toggleUser = (userIdRaw: number | string) => {
    const userId = Number(userIdRaw);
    if (!Number.isFinite(userId) || !availableUserIdSet.has(userId)) return;
    setSelectedUsers((prev) => {
      const s = new Set(prev);
      if (s.has(userId)) s.delete(userId);
      else s.add(userId);
      return Array.from(s).sort((a, b) => a - b);
    });
  };

  const handlePermissionChange = (key: string, checked: boolean) => {
    const newPerms = { ...permissions, [key]: checked } as typeof permissions;
    if (key === "can_read" && !checked) newPerms.can_download = false;
    setPermissions(newPerms);
  };

  // Submit: ONLY apply changes to currently selected users
  const handleSubmit = async () => {
    if (!hasPermissionsChanged) {
      notify("No changes made to permissions", "info");
      onClose();
      return;
    }

    // Only operate on users currently selected and available in the list
    const currentSet = new Set(selectedUsers.filter((id) => availableUserIdSet.has(id)));

    const toRemove: number[] = [];
    const toAssign: number[] = [];

    currentSet.forEach((id) => {
      // If no permissions selected (both false), treat as removal for this user
      if (!permissions.can_read && !permissions.can_download) {
        toRemove.push(id);
      } else {
        toAssign.push(id);
      }
    });

    // Remove duplicates (though Set handles this, strict safety)
    const uniqueAssign = Array.from(new Set(toAssign));
    const uniqueRemove = Array.from(new Set(toRemove));

    const assignPromises = uniqueAssign.map((user_id) =>
      (assignPermission as any).mutateAsync({ user_id, resource_id: resourceId, resource_type: resourceType, ...permissions })
    );

    const removePromises = uniqueRemove.map((user_id) =>
      (removePermission as any).mutateAsyncByUser
        ? (removePermission as any).mutateAsyncByUser({ user_id, resource_id: resourceId, resource_type: resourceType })
        : (async () => {
          const permObj = (resourcePermissions as any[])?.find((p) => Number((p as any).user_id ?? (p as any).userId) === user_id);
          if (permObj && permObj.id) return (removePermission as any).mutateAsync(permObj.id);
          // Fallback if no ID found but we want to "remove" (revoke all)
          return (assignPermission as any).mutateAsync({ user_id, resource_id: resourceId, resource_type: resourceType, can_read: false, can_download: false });
        })()
    );

    try {
      const settled = await Promise.allSettled([...assignPromises, ...removePromises]);
      const rejects = settled.filter((r) => r.status === "rejected");
      if (rejects.length === 0) notify("Permissions updated successfully", "success");
      else notify(`Failed to update permissions for ${rejects.length} user(s)`, "error");

      await queryClient.invalidateQueries({ queryKey: ["permissions", resourceId, resourceType] });

      setTimeout(() => onClose(), TOAST_DURATION_MS + 200);
    } catch (err) {
      console.error("Permission update error:", err);
      notify("Failed to update permissions", "error");
      setTimeout(() => onClose(), TOAST_DURATION_MS + 200);
    }
  };

  const permissionOptions = [
    { key: "can_read", label: "View", icon: FiEye, description: "Can view this resource" },
    { key: "can_download", label: "Download", icon: FiDownload, description: "Can download this resource" },
  ];

  const getCurrentPermissionsText = () => {
    if (selectedUsers.length > 1) {
      const granted: string[] = [];
      if (permissions.can_read) granted.push("View");
      if (permissions.can_download) granted.push("Download");
      return `${selectedUsers.length} users selected • ${granted.length ? granted.join(", ") : "No permissions granted"}`;
    }
    const granted: string[] = [];
    if (permissions.can_read) granted.push("View");
    if (permissions.can_download) granted.push("Download");
    return granted.length ? granted.join(", ") : "No permissions granted";
  };

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={TOAST_DURATION_MS}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        limit={1}
        style={{ zIndex: 999999 }}
      />

      <Dialog open={isOpen} onClose={onClose} className="relative z-50">
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-2xl shadow-2xl transform transition-all flex flex-col max-w-sm w-full max-h-[80vh]">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-purple-100 rounded-lg"><FiKey className="text-purple-600" size={16} /></div>
                <div>
                  <Dialog.Title className="text-lg font-bold text-gray-900">Assign Permissions</Dialog.Title>
                  <p className="text-xs text-gray-500">Set permissions for {resourceType}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"><FiX size={16} /></button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => handleTabChange("none")}
                className={`flex-1 py-3 text-sm font-medium text-center border-b-2 transition-colors ${activeTab === "none"
                  ? "border-purple-600 text-purple-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
              >
                No Permissions
                <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                  {noPermissionUsers.length}
                </span>
              </button>
              <button
                onClick={() => handleTabChange("view")}
                className={`flex-1 py-3 text-sm font-medium text-center border-b-2 transition-colors ${activeTab === "view"
                  ? "border-purple-600 text-purple-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
              >
                View Permissions
                <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                  {viewOnlyUsers.length}
                </span>
              </button>
              <button
                onClick={() => handleTabChange("view_download")}
                className={`flex-1 py-3 text-sm font-medium text-center border-b-2 transition-colors ${activeTab === "view_download"
                  ? "border-purple-600 text-purple-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
              >
                View & Download
                <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                  {viewDownloadUsers.length}
                </span>
              </button>
            </div>

            <div className="p-4 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Select User</label>
                <div className="relative">
                  <div className="mt-1">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 max-h-64 overflow-auto">
                      <div className="p-2 space-y-1">
                        {usersDisplay.map((u) => {
                          const idNum = Number((u as any).id);
                          const checked = selectedUsers.includes(idNum);
                          return (
                            <label key={idNum} className="flex items-center justify-between p-2 rounded hover:bg-gray-50 cursor-pointer">
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => toggleUser(idNum)}
                                  className="mt-0.5 text-purple-600 focus:ring-purple-500 rounded"
                                />
                                <div className="text-sm">
                                  <div className="font-medium text-gray-900">{(u as any).username ?? (u as any).name ?? `User ${idNum}`}</div>
                                  <div className="text-xs text-gray-500">{(u as any).role ?? "user"}</div>
                                </div>
                              </div>
                            </label>
                          );
                        })}
                        {usersDisplay.length === 0 && <div className="text-xs text-gray-500 p-2 text-center">No users in this category</div>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {selectedUsers.length > 0 && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-xs font-medium text-gray-700 mb-1">Current Permissions:</div>
                  <div className="text-sm text-gray-600">{getCurrentPermissionsText()}</div>
                  {!permissionsChanged && initialPermissions && selectedUsers.length === 1 && (
                    <div className="text-xs text-purple-600 mt-1 font-medium">• No changes made</div>
                  )}
                </div>
              )}

              {selectedUsers.length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Permissions</label>
                  <div className="space-y-2">
                    {permissionOptions.map(({ key, label, icon: Icon, description }) => {
                      if (key === "can_download" && !permissions.can_read) return null;
                      return (
                        <label key={key} className="flex items-start space-x-2 p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer">
                          <input
                            type="checkbox"
                            checked={permissions[key as keyof typeof permissions]}
                            onChange={(e) => handlePermissionChange(key, e.target.checked)}
                            className="mt-0.5 text-purple-600 focus:ring-purple-500 rounded"
                          />
                          <div className="flex-1">
                            <div className="flex items-center space-x-1.5"><Icon size={14} className="text-gray-600" /><span className="text-sm font-medium text-gray-900">{label}</span></div>
                            <p className="text-xs text-gray-500 mt-0.5">{description}</p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2 p-4 border-t border-gray-100 flex-shrink-0">
              <button onClick={onClose} className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">Cancel</button>
              <button
                onClick={handleSubmit}
                disabled={!hasPermissionsChanged || isAssigning || (hasNewSelectedUsers && !permissions.can_read)}
                className="px-4 py-2 text-sm bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAssigning ? (
                  <div className="flex items-center space-x-1.5">
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </div>
                ) : "Save"}
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
};

export default PermissionModal;
