// // // components/PermissionModal.tsx
// // import React, { useState, useEffect } from "react";
// // import { Dialog } from "@headlessui/react";
// // import { useUsers } from "../hooks/useAuth";
// // import {
// //   useAssignPermission,
// //   useResourcePermissions,
// // } from "../hooks/usePermissions";
// // import type { User } from "../types";
// // import { FiKey, FiX, FiUser, FiEye, FiDownload } from "react-icons/fi";

// // interface PermissionModalProps {
// //   isOpen: boolean;
// //   onClose: () => void;
// //   resourceId: number;
// //   resourceType: "folder" | "file";
// //   showToast?: (
// //     message: string,
// //     type: "success" | "error" | "info" | "warning"
// //   ) => void;
// // }

// // const PermissionModal: React.FC<PermissionModalProps> = ({
// //   isOpen,
// //   onClose,
// //   resourceId,
// //   resourceType,
// //   showToast = () => {},
// // }) => {
// //   const { data: users } = useUsers();
// //   const assignPermission = useAssignPermission();
// //   const { data: resourcePermissions } = useResourcePermissions(
// //     resourceId,
// //     resourceType
// //   );

// //   const [selectedUser, setSelectedUser] = useState<number | null>(null);
// //   const [permissions, setPermissions] = useState({
// //     can_read: false,
// //     can_download: false,
// //   });

// //   // State to track initial permissions for comparison
// //   const [initialPermissions, setInitialPermissions] = useState<{
// //     can_read: boolean;
// //     can_download: boolean;
// //   } | null>(null);

// //   // Reset state when modal opens
// //   useEffect(() => {
// //     if (isOpen) {
// //       setSelectedUser(null);
// //       setPermissions({
// //         can_read: false,
// //         can_download: false,
// //       });
// //       setInitialPermissions(null);
// //     }
// //   }, [isOpen]);

// //   // Load existing permissions when user is selected
// //   useEffect(() => {
// //     if (selectedUser && selectedUser > 0 && resourcePermissions) {
// //       const existingPermission = resourcePermissions.find(
// //         (perm) => perm.user_id === selectedUser
// //       );

// //       if (existingPermission) {
// //         const newPermissions = {
// //           can_read: existingPermission.can_read || false,
// //           can_download: existingPermission.can_download || false,
// //         };
// //         setPermissions(newPermissions);
// //         setInitialPermissions(newPermissions); // Store initial state for comparison
// //       } else {
// //         const emptyPermissions = {
// //           can_read: false,
// //           can_download: false,
// //         };
// //         setPermissions(emptyPermissions);
// //         setInitialPermissions(emptyPermissions); // Store initial state for comparison
// //       }
// //     }
// //   }, [selectedUser, resourcePermissions]);

// //   // Check if permissions have actually changed
// //   const hasPermissionsChanged = (): boolean => {
// //     if (!initialPermissions) return true; // No initial state, consider it changed

// //     return (
// //       permissions.can_read !== initialPermissions.can_read ||
// //       permissions.can_download !== initialPermissions.can_download
// //     );
// //   };

// //   const handleSubmit = () => {
// //     if (!selectedUser) return;

// //     // Check if permissions have actually changed
// //     if (!hasPermissionsChanged()) {
// //       showToast("No changes made to permissions", "info");
// //       onClose();
// //       return;
// //     }

// //     assignPermission.mutate(
// //       {
// //         user_id: selectedUser,
// //         resource_id: resourceId,
// //         resource_type: resourceType,
// //         ...permissions,
// //       },
// //       {
// //         onSuccess: () => {
// //           showToast("Permissions updated successfully", "success");
// //           onClose();
// //         },
// //         onError: (error) => {
// //           showToast("Failed to update permissions", "error");
// //           console.error("Permission assignment error:", error);
// //         },
// //       }
// //     );
// //   };

// //   const handlePermissionChange = (key: string, checked: boolean) => {
// //     const newPermissions = {
// //       ...permissions,
// //       [key]: checked,
// //     };

// //     // If unchecking view, also uncheck download
// //     if (key === "can_read" && !checked) {
// //       newPermissions.can_download = false;
// //     }

// //     setPermissions(newPermissions);
// //   };

