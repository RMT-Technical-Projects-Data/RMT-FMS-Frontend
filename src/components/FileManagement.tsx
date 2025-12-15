// import React from "react";
// import {
//   FiUpload,
//   FiFolderPlus,
//   FiKey,
//   FiFolder,
//   FiFile,
//   FiMoreVertical,
//   FiEdit3,
//   FiTrash2,
//   FiDownload,
//   // FiHeart,
//   FiArrowLeft,
// } from "react-icons/fi";
// import FileList from "./FileList";
// import UploadModal from "./UploadModal";
// import PermissionModal from "./PermissionModal";
// import CreateFolderModal from "../components/CreateFolderModal"; // New import
// import {
//   useCreateFolder,
//   useRootFolders,
//   useFoldersByParent,
//   useUpdateFolder,
//   useDeleteFolder,
//   // useToggleFolderFavourite,
// } from "../hooks/useFolders";
// import { useFiles, useRootFiles, useDownloadFolder } from "../hooks/useFiles";
// import { useUserPermissions } from "../hooks/usePermissions";
// import type { User, Folder } from "../types";

// interface FileManagementProps {
//   selectedFolderId: number | null;
//   selectedFolderName?: string | null; // NEW prop - optional folder name passed from Dashboard
//   selectedFolderPathSegments?: string[]; // NEW prop - breadcrumb segments passed from Dashboard
//   searchQuery: string;
//   user: User;
//   isUploadModalOpen: boolean;
//   setIsUploadModalOpen: (open: boolean) => void;
//   isPermissionModalOpen: boolean;
//   setIsPermissionModalOpen: (open: boolean) => void;
//   permissionResource: { id: number; type: "folder" | "file" } | null;
//   setPermissionResource: (
//     resource: { id: number; type: "folder" | "file" } | null
//   ) => void;
//   onFolderSelect: (folderId: number | null, folderName?: string | null) => void; // accepts optional name
//   onBackNavigation?: () => void;
//   showToast?: (
//     message: string,
//     type: "success" | "error" | "info" | "warning"
//   ) => void; // Add toast function
// }

// const FileManagement: React.FC<FileManagementProps> = ({
//   selectedFolderId,
//   selectedFolderName,
//   selectedFolderPathSegments,
//   searchQuery,
//   user,
//   isUploadModalOpen,
//   setIsUploadModalOpen,
//   isPermissionModalOpen,
//   setIsPermissionModalOpen,
//   permissionResource,
//   setPermissionResource,
//   onFolderSelect,
//   onBackNavigation,
//   showToast = () => {}, // Default empty function
// }) => {
//   const { data: files, isLoading: filesLoading } = useFiles(selectedFolderId);
//   const { data: rootFiles, isLoading: rootFilesLoading } = useRootFiles();
//   const { data: rootFolders, isLoading: rootFoldersLoading } = useRootFolders();
//   const { data: subFolders, isLoading: subFoldersLoading } =
//     useFoldersByParent(selectedFolderId);
//   const createFolder = useCreateFolder();
//   const updateFolder = useUpdateFolder();
//   const deleteFolder = useDeleteFolder();
//   const downloadFolder = useDownloadFolder();
//   // const toggleFolderFavourite = useToggleFolderFavourite();
//   const { data: userPermissions } = useUserPermissions();

//   // State for create folder modal
//   const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] =
//     React.useState(false);

//   // Debug logging
//   console.log("🔍 [FileManagement] Data state:", {
//     filesCount: files?.length || 0,
//     rootFilesCount: rootFiles?.length || 0,
//     rootFoldersCount: rootFolders?.length || 0,
//     subFoldersCount: subFolders?.length || 0,
//     selectedFolderId,
//     selectedFolderName,
//     filesLoading,
//     rootFilesLoading,
//     rootFoldersLoading,
//     subFoldersLoading,
//     rootFolders:
//       rootFolders?.map((f) => ({
//         id: f.id,
//         name: f.name,
//         parent_id: f.parent_id,
//       })) || [],
//     subFolders:
//       subFolders?.map((f) => ({
//         id: f.id,
//         name: f.name,
//         parent_id: f.parent_id,
//       })) || [],
//   });

//   // Check if user has download permission for a folder
//   const hasDownloadPermission = (folderId: number) => {
//     if (!userPermissions) return false;

