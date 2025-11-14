// import React, { useState, useEffect, useMemo } from "react";
// import { Dialog } from "@headlessui/react";
// import { useUsers } from "../hooks/useAuth";
// import {
//   useAssignPermission,
//   useResourcePermissions,
//   useRemovePermission,
// } from "../hooks/usePermissions";
// import type { User } from "../types";
// import { FiKey, FiX, FiEye, FiDownload } from "react-icons/fi";
// import { useQueryClient } from "@tanstack/react-query";

// // === react-toastify imports ===
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// // =============================

// interface PermissionModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   resourceId: number;
//   resourceType: "folder" | "file";
//   showToast?: (
//     message: string,
//     type: "success" | "error" | "info" | "warning"
//   ) => void;
// }

// const PermissionModal: React.FC<PermissionModalProps> = ({
//   isOpen,
//   onClose,
//   resourceId,
//   resourceType,
//   showToast,
// }) => {
//   const { data: users } = useUsers();
//   const assignPermission = useAssignPermission();
//   const removePermission = useRemovePermission();
//   const { data: resourcePermissions } = useResourcePermissions(
//     resourceId,
//     resourceType
//   );
//   const queryClient = useQueryClient();

//   // selected users in UI (checkboxes)
//   const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
//   // snapshot of users who had permissions when modal opened (used to detect removals)
//   const [originalSelectedUsers, setOriginalSelectedUsers] = useState<number[] | null>(null);

//   // permissions toggles (applies to currently selected users)
//   const [permissions, setPermissions] = useState({
//     can_read: false,
//     can_download: false,
//   });

//   // initialPermissions snapshot (common permissions for original selection)
//   const [initialPermissions, setInitialPermissions] = useState<{
//     can_read: boolean;
//     can_download: boolean;
//   } | null>(null);

//   // derive a helper to show toasts — prefer provided showToast (kept for compatibility),
//   // but **also** always call react-toastify so we actually display a toast.
//   const notify = (message: string, type: "success" | "error" | "info" | "warning") => {
//     // ensure only a single toast is visible
//     toast.dismiss();

//     // call optional parent handler (keeps existing behavior if parent provided one)
//     if (showToast) {
//       try {
//         showToast(message, type);
//       } catch (err) {
//         // swallow errors from external handler
//         // (we still show the toast below)
//       }
//     }

//     // always show a react-toastify toast so user sees it
//     if (type === "success") toast.success(message);
//     else if (type === "error") toast.error(message);
//     else if (type === "info") toast.info(message);
//     else toast.warn(message);
//   };

//   // Detect assign/remove mutation state (compat for different react-query versions)
//   const isAssigning =
//     (assignPermission as any).isLoading ||
//     (assignPermission as any).isPending ||
//     (assignPermission as any).status === "loading" ||
//     (removePermission as any).isLoading ||
//     (removePermission as any).isPending ||
//     (removePermission as any).status === "loading";

//   // Reset state when modal opens
//   useEffect(() => {
//     if (isOpen) {
//       setSelectedUsers([]);
//       setOriginalSelectedUsers(null);
//       setPermissions({ can_read: false, can_download: false });
//       setInitialPermissions(null);
//     }
//   }, [isOpen]);

//   // When permissions are fetched and modal opened, compute original selected users and set UI
//   useEffect(() => {
//     if (!isOpen || !resourcePermissions) return;

//     const preselectedUserIds = Array.from(
//       new Set(
//         resourcePermissions
//           .filter((perm) => perm.can_read || perm.can_download)
//           .map((perm) => perm.user_id)
//       )
//     ).sort((a, b) => a - b);

//     // store original set so we can compute removals on save
//     setOriginalSelectedUsers(preselectedUserIds);

//     // If nothing selected by user yet, set selectedUsers to preselected users
//     setSelectedUsers(preselectedUserIds);