// //   const permissionOptions = [
// //     {
// //       key: "can_read",
// //       label: "View",
// //       icon: FiEye,
// //       description: "Can view this resource",
// //     },
// //     {
// //       key: "can_download",
// //       label: "Download",
// //       icon: FiDownload,
// //       description: "Can download this resource",
// //     },
// //   ];

// //   // Get current permissions display text
// //   const getCurrentPermissionsText = () => {
// //     const grantedPermissions = [];
// //     if (permissions.can_read) grantedPermissions.push("View");
// //     if (permissions.can_download) grantedPermissions.push("Download");

// //     return grantedPermissions.length > 0
// //       ? grantedPermissions.join(", ")
// //       : "No permissions granted";
// //   };

// //   // Check if save button should be enabled
// //   const isSaveEnabled =
// //     selectedUser && selectedUser > 0 && hasPermissionsChanged();

// //   return (
// //     <Dialog open={isOpen} onClose={onClose} className="relative z-50">
// //       <div
// //         className="fixed inset-0 bg-black/60 backdrop-blur-sm"
// //         aria-hidden="true"
// //       />
// //       <div className="fixed inset-0 flex items-center justify-center p-4">
// //         <Dialog.Panel className="bg-white rounded-2xl shadow-2xl max-w-sm w-full max-h-[80vh] transform transition-all flex flex-col">
// //           <div className="flex items-center justify-between p-4 border-b border-gray-100 flex-shrink-0">
// //             <div className="flex items-center space-x-2">
// //               <div className="p-1.5 bg-purple-100 rounded-lg">
// //                 <FiKey className="text-purple-600" size={16} />
// //               </div>
// //               <div>
// //                 <Dialog.Title className="text-lg font-bold text-gray-900">
// //                   Assign Permissions
// //                 </Dialog.Title>
// //                 <p className="text-xs text-gray-500">
// //                   Set permissions for {resourceType}
// //                 </p>
// //               </div>
// //             </div>
// //             <button
// //               onClick={onClose}
// //               className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
// //             >
// //               <FiX size={16} />
// //             </button>
// //           </div>

// //           <div className="p-4 space-y-4 overflow-y-auto flex-1">
// //             {/* User Selection */}
// //             <div>
// //               <label className="block text-xs font-medium text-gray-700 mb-2">
// //                 Select User
// //               </label>
// //               <div className="relative">
// //                 <FiUser
// //                   className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400"
// //                   size={14}
// //                 />
// //                 <select
// //                   className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 appearance-none bg-white"
// //                   value={selectedUser || ""}
// //                   onChange={(e) =>
// //                     setSelectedUser(
// //                       e.target.value ? Number(e.target.value) : null
// //                     )
// //                   }
// //                 >
// //                   <option value="">Choose a user...</option>
// //                   {users
// //                     ?.filter((user: User) => user.role !== "super_admin")
// //                     .map((user: User) => (
// //                       <option key={user.id} value={user.id}>
// //                         {user.username} ({user.role})
// //                       </option>
// //                     ))}
// //                 </select>
// //               </div>
// //             </div>

// //             {/* Current Permissions Display */}
// //             {selectedUser && selectedUser > 0 && (
// //               <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
// //                 <div className="text-xs font-medium text-gray-700 mb-1">
// //                   Current Permissions:
// //                 </div>
// //                 <div className="text-sm text-gray-600">
// //                   {getCurrentPermissionsText()}
// //                 </div>
// //                 {!hasPermissionsChanged() && initialPermissions && (
// //                   <div className="text-xs text-purple-600 mt-1 font-medium">
// //                     • No changes made
// //                   </div>
// //                 )}
// //               </div>
// //             )}

// //             {/* Show permissions when user is selected */}
// //             {selectedUser && selectedUser > 0 && (
// //               <div>
// //                 <label className="block text-xs font-medium text-gray-700 mb-2">
// //                   Permissions
// //                 </label>
// //                 <div className="space-y-2">
// //                   {permissionOptions.map(
// //                     ({ key, label, icon: Icon, description }) => {
// //                       // Only show download option if view is checked
// //                       if (key === "can_download" && !permissions.can_read) {
// //                         return null;
// //                       }