//     // Check if folder is owned by user (owners have all permissions)
//     const allFolders = [...(rootFolders || []), ...(subFolders || [])];
//     const folder = allFolders.find((f) => f.id === folderId);
//     if (folder && user.id && folder.created_by === user.id) {
//       return true;
//     }

//     // Check direct permission for this folder
//     const directPermission = userPermissions.find(
//       (perm) => perm.resource_id === folderId && perm.resource_type === "folder"
//     );

//     if (directPermission) {
//       return directPermission.can_download || false;
//     }

//     // Check inherited permission from parent folder
//     if (folder && folder.parent_id) {
//       const parentPermission = userPermissions.find(
//         (perm) =>
//           perm.resource_id === folder.parent_id &&
//           perm.resource_type === "folder"
//       );

//       if (parentPermission) {
//         return parentPermission.can_download || false;
//       }
//     }

//     return false;
//   };

//   // Check if user should see the 3-dot menu for a folder
//   const shouldShowThreeDotMenu = (folderId: number): boolean => {
//     // Super admin always sees the menu
//     if (user.role === "super_admin") return true;

//     // Check if user has download permission
//     return hasDownloadPermission(folderId);
//   };

//   // State for dropdown management
//   const [openDropdownId, setOpenDropdownId] = React.useState<number | null>(
//     null
//   );

//   // Close dropdown when clicking outside
//   React.useEffect(() => {
//     const handleClickOutside = () => {
//       setOpenDropdownId(null);
//     };

//     if (openDropdownId) {
//       document.addEventListener("click", handleClickOutside);
//       return () => document.removeEventListener("click", handleClickOutside);
//     }
//   }, [openDropdownId]);

//   const handleFolderClick = (folder: Folder) => {
//     console.log("📁 Folder clicked:", folder.name, "ID:", folder.id);
//     // Pass both ID and name back to Dashboard so it can show & store the folder name
//     onFolderSelect(folder.id, folder.name);
//   };

//   const handleCreateFolder = () => {
//     setIsCreateFolderModalOpen(true);
//   };

//   const handleCreateFolderSubmit = (name: string) => {
//     if (name.trim()) {
//       createFolder.mutate(
//         { name: name.trim(), parent_id: selectedFolderId },
//         {
//           onSuccess: () => {
//             // Folder created successfully - no navigation needed
//             setIsCreateFolderModalOpen(false);
//           },
//         }
//       );
//     }
//   };

//   const handleAssignPermission = (
//     resourceId: number,
//     resourceType: "folder" | "file"
//   ) => {
//     setPermissionResource({ id: resourceId, type: resourceType });
//     setIsPermissionModalOpen(true);
//   };

//   // Handle permission modal close with change detection
//   const handlePermissionModalClose = () => {
//     setIsPermissionModalOpen(false);
//     setPermissionResource(null);
//   };

//   // Get the items to display based on whether we're in root or a specific folder
//   const displayFiles = selectedFolderId ? files : rootFiles;
//   const displayFolders = selectedFolderId ? subFolders || [] : rootFolders; // Show subfolders when inside a folder
//   const isLoading = selectedFolderId
//     ? filesLoading || subFoldersLoading
//     : rootFilesLoading || rootFoldersLoading;

//   // Debug: Log files data
//   React.useEffect(() => {
//     console.log(
//       "🔍 [FileManagement] Display files:",
//       displayFiles?.map((f) => ({ id: f.id, name: f.name }))
//     );
//     console.log("🔍 [FileManagement] Selected folder ID:", selectedFolderId);
//     console.log("🔍 [FileManagement] Selected folder Name:", selectedFolderName);
//     console.log("🔍 [FileManagement] Files loading:", filesLoading);
//     console.log("🔍 [FileManagement] Root files loading:", rootFilesLoading);
//   }, [displayFiles, selectedFolderId, selectedFolderName, filesLoading, rootFilesLoading]);

//   const filteredFiles =
//     displayFiles?.filter((file) =>
//       file.name.toLowerCase().includes(searchQuery.toLowerCase())
//     ) || [];

//   const filteredFolders =
//     displayFolders?.filter((folder) =>
//       folder.name.toLowerCase().includes(searchQuery.toLowerCase())
//     ) || [];