//     // compute common permissions across preselected users
//     if (preselectedUserIds.length > 0) {
//       const allCanRead = preselectedUserIds.every((userId) => {
//         const perm = resourcePermissions.find((p) => p.user_id === userId);
//         return perm?.can_read ?? false;
//       });
//       const allCanDownload = preselectedUserIds.every((userId) => {
//         const perm = resourcePermissions.find((p) => p.user_id === userId);
//         return perm?.can_download ?? false;
//       });

//       const snapshot = {
//         can_read: allCanRead,
//         can_download: allCanRead && allCanDownload,
//       };
//       setPermissions(snapshot);
//       setInitialPermissions(snapshot);
//     } else {
//       setPermissions({ can_read: false, can_download: false });
//       setInitialPermissions(null);
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [isOpen, resourcePermissions]);

//   // When selection changes, load permissions for single selection or compute common permissions for multiple
//   useEffect(() => {
//     if (!resourcePermissions) return;

//     if (selectedUsers.length === 1) {
//       const userId = selectedUsers[0];
//       const existingPermission = resourcePermissions.find((p) => p.user_id === userId);
//       const perm = existingPermission
//         ? { can_read: !!existingPermission.can_read, can_download: !!existingPermission.can_download }
//         : { can_read: false, can_download: false };
//       setPermissions(perm);
//       setInitialPermissions(perm);
//     } else if (selectedUsers.length > 1) {
//       const allCanRead = selectedUsers.every((userId) => {
//         const perm = resourcePermissions.find((p) => p.user_id === userId);
//         return perm?.can_read ?? false;
//       });
//       const allCanDownload = selectedUsers.every((userId) => {
//         const perm = resourcePermissions.find((p) => p.user_id === userId);
//         return perm?.can_download ?? false;
//       });
//       const snapshot = {
//         can_read: allCanRead,
//         can_download: allCanRead && allCanDownload,
//       };
//       setPermissions(snapshot);
//       setInitialPermissions(snapshot);
//     } else {
//       // zero selected: clear initialPermissions to indicate no baseline
//       setInitialPermissions(null);
//       setPermissions({ can_read: false, can_download: false });
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [selectedUsers, resourcePermissions]);

//   // helper: check if permission toggles are any true
//   const anyPermissionSet = useMemo(
//     () => permissions.can_read || permissions.can_download,
//     [permissions]
//   );

//   // Determine whether the Save button should be enabled:
//   // - if selectedUsers differ from originalSelectedUsers (users added/removed)
//   // - OR if permissions differ from initialPermissions
//   const selectedUsersChanged = useMemo(() => {
//     if (!originalSelectedUsers) {
//       // if there were no original users, any selected user is a change only if any permission is set
//       return selectedUsers.length > 0;
//     }
//     if (originalSelectedUsers.length !== selectedUsers.length) return true;
//     // compare sets
//     const origSet = new Set(originalSelectedUsers);
//     for (const id of selectedUsers) {
//       if (!origSet.has(id)) return true;
//     }
//     return false;
//   }, [selectedUsers, originalSelectedUsers]);

//   const permissionsChanged = useMemo(() => {
//     if (!initialPermissions) {
//       // If there was no baseline, consider changed only if any permission is set (and at least one selected)
//       return selectedUsers.length > 0 && anyPermissionSet;
//     }
//     return (
//       permissions.can_read !== initialPermissions.can_read ||
//       permissions.can_download !== initialPermissions.can_download
//     );
//   }, [permissions, initialPermissions, selectedUsers.length, anyPermissionSet]);

//   const hasPermissionsChanged = selectedUsersChanged || permissionsChanged;

//   // toggle user checkbox
//   const toggleUser = (userId: number) => {
//     setSelectedUsers((prev) =>
//       prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
//     );
//   };

//   const handlePermissionChange = (key: string, checked: boolean) => {
//     const newPermissions = { ...permissions, [key]: checked };
//     if (key === "can_read" && !checked) {
//       newPermissions.can_download = false;
//     }
//     setPermissions(newPermissions);
//   };