// //                       return (
// //                         <label
// //                           key={key}
// //                           className="flex items-start space-x-2 p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
// //                         >
// //                           <input
// //                             type="checkbox"
// //                             checked={
// //                               permissions[key as keyof typeof permissions]
// //                             }
// //                             onChange={(e) =>
// //                               handlePermissionChange(key, e.target.checked)
// //                             }
// //                             className="mt-0.5 text-purple-600 focus:ring-purple-500 rounded"
// //                           />
// //                           <div className="flex-1">
// //                             <div className="flex items-center space-x-1.5">
// //                               <Icon size={14} className="text-gray-600" />
// //                               <span className="text-sm font-medium text-gray-900">
// //                                 {label}
// //                               </span>
// //                             </div>
// //                             <p className="text-xs text-gray-500 mt-0.5">
// //                               {description}
// //                             </p>
// //                           </div>
// //                         </label>
// //                       );
// //                     }
// //                   )}
// //                 </div>
// //               </div>
// //             )}
// //           </div>

// //           <div className="flex justify-end space-x-2 p-4 border-t border-gray-100 flex-shrink-0">
// //             <button
// //               onClick={onClose}
// //               className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
// //             >
// //               Cancel
// //             </button>
// //             <button
// //               onClick={handleSubmit}
// //               disabled={!isSaveEnabled || assignPermission.isPending}
// //               className="px-4 py-2 text-sm bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
// //             >
// //               {assignPermission.isPending ? (
// //                 <div className="flex items-center space-x-1.5">
// //                   <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
// //                   <span>Saving...</span>
// //                 </div>
// //               ) : (
// //                 "Save"
// //               )}
// //             </button>
// //           </div>
// //         </Dialog.Panel>
// //       </div>
// //     </Dialog>
// //   );
// // };

// // export default PermissionModal;
// // components/PermissionModal.tsx
// import React, { useState, useEffect, useRef } from "react";
// import { Dialog } from "@headlessui/react";
// import { useUsers } from "../hooks/useAuth";
// import {
//   useAssignPermission,
//   useResourcePermissions,
// } from "../hooks/usePermissions";
// import type { User } from "../types";
// import { FiKey, FiX, FiUser, FiEye, FiDownload } from "react-icons/fi";

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
//   showToast = () => {},
// }) => {
//   const { data: users } = useUsers();
//   const assignPermission = useAssignPermission();
//   const { data: resourcePermissions } = useResourcePermissions(
//     resourceId,
//     resourceType
//   );

//   // Now allow selecting multiple users
//   const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
//   const [permissions, setPermissions] = useState({
//     can_read: false,
//     can_download: false,
//   });

//   // State to track initial permissions for comparison (meaningful for single selection)
//   const [initialPermissions, setInitialPermissions] = useState<{
//     can_read: boolean;
//     can_download: boolean;
//   } | null>(null);

//   // Dropdown open state (keeps the "dropdown" feel)
//   const [usersDropdownOpen, setUsersDropdownOpen] = useState(false);
//   const dropdownRef = useRef<HTMLDivElement | null>(null);

//   // Reset state when modal opens
//   useEffect(() => {
//     if (isOpen) {
//       setSelectedUsers([]);
//       setPermissions({
//         can_read: false,
//         can_download: false,
//       });
//       setInitialPermissions(null);
//       setUsersDropdownOpen(false);
//     }
//   }, [isOpen]);

//   // Close dropdown when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (e: MouseEvent) => {
//       if (
//         usersDropdownOpen &&
//         dropdownRef.current &&
//         !dropdownRef.current.contains(e.target as Node)
//       ) {
//         setUsersDropdownOpen(false);
//       }
//     };
//     if (usersDropdownOpen) {
//       document.addEventListener("mousedown", handleClickOutside);
//       return () => document.removeEventListener("mousedown", handleClickOutside);
//     }
//   }, [usersDropdownOpen]);

//   // Load existing permissions when exactly one user is selected
//   useEffect(() => {
//     if (selectedUsers.length === 1 && resourcePermissions) {
//       const userId = selectedUsers[0];
//       const existingPermission = resourcePermissions.find(
//         (perm) => perm.user_id === userId
//       );

//       if (existingPermission) {
//         const newPermissions = {
//           can_read: existingPermission.can_read || false,
//           can_download: existingPermission.can_download || false,
//         };
//         setPermissions(newPermissions);
//         setInitialPermissions(newPermissions); // Store initial state for comparison
//       } else {
//         const emptyPermissions = {
//           can_read: false,
//           can_download: false,
//         };
//         setPermissions(emptyPermissions);
//         setInitialPermissions(emptyPermissions); // Store initial state for comparison
//       }
//     } else {
//       // Multiple or zero selected -> reset initialPermissions (treat as changed by default)
//       setInitialPermissions(null);
//       // keep current permissions as-is
//     }
//   }, [selectedUsers, resourcePermissions]);