//   // Calculate total size for display
//   const totalSize = filteredFiles.reduce(
//     (acc, file) => acc + (file.size || 0),
//     0
//   );
//   const totalItems = filteredFiles.length + filteredFolders.length;

//   const handleBackToRoot = () => {
//     // Always go to dashboard root, never use navigation history
//     onFolderSelect(null);
//   };

//   const handleRenameFolder = (folderId: number, currentName: string) => {
//     const newName = prompt("Enter new folder name", currentName);
//     if (newName && newName.trim() && newName !== currentName) {
//       updateFolder.mutate({ id: folderId, name: newName.trim() });
//     }
//     setOpenDropdownId(null);
//   };

//   const handleDeleteFolder = (folderId: number, folderName: string) => {
//     if (
//       window.confirm(
//         `Are you sure you want to delete "${folderName}"? This action cannot be undone.`
//       )
//     ) {
//       deleteFolder.mutate(folderId);
//     }
//     setOpenDropdownId(null);
//   };

//   const handleDropdownToggle = (folderId: number, e: React.MouseEvent) => {
//     e.stopPropagation();
//     setOpenDropdownId(openDropdownId === folderId ? null : folderId);
//   };

//   const handleDownloadFolder = (folderId: number) => {
//     downloadFolder.mutate(folderId);
//     setOpenDropdownId(null);
//   };

//   // const handleToggleFolderFavourite = (
//   //   folderId: number,
//   //   e: React.MouseEvent
//   // ) => {
//   //   e.stopPropagation();
//   //   toggleFolderFavourite.mutate(folderId, {
//   //     onSuccess: (data) => {
//   //       console.log("✅ Folder toggle success:", data);
//   //     },
//   //     onError: (error) => {
//   //       console.error("❌ Folder toggle error:", error);
//   //     }
//   //   });
//   //   setOpenDropdownId(null);
//   // };

//   return (
//     <>
//       <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 p-6">
//         <div className="flex items-center justify-between mb-8">
//           <div className="flex items-center space-x-4">
//             {selectedFolderId && onBackNavigation && (
//               <button
//                 onClick={onBackNavigation}
//                 className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
//                 title="Go back to previous folder"
//               >
//                 <FiArrowLeft size={18} />
//                 <span>Back</span>
//               </button>
//             )}
//             <div>
//               <h2 className="text-xl font-bold text-gray-900">
//                 {selectedFolderId
//                   ? "Folder Contents"
//                   : "Dashboard - All Files & Folders"}
//               </h2>
//               {selectedFolderId && (
//                 <div className="mt-1 text-sm text-gray-700 font-semibold flex items-center flex-wrap gap-1">
//                   {selectedFolderPathSegments && selectedFolderPathSegments.length > 0 ? (
//                     selectedFolderPathSegments.map((segment, index) => (
//                       <React.Fragment key={`${segment}-${index}`}>
//                         {index > 0 && <span className="text-gray-400">/</span>}
//                         <span
//                           className="truncate max-w-[140px] md:max-w-none"
//                           title={segment}
//                         >
//                           {segment}
//                         </span>
//                       </React.Fragment>
//                     ))
//                   ) : selectedFolderName ? (
//                     <span title={selectedFolderName}>{selectedFolderName}</span>
//                   ) : null}
//                 </div>
//               )}
//               <p className="text-gray-500 mt-1">
//                 {totalItems} items • {(totalSize / (1024 * 1024)).toFixed(2)} MBs
//                 {selectedFolderId && (
//                   <button
//                     onClick={handleBackToRoot}
//                     className="ml-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
//                   >
//                     ← Back to Dashboard
//                   </button>
//                 )}
//               </p>
//             </div>
//           </div>

//           <div className="flex items-center space-x-3">
//             {user.role === "super_admin" && (
//               <button
//                 onClick={handleCreateFolder}
//                 className="flex items-center space-x-2 px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all hover:shadow-md"
//               >
//                 <FiFolderPlus size={16} />
//                 <span>Create Folder</span>
//               </button>
//             )}

//             {user.role === "super_admin" && (
//               <button
//                 onClick={() => setIsUploadModalOpen(true)}
//                 className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white hover:from-blue-700 hover:to-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all transform hover:scale-105"
//               >
//                 <FiUpload size={18} />
//                 <span>Upload</span>
//               </button>
//             )}
//           </div>
//         </div>