//   // Save: decide which users to assign / remove
//   const handleSubmit = async () => {
//     // nothing selected and nothing changed -> no-op
//     if (!hasPermissionsChanged) {
//       notify("No changes made to permissions", "info");
//       onClose();
//       return;
//     }

//     // Build lists:
//     const original = new Set(originalSelectedUsers ?? []);
//     const current = new Set(selectedUsers);

//     const usersToRemove: number[] = [];
//     const usersToAssign: number[] = [];

//     // Users removed from selection -> remove perms
//     if (original.size > 0) {
//       original.forEach((userId) => {
//         if (!current.has(userId)) usersToRemove.push(userId);
//       });
//     }

//     // For current selected users: if any permission toggles set -> assign, if none -> remove (if existed before)
//     current.forEach((userId) => {
//       if (permissions.can_read || permissions.can_download) {
//         usersToAssign.push(userId);
//       } else {
//         // no permissions selected for this user: if they previously had permissions, remove
//         if (original.has(userId)) usersToRemove.push(userId);
//         // if they didn't have permissions before and no permissions now, do nothing (no API call)
//       }
//     });

//     // Create unique lists (avoid duplicates)
//     const uniqueToAssign = Array.from(new Set(usersToAssign));
//     const uniqueToRemove = Array.from(new Set(usersToRemove));

//     // Prepare API calls
//     const assignPromises = uniqueToAssign.map((user_id) =>
//       (assignPermission as any).mutateAsync({
//         user_id,
//         resource_id: resourceId,
//         resource_type: resourceType,
//         ...permissions,
//       })
//     );

//     const removePromises = uniqueToRemove.map((user_id) =>
//       (removePermission as any).mutateAsyncByUser
//         ? // optional helper (not required) — we supply {user_id} and remove API should support identifying permission by user/resource.
//           (removePermission as any).mutateAsyncByUser({
//             user_id,
//             resource_id: resourceId,
//             resource_type: resourceType,
//           })
//         : // fallback: mutateAsync with permission_id not available — our API exposes remove by permission_id.
//           // If API only allows remove by permission_id, we need to find permission ids from resourcePermissions.
//           (async () => {
//             // find permission object for that user in resourcePermissions
//             const permObj = resourcePermissions?.find((p) => p.user_id === user_id);
//             if (permObj && (permObj as any).id) {
//               return (removePermission as any).mutateAsync((permObj as any).id);
//             }
//             // As fallback: call assign endpoint with all false to force overwrite or deletion (depends on backend)
//             return (assignPermission as any).mutateAsync({
//               user_id,
//               resource_id: resourceId,
//               resource_type: resourceType,
//               can_read: false,
//               can_download: false,
//             });
//           })()
//     );

//     // Execute all
//     try {
//       const settled = await Promise.allSettled([...assignPromises, ...removePromises]);

//       const rejects = settled.filter((r) => r.status === "rejected");
//       if (rejects.length === 0) {
//         notify("Permissions updated successfully", "success");
//       } else {
//         notify(`Failed to update permissions for ${rejects.length} user(s)`, "error");
//       }

//       // invalidate permissions query to refresh UI
//       await queryClient.invalidateQueries({
//         queryKey: ["permissions", resourceId, resourceType],
//       });

//       onClose();
//     } catch (err) {
//       console.error("Permission update error:", err);
//       notify("Failed to update permissions", "error");
//     }
//   };

//   // Permission option UI
//   const permissionOptions = [
//     {
//       key: "can_read",
//       label: "View",
//       icon: FiEye,
//       description: "Can view this resource",
//     },
//     {
//       key: "can_download",
//       label: "Download",
//       icon: FiDownload,
//       description: "Can download this resource",
//     },
//   ];