//   // Check if permissions have actually changed
//   const hasPermissionsChanged = (): boolean => {
//     if (!initialPermissions) return true; // No initial state, consider it changed

//     return (
//       permissions.can_read !== initialPermissions.can_read ||
//       permissions.can_download !== initialPermissions.can_download
//     );
//   };

//   const handleSubmit = () => {
//     if (selectedUsers.length === 0) return;

//     // Check if permissions have actually changed
//     if (!hasPermissionsChanged()) {
//       showToast("No changes made to permissions", "info");
//       onClose();
//       return;
//     }

//     // Assign permissions to each selected user
//     let remaining = selectedUsers.length;
//     let encounteredError = false;

//     selectedUsers.forEach((user_id) => {
//       assignPermission.mutate(
//         {
//           user_id,
//           resource_id: resourceId,
//           resource_type: resourceType,
//           ...permissions,
//         },
//         {
//           onSuccess: () => {
//             remaining -= 1;
//             if (remaining === 0 && !encounteredError) {
//               showToast("Permissions updated successfully", "success");
//               onClose();
//             }
//           },
//           onError: (error) => {
//             encounteredError = true;
//             showToast("Failed to update permissions", "error");
//             console.error("Permission assignment error for user", user_id, error);
//           },
//         }
//       );
//     });
//   };

//   const handlePermissionChange = (key: string, checked: boolean) => {
//     const newPermissions = {
//       ...permissions,
//       [key]: checked,
//     };

//     // If unchecking view, also uncheck download
//     if (key === "can_read" && !checked) {
//       newPermissions.can_download = false;
//     }

//     setPermissions(newPermissions);
//   };

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

//   // Get current permissions display text
//   const getCurrentPermissionsText = () => {
//     if (selectedUsers.length > 1) {
//       const grantedPermissions = [];
//       if (permissions.can_read) grantedPermissions.push("View");
//       if (permissions.can_download) grantedPermissions.push("Download");

//       return `${selectedUsers.length} users selected • ${
//         grantedPermissions.length > 0 ? grantedPermissions.join(", ") : "No permissions granted"
//       }`;
//     }

//     const grantedPermissions = [];
//     if (permissions.can_read) grantedPermissions.push("View");
//     if (permissions.can_download) grantedPermissions.push("Download");

//     return grantedPermissions.length > 0
//       ? grantedPermissions.join(", ")
//       : "No permissions granted";
//   };

//   // Check if save button should be enabled
//   const isSaveEnabled = selectedUsers.length > 0 && hasPermissionsChanged();

//   // Toggle individual user selection
//   const toggleUser = (userId: number) => {
//     setSelectedUsers((prev) =>
//       prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
//     );
//   };

//   const selectedLabel = () => {
//     if (selectedUsers.length === 0) return "Choose a user...";
//     if (selectedUsers.length === 1) {
//       const u = users?.find((x: User) => x.id === selectedUsers[0]);
//       return u ? `${u.username} (${u.role})` : "1 user selected";
//     }
//     return `${selectedUsers.length} users selected`;
//   };

//   return (
//     <Dialog open={isOpen} onClose={onClose} className="relative z-50">
//       <div
//         className="fixed inset-0 bg-black/60 backdrop-blur-sm"
//         aria-hidden="true"
//       />
//       <div className="fixed inset-0 flex items-center justify-center p-4">
//         <Dialog.Panel className="bg-white rounded-2xl shadow-2xl max-w-sm w-full max-h-[80vh] transform transition-all flex flex-col">
//           <div className="flex items-center justify-between p-4 border-b border-gray-100 flex-shrink-0">
//             <div className="flex items-center space-x-2">
//               <div className="p-1.5 bg-purple-100 rounded-lg">
//                 <FiKey className="text-purple-600" size={16} />
//               </div>
//               <div>
//                 <Dialog.Title className="text-lg font-bold text-gray-900">
//                   Assign Permissions
//                 </Dialog.Title>
//                 <p className="text-xs text-gray-500">
//                   Set permissions for {resourceType}
//                 </p>
//               </div>
//             </div>
//             <button
//               onClick={onClose}
//               className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
//             >
//               <FiX size={16} />
//             </button>
//           </div>