//         {isLoading ? (
//           <div className="flex justify-center py-16">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//           </div>
//         ) : (
//           <div className="space-y-6">
//             {/* Folders Section */}
//             {filteredFolders.length > 0 && (
//               <div>
//                 <h3 className="text-lg font-semibold text-gray-900 mb-4">
//                   Folders
//                 </h3>
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
//                   {filteredFolders.map((folder) => (
//                     <div
//                       key={folder.id}
//                       onClick={() => handleFolderClick(folder)}
//                       className="flex items-center p-4 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-md transition-all cursor-pointer group relative"
//                     >
//                       <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg mr-4">
//                         <FiFolder className="text-white" size={20} />
//                       </div>
//                       <div className="flex-1 min-w-0">
//                         <h4 className="font-medium text-gray-900 truncate group-hover:text-blue-600">
//                           {folder.name}
//                         </h4>
//                         <p className="text-sm text-gray-500">Folder</p>
//                       </div>

//                       {/* Heart icon */}
//                       {/* <button
//                         onClick={(e) =>
//                           handleToggleFolderFavourite(folder.id, e)
//                         }
//                         className={`p-2 rounded-xl transition-colors mr-2 ${
//                           folder.is_faviourite
//                             ? "text-red-500 hover:text-red-600 hover:bg-red-50"
//                             : "text-gray-400 hover:text-red-500 hover:bg-red-50"
//                         }`}
//                         title={
//                           folder.is_faviourite
//                             ? "Remove from favorites"
//                             : "Add to favorites"
//                         }
//                       >
//                         <FiHeart
//                           size={16}
//                           fill={folder.is_faviourite ? "currentColor" : "none"}
//                         />
//                       </button> */}

//                       {/* 3-dot dropdown menu - Only show if user has download permission or is super admin */}
//                       {shouldShowThreeDotMenu(folder.id) && (
//                         <div className="relative">
//                           <button
//                             onClick={(e) => handleDropdownToggle(folder.id, e)}
//                             className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
//                             title="More options"
//                           >
//                             <FiMoreVertical size={16} />
//                           </button>

//                           {openDropdownId === folder.id && (
//                             <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
//                               <div className="py-1">
//                                 {user.role === "super_admin" &&
//                                   !folder.parent_id && (
//                                     <button
//                                       onClick={(e) => {
//                                         e.stopPropagation();
//                                         handleAssignPermission(
//                                           folder.id,
//                                           "folder"
//                                         );
//                                         setOpenDropdownId(null);
//                                       }}
//                                       className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                                     >
//                                       <FiKey className="mr-3" size={16} />
//                                       Permissions
//                                     </button>
//                                   )}
//                                 {hasDownloadPermission(folder.id) && (
//                                   <button
//                                     onClick={(e) => {
//                                       e.stopPropagation();
//                                       handleDownloadFolder(folder.id);
//                                     }}
//                                     className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                                   >
//                                     <FiDownload className="mr-3" size={16} />
//                                     Download
//                                   </button>
//                                 )}
//                                 {user.role === "super_admin" && (
//                                   <>
//                                     <button
//                                       onClick={(e) => {
//                                         e.stopPropagation();
//                                         handleRenameFolder(
//                                           folder.id,
//                                           folder.name
//                                         );
//                                       }}
//                                       className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                                     >
//                                       <FiEdit3 className="mr-3" size={16} />
//                                       Rename
//                                     </button>
//                                     <button
//                                       onClick={(e) => {
//                                         e.stopPropagation();
//                                         handleDeleteFolder(
//                                           folder.id,
//                                           folder.name
//                                         );
//                                       }}
//                                       className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
//                                     >
//                                       <FiTrash2 className="mr-3" size={16} />
//                                       Delete
//                                     </button>
//                                   </>
//                                 )}
//                               </div>
//                             </div>
//                           )}
//                         </div>
//                       )}
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* Files Section */}
//             {filteredFiles.length > 0 && (
//               <div>
//                 <h3 className="text-lg font-semibold text-gray-900 mb-4">
//                   {filteredFolders.length > 0 ? "Files" : "All Items"}
//                 </h3>
//                 <FileList
//                   files={filteredFiles}
//                   onAssignPermission={handleAssignPermission}
//                   userRole={user.role}
//                   userId={user.id}
//                   showFavouriteToggle={false}
//                 />
//               </div>
//             )}

