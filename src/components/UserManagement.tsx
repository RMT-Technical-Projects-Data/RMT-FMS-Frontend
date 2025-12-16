// components/UserManagement.tsx
import React, { useState, useEffect } from "react";
import { useCreateUser, useUpdateUser } from "../hooks/useAuth";
import { Dialog } from "@headlessui/react";
import {
  FiUserPlus,
  FiX,
  FiUser,
  FiShield,
  FiEye,
  FiEyeOff,
  FiInfo,
} from "react-icons/fi";
import type { User } from "../types";

interface UserManagementProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: () => void;
  editingUser?: User | null;
  currentUser?: User;
}

const UserManagement: React.FC<UserManagementProps> = ({
  isOpen,
  onClose,
  onUserCreated,
  editingUser,
  currentUser,
}) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [role, setRole] = useState<"super_admin" | "user">("user");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const createUser = useCreateUser();
  const updateUser = useUpdateUser();

  // Check if editing current user
  const isEditingSelf =
    editingUser && currentUser && editingUser.id === currentUser.id;

  // Validate password
  const validatePassword = (pwd: string): boolean => {
    const hasUpper = /[A-Z]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd);
    return hasUpper && hasLower && hasSpecial && pwd.length >= 8;
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    if (newPassword) {
      if (!validatePassword(newPassword)) {
        setPasswordError(
          "Password must contain at least one uppercase letter, one lowercase letter, one special character, and be at least 8 characters long."
        );
      } else {
        setPasswordError("");
      }
    } else {
      setPasswordError("");
    }
  };

  // Reset form when editingUser changes
  useEffect(() => {
    if (editingUser) {
      setUsername(editingUser.username);
      setPassword("");
      setPasswordError("");
      setRole(editingUser.role as "super_admin" | "user");
    } else {
      setUsername("");
      setPassword("");
      setPasswordError("");
      setRole("user");
    }
    setShowPassword(false);
  }, [editingUser]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    if (password && passwordError) {
      return; // Prevent submit if password error
    }

    if (editingUser) {
      // Update existing user
      updateUser.mutate(
        {
          id: editingUser.id,
          username,
          password: password || undefined,
          role: isEditingSelf ? currentUser!.role : role, // Don't allow role change for self
        },
        {
          onSuccess: () => {
            onUserCreated();
            onClose();
          },
          onError: (error: any) => {
            setError(error.response?.data?.message || "Failed to update user");
          },
        }
      );
    } else {
      // Create new user
      createUser.mutate(
        { username, password, role },
        {
          onSuccess: () => {
            onUserCreated();
            onClose();
          },
          onError: (error: any) => {
            setError(error.response?.data?.message || "Failed to create user\nthe username already exist");
          },
        }
      );
    }
  };

  const handleClose = () => {
    setUsername("");
    setPassword("");
    setPasswordError("");
    setRole("user");
    setShowPassword(false);
    setError("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        aria-hidden="true"
      />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FiUserPlus className="text-blue-600" size={20} />
              </div>
              <div>
                <Dialog.Title className="text-xl font-bold text-gray-900">
                  {editingUser ? "Edit User" : "Create New User"}
                </Dialog.Title>
                <p className="text-sm text-gray-500">
                  {editingUser
                    ? "Update user details"
                    : "Add a new user to the system"}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiX size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6" autoComplete="off">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <FiInfo
                    className="text-red-600 mt-0.5 flex-shrink-0"
                    size={16}
                  />
                  <div>
                    <p className="text-sm text-red-800 font-medium">
                      Error
                    </p>
                    <p className="text-xs text-red-700 mt-1">
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {isEditingSelf && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <FiInfo
                    className="text-blue-600 mt-0.5 flex-shrink-0"
                    size={16}
                  />
                  <div>
                    <p className="text-sm text-blue-800 font-medium">
                      Editing Your Own Account
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                      You cannot change your own role for security reasons.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Username
                </label>
                <div className="relative">
                  <FiUser
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Enter username"
                    required
                    autoComplete="off"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Password
                  {editingUser && (
                    <span className="text-xs text-gray-500 ml-2">
                      (Leave blank to keep current password)
                    </span>
                  )}
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={handlePasswordChange}
                    className={`w-full pr-10 pl-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${passwordError
                        ? "border-red-500 focus:border-red-500"
                        : "border border-gray-200 focus:border-blue-500"
                      }`}
                    placeholder={
                      editingUser ? "Enter new password" : "Enter password"
                    }
                    required={!editingUser}
                    minLength={8}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <FiEyeOff size={18} />
                    ) : (
                      <FiEye size={18} />
                    )}
                  </button>
                </div>
                {passwordError && (
                  <p className="mt-1 text-sm text-red-600">{passwordError}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="role"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Role
                  {isEditingSelf && (
                    <span className="text-xs text-gray-500 ml-2">
                      (Cannot change your own role)
                    </span>
                  )}
                </label>
                <div className="relative">
                  <FiShield
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <select
                    id="role"
                    value={role}
                    onChange={(e) =>
                      setRole(e.target.value as "super_admin" | "user")
                    }
                    disabled={!!isEditingSelf}
                    className={`w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white ${isEditingSelf
                        ? "bg-gray-50 text-gray-500 cursor-not-allowed"
                        : ""
                      }`}
                  >
                    <option value="user">User</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  createUser.isPending ||
                  updateUser.isPending ||
                  !!passwordError
                }
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createUser.isPending || updateUser.isPending ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{editingUser ? "Updating..." : "Creating..."}</span>
                  </div>
                ) : editingUser ? (
                  "Update User"
                ) : (
                  "Create User"
                )}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default UserManagement;