//           <div className="p-4 space-y-4 overflow-y-auto flex-1">
//             {/* User Selection */}
//             <div>
//               <label className="block text-xs font-medium text-gray-700 mb-2">
//                 Select User
//               </label>
//               <div className="relative" ref={dropdownRef}>
//                 <FiUser
//                   className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400"
//                   size={14}
//                 />

//                 {/* Visual dropdown that preserves original select layout */}
//                 <button
//                   type="button"
//                   onClick={() => setUsersDropdownOpen((s) => !s)}
//                   className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white flex items-center justify-between"
//                 >
//                   <span className="truncate text-gray-700">{selectedLabel()}</span>
//                   <svg
//                     className={`w-4 h-4 text-gray-400 transform transition-transform ${usersDropdownOpen ? "rotate-180" : "rotate-0"}`}
//                     viewBox="0 0 20 20"
//                     fill="currentColor"
//                   >
//                     <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
//                   </svg>
//                 </button>

//                 {/* Dropdown list (contains checkboxes) */}
//                 {usersDropdownOpen && (
//                   <div className="absolute mt-2 left-0 right-0 z-50 bg-white rounded-lg shadow-lg border border-gray-200 max-h-48 overflow-auto">
//                     <div className="p-2 space-y-1">
//                       {users
//                         ?.filter((u: User) => u.role !== "super_admin")
//                         .map((u: User) => {
//                           const checked = selectedUsers.includes(u.id);
//                           return (
//                             <label
//                               key={u.id}
//                               className="flex items-center justify-between p-2 rounded hover:bg-gray-50 cursor-pointer"
//                             >
//                               <div className="flex items-center space-x-2">
//                                 <input
//                                   type="checkbox"
//                                   checked={checked}
//                                   onChange={() => toggleUser(u.id)}
//                                   className="mt-0.5 text-purple-600 focus:ring-purple-500 rounded"
//                                 />
//                                 <div className="text-sm">
//                                   <div className="font-medium text-gray-900">{u.username}</div>
//                                   <div className="text-xs text-gray-500">{u.role}</div>
//                                 </div>
//                               </div>
//                             </label>
//                           );
//                         })}
//                       {users?.filter((u: User) => u.role !== "super_admin").length === 0 && (
//                         <div className="text-xs text-gray-500 p-2">No users available</div>
//                       )}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Current Permissions Display */}
//             {selectedUsers.length > 0 && (
//               <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
//                 <div className="text-xs font-medium text-gray-700 mb-1">
//                   Current Permissions:
//                 </div>
//                 <div className="text-sm text-gray-600">
//                   {getCurrentPermissionsText()}
//                 </div>
//                 {!hasPermissionsChanged() && initialPermissions && selectedUsers.length === 1 && (
//                   <div className="text-xs text-purple-600 mt-1 font-medium">
//                     • No changes made
//                   </div>
//                 )}
//               </div>
//             )}

//             {/* Show permissions when user is selected */}
//             {selectedUsers.length > 0 && (
//               <div>
//                 <label className="block text-xs font-medium text-gray-700 mb-2">
//                   Permissions
//                 </label>
//                 <div className="space-y-2">
//                   {permissionOptions.map(
//                     ({ key, label, icon: Icon, description }) => {
//                       // Only show download option if view is checked
//                       if (key === "can_download" && !permissions.can_read) {
//                         return null;
//                       }

//                       return (
//                         <label
//                           key={key}
//                           className="flex items-start space-x-2 p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
//                         >
//                           <input
//                             type="checkbox"
//                             checked={
//                               permissions[key as keyof typeof permissions]
//                             }
//                             onChange={(e) =>
//                               handlePermissionChange(key, e.target.checked)
//                             }
//                             className="mt-0.5 text-purple-600 focus:ring-purple-500 rounded"
//                           />
//                           <div className="flex-1">
//                             <div className="flex items-center space-x-1.5">
//                               <Icon size={14} className="text-gray-600" />
//                               <span className="text-sm font-medium text-gray-900">
//                                 {label}
//                               </span>
//                             </div>
//                             <p className="text-xs text-gray-500 mt-0.5">
//                               {description}
//                             </p>
//                           </div>
//                         </label>
//                       );
//                     }
//                   )}
//                 </div>
//               </div>
//             )}
//           </div>