//             {/* Empty State */}
//             {totalItems === 0 && !isLoading && (
//               <div className="text-center py-16">
//                 <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center mx-auto mb-6">
//                   <FiFile className="text-gray-400" size={32} />
//                 </div>
//                 <h3 className="text-xl font-semibold text-gray-900 mb-2">
//                   {selectedFolderId
//                     ? "This folder is empty"
//                     : "No files or folders yet"}
//                 </h3>
//                 <p className="text-gray-500 mb-6 max-w-md mx-auto">
//                   {selectedFolderId
//                     ? "Upload files to this folder or create subfolders to organize your content."
//                     : "Get started by uploading your first file or creating a new folder."}
//                 </p>
//                 {user.role === "super_admin" && (
//                   <div className="flex justify-center space-x-4">
//                     <button
//                       onClick={handleCreateFolder}
//                       className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium"
//                     >
//                       Create Folder
//                     </button>
//                     <button
//                       onClick={() => setIsUploadModalOpen(true)}
//                       className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-medium"
//                     >
//                       Upload File
//                     </button>
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         )}
//       </div>

//       {/* Upload Modal */}
//       <UploadModal
//         isOpen={isUploadModalOpen}
//         onClose={() => setIsUploadModalOpen(false)}
//         folderId={selectedFolderId}
//       />

//       {/* Create Folder Modal */}
//       <CreateFolderModal
//         isOpen={isCreateFolderModalOpen}
//         onClose={() => setIsCreateFolderModalOpen(false)}
//         onSubmit={handleCreateFolderSubmit}
//         parentFolderId={selectedFolderId}
//       />

//       {/* Permission Modal */}
//       {permissionResource && (
//         <PermissionModal
//           isOpen={isPermissionModalOpen}
//           onClose={handlePermissionModalClose}
//           resourceId={permissionResource.id}
//           resourceType={permissionResource.type}
//           showToast={showToast} // Pass the toast function to PermissionModal
//         />
//       )}
//     </>
//   );
// };

// export default FileManagement;

import React from "react";
import {
  FiUpload,
  FiFolderPlus,
  FiKey,
  FiFolder,
  FiFile,
  FiMoreVertical,
  FiEdit3,
  FiTrash2,
  FiDownload,
  // FiHeart,
  FiArrowLeft,
} from "react-icons/fi";
import FileList from "./FileList";
import UploadModal from "./UploadModal";
import PermissionModal from "./PermissionModal";
import CreateFolderModal from "../components/CreateFolderModal"; // New import
import {
  useCreateFolder,
  useRootFolders,
  useFoldersByParent,
  useUpdateFolder,
  useDeleteFolder,
  // useToggleFolderFavourite,
} from "../hooks/useFolders";
import { useFiles, useRootFiles, useDownloadFolder } from "../hooks/useFiles";
import { useUserPermissions } from "../hooks/usePermissions";
import type { User, Folder } from "../types";

interface FileManagementProps {
  selectedFolderId: number | null;
  selectedFolderName?: string | null; // NEW prop - optional folder name passed from Dashboard
  selectedFolderPathSegments?: string[]; // NEW prop - breadcrumb segments passed from Dashboard
  searchQuery: string;
  user: User;
  isUploadModalOpen: boolean;
  setIsUploadModalOpen: (open: boolean) => void;
  isPermissionModalOpen: boolean;
  setIsPermissionModalOpen: (open: boolean) => void;
  permissionResource: { id: number; type: "folder" | "file" } | null;
  setPermissionResource: (
    resource: { id: number; type: "folder" | "file" } | null
  ) => void;
  onFolderSelect: (folderId: number | null, folderName?: string | null) => void; // accepts optional name
  onBackNavigation?: () => void;
  showToast?: (
    message: string,
    type: "success" | "error" | "info" | "warning"
  ) => void; // Add toast function
}