//   const getCurrentPermissionsText = () => {
//     if (selectedUsers.length > 1) {
//       const grantedPermissions: string[] = [];
//       if (permissions.can_read) grantedPermissions.push("View");
//       if (permissions.can_download) grantedPermissions.push("Download");
//       return `${selectedUsers.length} users selected • ${
//         grantedPermissions.length > 0 ? grantedPermissions.join(", ") : "No permissions granted"
//       }`;
//     }

//     const grantedPermissions: string[] = [];
//     if (permissions.can_read) grantedPermissions.push("View");
//     if (permissions.can_download) grantedPermissions.push("Download");
//     return grantedPermissions.length > 0 ? grantedPermissions.join(", ") : "No permissions granted";
//   };

//   return (
//     <>
//       {/* Mounted locally so react-toastify can render toasts even if you don't have a global ToastContainer.
//           Limit=1 and zIndex ensure a single visible toast and that it appears above the modal. */}
//       <ToastContainer
//         position="top-right"
//         autoClose={3000}
//         hideProgressBar={false}
//         newestOnTop
//         closeOnClick
//         pauseOnFocusLoss
//         draggable
//         pauseOnHover
//         limit={1}
//         style={{ zIndex: 999999 }}
//       />

//       <Dialog open={isOpen} onClose={onClose} className="relative z-50">
//         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />
//         <div className="fixed inset-0 flex items-center justify-center p-4">
//           <Dialog.Panel className="bg-white rounded-2xl shadow-2xl transform transition-all flex flex-col max-w-sm w-full max-h-[80vh]">
//             <div className="flex items-center justify-between p-4 border-b border-gray-100 flex-shrink-0">
//               <div className="flex items-center space-x-2">
//                 <div className="p-1.5 bg-purple-100 rounded-lg">
//                   <FiKey className="text-purple-600" size={16} />
//                 </div>
//                 <div>
//                   <Dialog.Title className="text-lg font-bold text-gray-900">Assign Permissions</Dialog.Title>
//                   <p className="text-xs text-gray-500">Set permissions for {resourceType}</p>
//                 </div>
//               </div>
//               <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
//                 <FiX size={16} />
//               </button>
//             </div>

//             <div className="p-4 space-y-4 overflow-y-auto flex-1">
//               {/* User list */}
//               <div>
//                 <label className="block text-xs font-medium text-gray-700 mb-2">Select User</label>
//                 <div className="relative">
//                   <div className="pl-3 mt-1">
//                     <div className="bg-white rounded-lg shadow-sm border border-gray-200 max-h-48 overflow-auto">
//                       <div className="p-2 space-y-1">
//                         {users
//                           ?.filter((u: User) => u.role !== "super_admin")
//                           .map((u: User) => {
//                             const checked = selectedUsers.includes(u.id);
//                             return (
//                               <label key={u.id} className="flex items-center justify-between p-2 rounded hover:bg-gray-50 cursor-pointer">
//                                 <div className="flex items-center space-x-2">
//                                   <input
//                                     type="checkbox"
//                                     checked={checked}
//                                     onChange={() => toggleUser(u.id)}
//                                     className="mt-0.5 text-purple-600 focus:ring-purple-500 rounded"
//                                   />
//                                   <div className="text-sm">
//                                     <div className="font-medium text-gray-900">{u.username}</div>
//                                     <div className="text-xs text-gray-500">{u.role}</div>
//                                   </div>
//                                 </div>
//                               </label>
//                             );
//                           })}
//                         {users?.filter((u: User) => u.role !== "super_admin").length === 0 && (
//                           <div className="text-xs text-gray-500 p-2">No users available</div>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Current Permissions Display */}
//               {selectedUsers.length > 0 && (
//                 <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
//                   <div className="text-xs font-medium text-gray-700 mb-1">Current Permissions:</div>
//                   <div className="text-sm text-gray-600">{getCurrentPermissionsText()}</div>
//                   {!permissionsChanged && initialPermissions && selectedUsers.length === 1 && (
//                     <div className="text-xs text-purple-600 mt-1 font-medium">• No changes made</div>
//                   )}
//                 </div>
//               )}

