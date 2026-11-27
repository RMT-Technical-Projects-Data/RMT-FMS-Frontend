import React, { useMemo, useState } from "react";
import { FiTrash2, FiUserPlus, FiX } from "react-icons/fi";
import UserManagement from "./UserManagement";
import { useUsers, useDeleteUser } from "../hooks/useAuth";
import type { User, ViewMode } from "../types";
import DataTable, { type DataColumn } from "./DataTable";
import {
  Card,
  CompactRow,
  Count,
  SearchBox,
  Toolbar,
  ViewSwitch,
} from "./ui";

interface UserManagementViewProps {
  user: User;
  isUserManagementOpen: boolean;
  setIsUserManagementOpen: (open: boolean) => void;
  editingUser: User | null;
  setEditingUser: (user: User | null) => void;
  onUserCreated: () => void;
  onUserManagementClose: () => void;
}

const UserManagementView: React.FC<UserManagementViewProps> = ({
  user,
  isUserManagementOpen,
  setIsUserManagementOpen,
  editingUser,
  setEditingUser,
  onUserCreated,
  onUserManagementClose,
}) => {
  const {
    data: users = [],
    isLoading: usersLoading,
    refetch: refetchUsers,
  } = useUsers();
  const deleteUser = useDeleteUser();

  const [userToDelete, setUserToDelete] = useState<{
    id: number;
    username: string;
  } | null>(null);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<ViewMode>("list");

  const handleDeleteUser = (userId: number, username: string) => {
    setUserToDelete({ id: userId, username });
  };

  const confirmDeleteUser = () => {
    if (userToDelete) {
      deleteUser.mutate(userToDelete.id, {
        onSuccess: () => {
          refetchUsers();
          setUserToDelete(null);
        },
      });
    }
  };

  const handleEditUser = (userItem: User) => {
    setEditingUser(userItem);
    setIsUserManagementOpen(true);
  };

  const handleUserManagementClose = () => {
    setEditingUser(null);
    onUserManagementClose();
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setIsUserManagementOpen(true);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.username?.toLowerCase().includes(q) ||
        u.role?.toLowerCase().includes(q)
    );
  }, [users, search]);

  const roleTag = (role: string) => (
    <span
      className={`inline-flex px-2 py-0.5 rounded text-xs font-medium border ${
        role === "super_admin"
          ? "bg-[#f8e8f1] text-[#a3306f] border-[#e8c0d6]"
          : "bg-[#f3f1ea] text-ink border-rule"
      }`}
    >
      {role?.replace(/_/g, " ")}
    </span>
  );

  const columns: DataColumn<User>[] = [
    {
      key: "username",
      title: "Name",
      dataIndex: "username",
      render: (r) => (
        <span className="font-medium">
          {r.username}
          {r.id === user.id && (
            <span className="ml-2 text-xs text-brand-dark bg-[#eaf2fb] px-1.5 py-0.5 rounded">
              You
            </span>
          )}
        </span>
      ),
    },
    {
      key: "role",
      title: "Role",
      dataIndex: "role",
      render: (r) => roleTag(r.role),
    },
    {
      key: "actions",
      title: "Actions",
      sortable: false,
      align: "right",
      render: (r) => (
        <div className="inline-flex items-center gap-1">
          <button
            type="button"
            onClick={() => handleEditUser(r)}
            className="h-8 px-2.5 rounded-md border border-rule text-[13px] text-ink hover:border-brand-dark"
          >
            Edit
          </button>
          {r.id !== user.id && (
            <button
              type="button"
              onClick={() => handleDeleteUser(r.id, r.username)}
              disabled={deleteUser.isPending}
              className="h-8 px-2.5 rounded-md border border-rule text-[13px] text-[#b42318] hover:bg-[#fdecea]"
            >
              Delete
            </button>
          )}
        </div>
      ),
    },
  ];

  let body: React.ReactNode;
  if (usersLoading) {
    body = (
      <div className="bg-white border border-rule rounded-lg py-16 text-center text-sm text-muted">
        Loading users…
      </div>
    );
  } else if (view === "grid" || view === "compact") {
    body = (
      <div className="flex flex-col gap-3">
        {view === "grid" ? (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
            {filtered.map((r, i) => (
              <Card
                key={r.id}
                index={i + 1}
                title={r.username}
                tag={roleTag(r.role)}
                lines={[["Role", r.role?.replace(/_/g, " ")]]}
                footer={
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleEditUser(r)}
                      className="text-brand-dark hover:underline"
                    >
                      Edit
                    </button>
                    {r.id !== user.id && (
                      <button
                        type="button"
                        onClick={() => handleDeleteUser(r.id, r.username)}
                        className="text-[#b42318] hover:underline"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                }
              />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-rule rounded-lg overflow-hidden">
            <ul className="divide-y divide-[#eeeae1]">
              {filtered.map((r, i) => (
                <CompactRow
                  key={r.id}
                  index={i + 1}
                  title={r.username}
                  tag={roleTag(r.role)}
                  lines={[["Role", r.role?.replace(/_/g, " ")]]}
                />
              ))}
            </ul>
          </div>
        )}
        {!filtered.length && (
          <p className="bg-white border border-rule rounded-lg py-12 text-center text-sm text-muted">
            No users found.
          </p>
        )}
      </div>
    );
  } else {
    body = (
      <DataTable
        rowKey="id"
        columns={columns}
        dataSource={filtered}
        emptyText="No users found. Add a user to get started."
      />
    );
  }

  return (
    <>
      <div className="flex flex-col gap-5 min-w-0">
        <Toolbar
          actions={
            <>
              <ViewSwitch value={view} onChange={setView} />
              <button
                type="button"
                onClick={handleAddUser}
                className="h-8 px-3 rounded-md bg-ink text-white text-[13px] font-medium inline-flex items-center gap-1.5 hover:bg-ink-soft"
              >
                <FiUserPlus size={14} />
                Add User
              </button>
            </>
          }
        >
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder="Search users"
          />
          <Count
            shown={filtered.length}
            total={users.length}
            noun="users"
          />
        </Toolbar>
        {body}
      </div>

      <UserManagement
        isOpen={isUserManagementOpen}
        onClose={handleUserManagementClose}
        onUserCreated={onUserCreated}
        editingUser={editingUser}
        currentUser={user}
      />

      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="fixed inset-0 bg-ink/40"
            aria-label="Close dialog"
            onClick={() => setUserToDelete(null)}
          />
          <div className="relative bg-white rounded-lg shadow-xl border border-rule w-full max-w-md">
            <div className="flex items-center justify-between px-5 h-14 border-b border-rule">
              <div className="flex items-center gap-3">
                <span className="h-9 w-9 rounded-full bg-[#fdecea] text-[#b42318] flex items-center justify-center">
                  <FiTrash2 size={16} />
                </span>
                <div>
                  <h2 className="text-[15px] font-semibold">Delete User</h2>
                  <p className="text-xs text-muted">
                    This action cannot be undone
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="p-2 hover:bg-[#f3f1ea] rounded-md"
              >
                <FiX size={18} className="text-muted" />
              </button>
            </div>
            <div className="p-5">
              <p className="text-sm text-ink mb-5">
                Delete user <strong>"{userToDelete.username}"</strong>? This
                permanently removes the account.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setUserToDelete(null)}
                  className="h-10 rounded-md border border-rule text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteUser}
                  disabled={deleteUser.isPending}
                  className="h-10 rounded-md bg-[#b42318] text-white text-sm font-medium disabled:opacity-50"
                >
                  {deleteUser.isPending ? "Deleting…" : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserManagementView;