const FileManagement: React.FC<FileManagementProps> = ({
  selectedFolderId,
  selectedFolderName,
  selectedFolderPathSegments,
  searchQuery,
  user,
  isUploadModalOpen,
  setIsUploadModalOpen,
  isPermissionModalOpen,
  setIsPermissionModalOpen,
  permissionResource,
  setPermissionResource,
  onFolderSelect,
  onBackNavigation,
  showToast = () => { }, // Default empty function
}) => {
  const { data: files, isLoading: filesLoading } = useFiles(selectedFolderId);
  const { data: rootFiles, isLoading: rootFilesLoading } = useRootFiles();
  const { data: rootFolders, isLoading: rootFoldersLoading } = useRootFolders();
  const { data: subFolders, isLoading: subFoldersLoading } =
    useFoldersByParent(selectedFolderId);
  const createFolder = useCreateFolder();
  const updateFolder = useUpdateFolder();
  const deleteFolder = useDeleteFolder();
  const downloadFolder = useDownloadFolder();
  // const toggleFolderFavourite = useToggleFolderFavourite();
  const { data: userPermissions } = useUserPermissions();

  // State for create folder modal
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] =
    React.useState(false);

  // Debug logging
  console.log("🔍 [FileManagement] Data state:", {
    filesCount: files?.length || 0,
    rootFilesCount: rootFiles?.length || 0,
    rootFoldersCount: rootFolders?.length || 0,
    subFoldersCount: subFolders?.length || 0,
    selectedFolderId,
    selectedFolderName,
    filesLoading,
    rootFilesLoading,
    rootFoldersLoading,
    subFoldersLoading,
    rootFolders:
      rootFolders?.map((f) => ({
        id: f.id,
        name: f.name,
        parent_id: f.parent_id,
      })) || [],
    subFolders:
      subFolders?.map((f) => ({
        id: f.id,
        name: f.name,
        parent_id: f.parent_id,
      })) || [],
  });

  // Check if user has download permission for a folder
  const hasDownloadPermission = (folderId: number) => {
    if (!userPermissions) return false;

    // Check if folder is owned by user (owners have all permissions)
    const allFolders = [...(rootFolders || []), ...(subFolders || [])];
    const folder = allFolders.find((f) => f.id === folderId);
    if (folder && user.id && folder.created_by === user.id) {
      return true;
    }

    // Check direct permission for this folder
    const directPermission = userPermissions.find(
      (perm) => perm.resource_id === folderId && perm.resource_type === "folder"
    );

    if (directPermission) {
      return directPermission.can_download || false;
    }

    // Check inherited permission from parent folder
    if (folder && folder.parent_id) {
      const parentPermission = userPermissions.find(
        (perm) =>
          perm.resource_id === folder.parent_id &&
          perm.resource_type === "folder"
      );

      if (parentPermission) {
        return parentPermission.can_download || false;
      }
    }

    return false;
  };

  // Check if user should see the 3-dot menu for a folder
  const shouldShowThreeDotMenu = (folderId: number): boolean => {
    // Super admin always sees the menu
    if (user.role === "super_admin") return true;

    // Check if user has download permission
    return hasDownloadPermission(folderId);
  };

  // State for dropdown management
  const [openDropdownId, setOpenDropdownId] = React.useState<number | null>(
    null
  );

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => {
      setOpenDropdownId(null);
    };

    if (openDropdownId) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [openDropdownId]);

  const handleFolderClick = (folder: Folder) => {
    console.log("📁 Folder clicked:", folder.name, "ID:", folder.id);
    // Pass both ID and name back to Dashboard so it can show & store the folder name
    onFolderSelect(folder.id, folder.name);
  };

  const handleCreateFolder = () => {
    setIsCreateFolderModalOpen(true);
  };

  const handleCreateFolderSubmit = (name: string) => {
    if (name.trim()) {
      createFolder.mutate(
        { name: name.trim(), parent_id: selectedFolderId },
        {
          onSuccess: () => {
            // Folder created successfully - no navigation needed
            setIsCreateFolderModalOpen(false);
          },
        }
      );
    }
  };

  const handleAssignPermission = (
    resourceId: number,
    resourceType: "folder" | "file"
  ) => {
    setPermissionResource({ id: resourceId, type: resourceType });
    setIsPermissionModalOpen(true);
  };

  // Handle permission modal close with change detection
  const handlePermissionModalClose = () => {
    setIsPermissionModalOpen(false);
    setPermissionResource(null);
  };

  // Get the items to display based on whether we're in root or a specific folder
  const displayFiles = selectedFolderId ? files : rootFiles;
  const displayFolders = selectedFolderId ? subFolders || [] : rootFolders; // Show subfolders when inside a folder
  const isLoading = selectedFolderId
    ? filesLoading || subFoldersLoading
    : rootFilesLoading || rootFoldersLoading;

  // Debug: Log files data
  React.useEffect(() => {
    console.log(
      "🔍 [FileManagement] Display files:",
      displayFiles?.map((f) => ({ id: f.id, name: f.name }))
    );
    console.log("🔍 [FileManagement] Selected folder ID:", selectedFolderId);
    console.log("🔍 [FileManagement] Selected folder Name:", selectedFolderName);
    console.log("🔍 [FileManagement] Files loading:", filesLoading);
    console.log("🔍 [FileManagement] Root files loading:", rootFilesLoading);
  }, [displayFiles, selectedFolderId, selectedFolderName, filesLoading, rootFilesLoading]);

  const filteredFiles =
    displayFiles?.filter((file) =>
      file.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  const filteredFolders =
    displayFolders?.filter((folder) =>
      folder.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  // Calculate total size for display
  const totalSize = filteredFiles.reduce(
    (acc, file) => acc + (file.size || 0),
    0
  );
  const totalItems = filteredFiles.length + filteredFolders.length;

  const handleBackToRoot = () => {
    // Always go to dashboard root, never use navigation history
    onFolderSelect(null);
  };

  const handleRenameFolder = (folderId: number, currentName: string) => {
    const newName = prompt("Enter new folder name", currentName);
    if (newName && newName.trim() && newName !== currentName) {
      updateFolder.mutate({ id: folderId, name: newName.trim() });
    }
    setOpenDropdownId(null);
  };

  const handleDeleteFolder = (folderId: number, folderName: string) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${folderName}"? This action cannot be undone.`
      )
    ) {
      deleteFolder.mutate(folderId);
    }
    setOpenDropdownId(null);
  };

  const handleDropdownToggle = (folderId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenDropdownId(openDropdownId === folderId ? null : folderId);
  };

  const handleDownloadFolder = (folderId: number) => {
    downloadFolder.mutate(folderId);
    setOpenDropdownId(null);
  };

  // const handleToggleFolderFavourite = (
  //   folderId: number,
  //   e: React.MouseEvent
  // ) => {
  //   e.stopPropagation();
  //   toggleFolderFavourite.mutate(folderId, {
  //     onSuccess: (data) => {
  //       console.log("✅ Folder toggle success:", data);
  //     },
  //     onError: (error) => {
  //       console.error("❌ Folder toggle error:", error);
  //     }
  //   });
  //   setOpenDropdownId(null);
  // };

  return (
    <>
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            {selectedFolderId && onBackNavigation && (
              <button
                onClick={onBackNavigation}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                title="Go back to previous folder"
              >
                <FiArrowLeft size={18} />
                <span>Back</span>
              </button>
            )}
            <div>
              <h2 className="text-xl font-bold text-gray-900" title="">
                {selectedFolderId
                  ? "Folder Contents"
                  : "Dashboard - All Files & Folders"}
              </h2>
              {selectedFolderId && (
                <div className="mt-1 text-sm text-gray-700 font-semibold flex items-center flex-wrap gap-1">
                  {selectedFolderPathSegments && selectedFolderPathSegments.length > 0 ? (
                    selectedFolderPathSegments.map((segment, index) => (
                      <React.Fragment key={`${segment}-${index}`}>
                        {index > 0 && <span className="text-gray-400">/</span>}
                        <span
                          className="truncate max-w-[140px] md:max-w-none"
                          title={segment}
                        >
                          {segment}
                        </span>
                      </React.Fragment>
                    ))
                  ) : selectedFolderName ? (
                    <span title={selectedFolderName}>{selectedFolderName}</span>
                  ) : null}
                </div>
              )}
              <p className="text-gray-500 mt-1">
                {totalItems} items{selectedFolderId && ` • ${(totalSize / (1024 * 1024)).toFixed(2)} MBs`}
                {selectedFolderId && (
                  <button
                    onClick={handleBackToRoot}
                    className="ml-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    ← Back to Dashboard
                  </button>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {user.role === "super_admin" && (
              <button
                onClick={handleCreateFolder}
                className="flex items-center space-x-2 px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all hover:shadow-md"
              >
                <FiFolderPlus size={16} />
                <span>Create Folder</span>
              </button>
            )}

            {user.role === "super_admin" && (
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white hover:from-blue-700 hover:to-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all transform hover:scale-105"
              >
                <FiUpload size={18} />
                <span>Upload</span>
              </button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Folders Section */}
            {filteredFolders.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Folders
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredFolders.map((folder) => (
                    <div
                      key={folder.id}
                      onClick={() => handleFolderClick(folder)}
                      className="flex items-center p-4 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-md transition-all cursor-pointer group relative"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg mr-4">
                        <FiFolder className="text-white" size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate group-hover:text-blue-600">
                          {folder.name}
                        </h4>
                        <p className="text-sm text-gray-500">Folder</p>
                      </div>

                      {/* Heart icon */}
                      {/* <button
                        onClick={(e) =>
                          handleToggleFolderFavourite(folder.id, e)
                        }
                        className={`p-2 rounded-xl transition-colors mr-2 ${
                          folder.is_faviourite
                            ? "text-red-500 hover:text-red-600 hover:bg-red-50"
                            : "text-gray-400 hover:text-red-500 hover:bg-red-50"
                        }`}
                        title={
                          folder.is_faviourite
                            ? "Remove from favorites"
                            : "Add to favorites"
                        }
                      >
                        <FiHeart
                          size={16}
                          fill={folder.is_faviourite ? "currentColor" : "none"}
                        />
                      </button> */}

                      {/* 3-dot dropdown menu - Only show if user has download permission or is super admin */}
                      {shouldShowThreeDotMenu(folder.id) && (
                        <div className="relative">
                          <button
                            onClick={(e) => handleDropdownToggle(folder.id, e)}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                            title="More options"
                          >
                            <FiMoreVertical size={16} />
                          </button>

                          {openDropdownId === folder.id && (
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                              <div className="py-1">
                                {user.role === "super_admin" && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAssignPermission(
                                        folder.id,
                                        "folder"
                                      );
                                      setOpenDropdownId(null);
                                    }}
                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  >
                                    <FiKey className="mr-3" size={16} />
                                    Permissions
                                  </button>
                                )}
                                {hasDownloadPermission(folder.id) && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDownloadFolder(folder.id);
                                    }}
                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  >
                                    <FiDownload className="mr-3" size={16} />
                                    Download
                                  </button>
                                )}
                                {user.role === "super_admin" && (
                                  <>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleRenameFolder(
                                          folder.id,
                                          folder.name
                                        );
                                      }}
                                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                      <FiEdit3 className="mr-3" size={16} />
                                      Rename
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteFolder(
                                          folder.id,
                                          folder.name
                                        );
                                      }}
                                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                    >
                                      <FiTrash2 className="mr-3" size={16} />
                                      Delete
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Files Section */}
            {filteredFiles.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {filteredFolders.length > 0 ? "Files" : "All Items"}
                </h3>
                <FileList
                  files={filteredFiles}
                  onAssignPermission={handleAssignPermission}
                  userRole={user.role}
                  userId={user.id}
                  showFavouriteToggle={false}
                />
              </div>
            )}

            {/* Empty State */}
            {totalItems === 0 && !isLoading && (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <FiFile className="text-gray-400" size={32} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {selectedFolderId
                    ? "This folder is empty"
                    : "No files or folders yet"}
                </h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  {selectedFolderId
                    ? "Upload files to this folder or create subfolders to organize your content."
                    : "Get started by uploading your first file or creating a new folder."}
                </p>
                {user.role === "super_admin" && (
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={handleCreateFolder}
                      className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium"
                    >
                      Create Folder
                    </button>
                    <button
                      onClick={() => setIsUploadModalOpen(true)}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-medium"
                    >
                      Upload File
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        folderId={selectedFolderId}
        existingFolderNames={displayFolders?.map((f) => f.name) || []}
      />

      {/* Create Folder Modal */}
      <CreateFolderModal
        isOpen={isCreateFolderModalOpen}
        onClose={() => setIsCreateFolderModalOpen(false)}
        onSubmit={handleCreateFolderSubmit}
        parentFolderId={selectedFolderId}
      />

      {/* Permission Modal */}
      {permissionResource && (
        <PermissionModal
          isOpen={isPermissionModalOpen}
          onClose={handlePermissionModalClose}
          resourceId={permissionResource.id}
          resourceType={permissionResource.type}
          showToast={showToast} // Pass the toast function to PermissionModal
        />
      )}
    </>
  );
};

export default FileManagement;