//               {/* Permissions toggles */}
//               {selectedUsers.length > 0 && (
//                 <div>
//                   <label className="block text-xs font-medium text-gray-700 mb-2">Permissions</label>
//                   <div className="space-y-2">
//                     {permissionOptions.map(({ key, label, icon: Icon, description }) => {
//                       if (key === "can_download" && !permissions.can_read) return null;
//                       return (
//                         <label key={key} className="flex items-start space-x-2 p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer">
//                           <input
//                             type="checkbox"
//                             checked={permissions[key as keyof typeof permissions]}
//                             onChange={(e) => handlePermissionChange(key, e.target.checked)}
//                             className="mt-0.5 text-purple-600 focus:ring-purple-500 rounded"
//                           />
//                           <div className="flex-1">
//                             <div className="flex items-center space-x-1.5">
//                               <Icon size={14} className="text-gray-600" />
//                               <span className="text-sm font-medium text-gray-900">{label}</span>
//                             </div>
//                             <p className="text-xs text-gray-500 mt-0.5">{description}</p>
//                           </div>
//                         </label>
//                       );
//                     })}
//                   </div>
//                 </div>
//               )}
//             </div>

//             <div className="flex justify-end space-x-2 p-4 border-t border-gray-100 flex-shrink-0">
//               <button onClick={onClose} className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
//                 Cancel
//               </button>
//               <button
//                 onClick={handleSubmit}
//                 disabled={!hasPermissionsChanged || isAssigning}
//                 className="px-4 py-2 text-sm bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 {isAssigning ? (
//                   <div className="flex items-center space-x-1.5">
//                     <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                     <span>Saving...</span>
//                   </div>
//                 ) : (
//                   "Save"
//                 )}
//               </button>
//             </div>
//           </Dialog.Panel>
//         </div>
//       </Dialog>
//     </>
//   );
// };

// export default PermissionModal;
import React, { useState, useEffect, useMemo } from "react";
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

// === react-toastify imports ===
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// =============================

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