//           <div className="flex justify-end space-x-2 p-4 border-t border-gray-100 flex-shrink-0">
//             <button
//               onClick={onClose}
//               className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
//             >
//               Cancel
//             </button>
//             <button
//               onClick={handleSubmit}
//               disabled={!isSaveEnabled || assignPermission.isPending}
//               className="px-4 py-2 text-sm bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {assignPermission.isPending ? (
//                 <div className="flex items-center space-x-1.5">
//                   <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                   <span>Saving...</span>
//                 </div>
//               ) : (
//                 "Save"
//               )}
//             </button>
//           </div>
//         </Dialog.Panel>
//       </div>
//     </Dialog>
//   );
// };

// export default PermissionModal;
import React, { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { useUsers } from "../hooks/useAuth";
import {
  useAssignPermission,
  useResourcePermissions,
} from "../hooks/usePermissions";
import type { User } from "../types";
import { FiKey, FiX, FiEye, FiDownload } from "react-icons/fi";

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

const PermissionModal: React.FC<PermissionModalProps> = ({
  isOpen,
  onClose,
  resourceId,
  resourceType,
  showToast = () => {},
}) => {
  const { data: users } = useUsers();
  const assignPermission = useAssignPermission();
  const { data: resourcePermissions } = useResourcePermissions(
    resourceId,
    resourceType
  );

  // Now allow selecting multiple users
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [permissions, setPermissions] = useState({
    can_read: false,
    can_download: false,
  });

  // State to track initial permissions for comparison (meaningful for single selection)
  const [initialPermissions, setInitialPermissions] = useState<{
    can_read: boolean;
    can_download: boolean;
  } | null>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedUsers([]);
      setPermissions({
        can_read: false,
        can_download: false,
      });
      setInitialPermissions(null);
    }
  }, [isOpen]);

  // Load existing permissions when exactly one user is selected
  useEffect(() => {
    if (selectedUsers.length === 1 && resourcePermissions) {
      const userId = selectedUsers[0];
      const existingPermission = resourcePermissions.find(
        (perm) => perm.user_id === userId
      );

      if (existingPermission) {
        const newPermissions = {
          can_read: existingPermission.can_read || false,
          can_download: existingPermission.can_download || false,
        };
        setPermissions(newPermissions);
        setInitialPermissions(newPermissions); // Store initial state for comparison
      } else {
        const emptyPermissions = {
          can_read: false,
          can_download: false,
        };
        setPermissions(emptyPermissions);
        setInitialPermissions(emptyPermissions); // Store initial state for comparison
      }
    } else {
      // Multiple or zero selected -> reset initialPermissions (treat as changed by default)
      setInitialPermissions(null);
      // keep current permissions as-is
    }
  }, [selectedUsers, resourcePermissions]);

  // Check if permissions have actually changed
  const hasPermissionsChanged = (): boolean => {
    if (!initialPermissions) return true; // No initial state, consider it changed

    return (
      permissions.can_read !== initialPermissions.can_read ||
      permissions.can_download !== initialPermissions.can_download
    );
  };

  const handleSubmit = () => {
    if (selectedUsers.length === 0) return;

    // Check if permissions have actually changed
    if (!hasPermissionsChanged()) {
      showToast("No changes made to permissions", "info");
      onClose();
      return;
    }

    // Assign permissions to each selected user
    let remaining = selectedUsers.length;
    let encounteredError = false;

    selectedUsers.forEach((user_id) => {
      assignPermission.mutate(
        {
          user_id,
          resource_id: resourceId,
          resource_type: resourceType,
          ...permissions,
        },
        {
          onSuccess: () => {
            remaining -= 1;
            if (remaining === 0 && !encounteredError) {
              showToast("Permissions updated successfully", "success");
              onClose();
            }
          },
          onError: (error) => {
            encounteredError = true;
            showToast("Failed to update permissions", "error");
            console.error("Permission assignment error for user", user_id, error);
          },
        }
      );
    });
  };

  const handlePermissionChange = (key: string, checked: boolean) => {
    const newPermissions = {
      ...permissions,
      [key]: checked,
    };

    // If unchecking view, also uncheck download
    if (key === "can_read" && !checked) {
      newPermissions.can_download = false;
    }

    setPermissions(newPermissions);
  };

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

  // Get current permissions display text
  const getCurrentPermissionsText = () => {
    if (selectedUsers.length > 1) {
      const grantedPermissions = [];
      if (permissions.can_read) grantedPermissions.push("View");
      if (permissions.can_download) grantedPermissions.push("Download");

      return `${selectedUsers.length} users selected • ${
        grantedPermissions.length > 0 ? grantedPermissions.join(", ") : "No permissions granted"
      }`;
    }

    const grantedPermissions = [];
    if (permissions.can_read) grantedPermissions.push("View");
    if (permissions.can_download) grantedPermissions.push("Download");

    return grantedPermissions.length > 0
      ? grantedPermissions.join(", ")
      : "No permissions granted";
  };

  // Check if save button should be enabled
  const isSaveEnabled = selectedUsers.length > 0 && hasPermissionsChanged();

  // Toggle individual user selection
  const toggleUser = (userId: number) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  // const selectedLabel = () => {
  //   if (selectedUsers.length === 0) return "Choose a user...";
  //   if (selectedUsers.length === 1) {
  //     const u = users?.find((x: User) => x.id === selectedUsers[0]);
  //     return u ? `${u.username} (${u.role})` : "1 user selected";
  //   }
  //   return `${selectedUsers.length} users selected`;
  // };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        aria-hidden="true"
      />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-2xl shadow-2xl transform transition-all flex flex-col max-w-sm w-full max-h-[80vh]">
          <div className="flex items-center justify-between p-4 border-b border-gray-100 flex-shrink-0">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-purple-100 rounded-lg">
                <FiKey className="text-purple-600" size={16} />
              </div>
              <div>
                <Dialog.Title className="text-lg font-bold text-gray-900">
                  Assign Permissions
                </Dialog.Title>
                <p className="text-xs text-gray-500">
                  Set permissions for {resourceType}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiX size={16} />
            </button>
          </div>

          <div className="p-4 space-y-4 overflow-y-auto flex-1">
            {/* User Selection */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Select User
              </label>
              <div className="relative">
                {/* Person icon removed */}

                {/* Users shown directly (no dropdown) */}
                <div className="pl-3 mt-1">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 max-h-48 overflow-auto">
                    <div className="p-2 space-y-1">
                      {users
                        ?.filter((u: User) => u.role !== "super_admin")
                        .map((u: User) => {
                          const checked = selectedUsers.includes(u.id);
                          return (
                            <label
                              key={u.id}
                              className="flex items-center justify-between p-2 rounded hover:bg-gray-50 cursor-pointer"
                            >
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
                <div className="text-xs font-medium text-gray-700 mb-1">
                  Current Permissions:
                </div>
                <div className="text-sm text-gray-600">
                  {getCurrentPermissionsText()}
                </div>
                {!hasPermissionsChanged() && initialPermissions && selectedUsers.length === 1 && (
                  <div className="text-xs text-purple-600 mt-1 font-medium">
                    • No changes made
                  </div>
                )}
              </div>
            )}

            {/* Show permissions when user is selected */}
            {selectedUsers.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Permissions
                </label>
                <div className="space-y-2">
                  {permissionOptions.map(
                    ({ key, label, icon: Icon, description }) => {
                      // Only show download option if view is checked
                      if (key === "can_download" && !permissions.can_read) {
                        return null;
                      }

                      return (
                        <label
                          key={key}
                          className="flex items-start space-x-2 p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={
                              permissions[key as keyof typeof permissions]
                            }
                            onChange={(e) =>
                              handlePermissionChange(key, e.target.checked)
                            }
                            className="mt-0.5 text-purple-600 focus:ring-purple-500 rounded"
                          />
                          <div className="flex-1">
                            <div className="flex items-center space-x-1.5">
                              <Icon size={14} className="text-gray-600" />
                              <span className="text-sm font-medium text-gray-900">
                                {label}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {description}
                            </p>
                          </div>
                        </label>
                      );
                    }
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2 p-4 border-t border-gray-100 flex-shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!isSaveEnabled || assignPermission.isPending}
              className="px-4 py-2 text-sm bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {assignPermission.isPending ? (
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
  );
};

export default PermissionModal;