const TOAST_DURATION_MS = 3000; // matches ToastContainer autoClose

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
  const { data: resourcePermissions } = useResourcePermissions(
    resourceId,
    resourceType
  );
  const queryClient = useQueryClient();

  // selected users in UI (checkboxes)
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  // snapshot of users who had permissions when modal opened (used to detect removals)
  const [originalSelectedUsers, setOriginalSelectedUsers] = useState<number[] | null>(null);

  // permissions toggles (applies to currently selected users)
  const [permissions, setPermissions] = useState({
    can_read: false,
    can_download: false,
  });

  // initialPermissions snapshot (common permissions for original selection)
  const [initialPermissions, setInitialPermissions] = useState<{
    can_read: boolean;
    can_download: boolean;
  } | null>(null);

  // derive a helper to show toasts — prefer provided showToast (kept for compatibility),
  // but **also** always call react-toastify so we actually display a toast.
  const notify = (message: string, type: "success" | "error" | "info" | "warning") => {
    // ensure only a single toast is visible
    toast.dismiss();

    // call optional parent handler (keeps existing behavior if parent provided one)
    if (showToast) {
      try {
        showToast(message, type);
      } catch (err) {
        // swallow errors from external handler
      }
    }

    // always show a react-toastify toast so user sees it
    if (type === "success") toast.success(message, { autoClose: TOAST_DURATION_MS });
    else if (type === "error") toast.error(message, { autoClose: TOAST_DURATION_MS });
    else if (type === "info") toast.info(message, { autoClose: TOAST_DURATION_MS });
    else toast.warn(message, { autoClose: TOAST_DURATION_MS });
  };

  // Detect assign/remove mutation state (compat for different react-query versions)
  const isAssigning =
    (assignPermission as any).isLoading ||
    (assignPermission as any).isPending ||
    (assignPermission as any).status === "loading" ||
    (removePermission as any).isLoading ||
    (removePermission as any).isPending ||
    (removePermission as any).status === "loading";

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedUsers([]);
      setOriginalSelectedUsers(null);
      setPermissions({ can_read: false, can_download: false });
      setInitialPermissions(null);
    }
  }, [isOpen]);

  // When permissions are fetched and modal opened, compute original selected users and set UI
  useEffect(() => {
    if (!isOpen || !resourcePermissions) return;

    const preselectedUserIds = Array.from(
      new Set(
        resourcePermissions
          .filter((perm) => perm.can_read || perm.can_download)
          .map((perm) => perm.user_id)
      )
    ).sort((a, b) => a - b);

    // store original set so we can compute removals on save
    setOriginalSelectedUsers(preselectedUserIds);

    // If nothing selected by user yet, set selectedUsers to preselected users
    setSelectedUsers(preselectedUserIds);

    // compute common permissions across preselected users
    if (preselectedUserIds.length > 0) {
      const allCanRead = preselectedUserIds.every((userId) => {
        const perm = resourcePermissions.find((p) => p.user_id === userId);
        return perm?.can_read ?? false;
      });
      const allCanDownload = preselectedUserIds.every((userId) => {
        const perm = resourcePermissions.find((p) => p.user_id === userId);
        return perm?.can_download ?? false;
      });

      const snapshot = {
        can_read: allCanRead,
        can_download: allCanRead && allCanDownload,
      };
      setPermissions(snapshot);
      setInitialPermissions(snapshot);
    } else {
      setPermissions({ can_read: false, can_download: false });
      setInitialPermissions(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, resourcePermissions]);

  // When selection changes, load permissions for single selection or compute common permissions for multiple
  useEffect(() => {
    if (!resourcePermissions) return;

    if (selectedUsers.length === 1) {
      const userId = selectedUsers[0];
      const existingPermission = resourcePermissions.find((p) => p.user_id === userId);
      const perm = existingPermission
        ? { can_read: !!existingPermission.can_read, can_download: !!existingPermission.can_download }
        : { can_read: false, can_download: false };
      setPermissions(perm);
      setInitialPermissions(perm);
    } else if (selectedUsers.length > 1) {
      const allCanRead = selectedUsers.every((userId) => {
        const perm = resourcePermissions.find((p) => p.user_id === userId);
        return perm?.can_read ?? false;
      });
      const allCanDownload = selectedUsers.every((userId) => {
        const perm = resourcePermissions.find((p) => p.user_id === userId);
        return perm?.can_download ?? false;
      });
      const snapshot = {
        can_read: allCanRead,
        can_download: allCanRead && allCanDownload,
      };
      setPermissions(snapshot);
      setInitialPermissions(snapshot);
    } else {
      // zero selected: clear initialPermissions to indicate no baseline
      setInitialPermissions(null);
      setPermissions({ can_read: false, can_download: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUsers, resourcePermissions]);

  // helper: check if permission toggles are any true
  const anyPermissionSet = useMemo(
    () => permissions.can_read || permissions.can_download,
    [permissions]
  );

  // Determine whether the Save button should be enabled:
  // - if selectedUsers differ from originalSelectedUsers (users added/removed)
  // - OR if permissions differ from initialPermissions
  const selectedUsersChanged = useMemo(() => {
    if (!originalSelectedUsers) {
      // if there were no original users, any selected user is a change only if any permission is set
      return selectedUsers.length > 0;
    }
    if (originalSelectedUsers.length !== selectedUsers.length) return true;
    // compare sets
    const origSet = new Set(originalSelectedUsers);
    for (const id of selectedUsers) {
      if (!origSet.has(id)) return true;
    }
    return false;
  }, [selectedUsers, originalSelectedUsers]);

  const permissionsChanged = useMemo(() => {
    if (!initialPermissions) {
      // If there was no baseline, consider changed only if any permission is set (and at least one selected)
      return selectedUsers.length > 0 && anyPermissionSet;
    }
    return (
      permissions.can_read !== initialPermissions.can_read ||
      permissions.can_download !== initialPermissions.can_download
    );
  }, [permissions, initialPermissions, selectedUsers.length, anyPermissionSet]);

  const hasPermissionsChanged = selectedUsersChanged || permissionsChanged;

  // toggle user checkbox
  const toggleUser = (userId: number) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handlePermissionChange = (key: string, checked: boolean) => {
    const newPermissions = { ...permissions, [key]: checked };
    if (key === "can_read" && !checked) {
      newPermissions.can_download = false;
    }
    setPermissions(newPermissions);
  };

  // Save: decide which users to assign / remove
  const handleSubmit = async () => {
    // nothing selected and nothing changed -> no-op
    if (!hasPermissionsChanged) {
      notify("No changes made to permissions", "info");
      onClose();
      return;
    }

    // Build lists:
    const original = new Set(originalSelectedUsers ?? []);
    const current = new Set(selectedUsers);

    const usersToRemove: number[] = [];
    const usersToAssign: number[] = [];

    // Users removed from selection -> remove perms
    if (original.size > 0) {
      original.forEach((userId) => {
        if (!current.has(userId)) usersToRemove.push(userId);
      });
    }

    // For current selected users: if any permission toggles set -> assign, if none -> remove (if existed before)
    current.forEach((userId) => {
      if (permissions.can_read || permissions.can_download) {
        usersToAssign.push(userId);
      } else {
        // no permissions selected for this user: if they previously had permissions, remove
        if (original.has(userId)) usersToRemove.push(userId);
        // if they didn't have permissions before and no permissions now, do nothing (no API call)
      }
    });

    // Create unique lists (avoid duplicates)
    const uniqueToAssign = Array.from(new Set(usersToAssign));
    const uniqueToRemove = Array.from(new Set(usersToRemove));

    // Prepare API calls
    const assignPromises = uniqueToAssign.map((user_id) =>
      (assignPermission as any).mutateAsync({
        user_id,
        resource_id: resourceId,
        resource_type: resourceType,
        ...permissions,
      })
    );

    const removePromises = uniqueToRemove.map((user_id) =>
      (removePermission as any).mutateAsyncByUser
        ? // optional helper (not required) — we supply {user_id} and remove API should support identifying permission by user/resource.
          (removePermission as any).mutateAsyncByUser({
            user_id,
            resource_id: resourceId,
            resource_type: resourceType,
          })
        : // fallback: mutateAsync with permission_id not available — our API exposes remove by permission_id.
          // If API only allows remove by permission_id, we need to find permission ids from resourcePermissions.
          (async () => {
            // find permission object for that user in resourcePermissions
            const permObj = resourcePermissions?.find((p) => p.user_id === user_id);
            if (permObj && (permObj as any).id) {
              return (removePermission as any).mutateAsync((permObj as any).id);
            }
            // As fallback: call assign endpoint with all false to force overwrite or deletion (depends on backend)
            return (assignPermission as any).mutateAsync({
              user_id,
              resource_id: resourceId,
              resource_type: resourceType,
              can_read: false,
              can_download: false,
            });
          })()
    );

    // Execute all
    try {
      const settled = await Promise.allSettled([...assignPromises, ...removePromises]);

      const rejects = settled.filter((r) => r.status === "rejected");
      if (rejects.length === 0) {
        notify("Permissions updated successfully", "success");
      } else {
        notify(`Failed to update permissions for ${rejects.length} user(s)`, "error");
      }

      // invalidate permissions query to refresh UI
      await queryClient.invalidateQueries({
        queryKey: ["permissions", resourceId, resourceType],
      });

      // ---- IMPORTANT: delay closing the modal until the toast has had time to render and stay visible.
      // If we call onClose() immediately, our ToastContainer (mounted inside this component) unmounts
      // and the toast disappears. Wait for TOAST_DURATION_MS + small buffer before closing.
      setTimeout(() => {
        onClose();
      }, TOAST_DURATION_MS + 200);
    } catch (err) {
      console.error("Permission update error:", err);
      notify("Failed to update permissions", "error");
      // delay close on error too so toast is visible
      setTimeout(() => {
        onClose();
      }, TOAST_DURATION_MS + 200);
    }
  };

  // Permission option UI
  const permissionOptions = [
    {
      key: "can_read",
      label: "View",
      icon: FiEye,
      description: "Can view this resource",
    },
    {
      key: "can_download",
      label: "Download",
      icon: FiDownload,
      description: "Can download this resource",
    },
  ];

  const getCurrentPermissionsText = () => {
    if (selectedUsers.length > 1) {
      const grantedPermissions: string[] = [];
      if (permissions.can_read) grantedPermissions.push("View");
      if (permissions.can_download) grantedPermissions.push("Download");
      return `${selectedUsers.length} users selected • ${
        grantedPermissions.length > 0 ? grantedPermissions.join(", ") : "No permissions granted"
      }`;
    }

    const grantedPermissions: string[] = [];
    if (permissions.can_read) grantedPermissions.push("View");
    if (permissions.can_download) grantedPermissions.push("Download");
    return grantedPermissions.length > 0 ? grantedPermissions.join(", ") : "No permissions granted";
  };

  return (
    <>
      {/* Mounted locally so react-toastify can render toasts even if you don't have a global ToastContainer.
          Limit=1 and zIndex ensure a single visible toast and that it appears above the modal. */}
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
                <div className="p-1.5 bg-purple-100 rounded-lg">
                  <FiKey className="text-purple-600" size={16} />
                </div>
                <div>
                  <Dialog.Title className="text-lg font-bold text-gray-900">Assign Permissions</Dialog.Title>
                  <p className="text-xs text-gray-500">Set permissions for {resourceType}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                <FiX size={16} />
              </button>
            </div>

            <div className="p-4 space-y-4 overflow-y-auto flex-1">
              {/* User list */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Select User</label>
                <div className="relative">
                  <div className="pl-3 mt-1">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 max-h-48 overflow-auto">
                      <div className="p-2 space-y-1">
                        {users
                          ?.filter((u: User) => u.role !== "super_admin")
                          .map((u: User) => {
                            const checked = selectedUsers.includes(u.id);
                            return (
                              <label key={u.id} className="flex items-center justify-between p-2 rounded hover:bg-gray-50 cursor-pointer">
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => toggleUser(u.id)}
                                    className="mt-0.5 text-purple-600 focus:ring-purple-500 rounded"
                                  />
                                  <div className="text-sm">
                                    <div className="font-medium text-gray-900">{u.username}</div>
                                    <div className="text-xs text-gray-500">{u.role}</div>
                                  </div>
                                </div>
                              </label>
                            );
                          })}
                        {users?.filter((u: User) => u.role !== "super_admin").length === 0 && (
                          <div className="text-xs text-gray-500 p-2">No users available</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Current Permissions Display */}
              {selectedUsers.length > 0 && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-xs font-medium text-gray-700 mb-1">Current Permissions:</div>
                  <div className="text-sm text-gray-600">{getCurrentPermissionsText()}</div>
                  {!permissionsChanged && initialPermissions && selectedUsers.length === 1 && (
                    <div className="text-xs text-purple-600 mt-1 font-medium">• No changes made</div>
                  )}
                </div>
              )}

              {/* Permissions toggles */}
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
                            <div className="flex items-center space-x-1.5">
                              <Icon size={14} className="text-gray-600" />
                              <span className="text-sm font-medium text-gray-900">{label}</span>
                            </div>
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
              <button onClick={onClose} className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!hasPermissionsChanged || isAssigning}
                className="px-4 py-2 text-sm bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAssigning ? (
                  <div className="flex items-center space-x-1.5">
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </div>
                ) : (
                  "Save"
                )}
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
};

export default PermissionModal;
