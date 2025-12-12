// // components/TrashView.tsx
// import React from "react";
// import {
//   FiFolder,
//   FiTrash2,
//   FiMoreVertical,
//   FiRotateCcw,
//   FiArrowLeft,
//   FiClock,
//   //FiCheckSquare, // Added icon
// } from "react-icons/fi";
// import FileList from "./FileList";
// import { useTrashFilesByFolder, usePermanentDeleteFile } from "../hooks/useFiles"; // Added usePermanentDeleteFile
// import { useTrashFoldersByParent, useRestoreFolder, usePermanentDeleteFolder } from "../hooks/useFolders";
// // import { useUserPermissions } from "../hooks/usePermissions";
// import type { User, Folder } from "../types";

// interface TrashViewProps {
//   user: User;
//   selectedFolderId: number | null;
//   onFolderSelect: (folderId: number | null) => void;
//   onBackNavigation?: () => void;
//   onAssignPermission: (resourceId: number, resourceType: "folder" | "file") => void;
// }

// const TrashView: React.FC<TrashViewProps> = ({
//   user,
//   selectedFolderId,
//   onFolderSelect,
//   onBackNavigation,
//   onAssignPermission,
// }) => {
//   const { data: trashFiles, isLoading: filesLoading } = useTrashFilesByFolder(selectedFolderId);
//   const { data: trashFolders, isLoading: foldersLoading } = useTrashFoldersByParent(selectedFolderId);
//   // const { data: userPermissions } = useUserPermissions();

//   // Mutation hooks for restore and permanent delete
//   // const restoreFile = useRestoreFile();
//   const permanentDeleteFile = usePermanentDeleteFile(); // Uncommented/Added
//   const restoreFolder = useRestoreFolder();
//   const permanentDeleteFolder = usePermanentDeleteFolder();

//   // State for dropdown management
//   const [openDropdownId, setOpenDropdownId] = React.useState<number | null>(null);

//   // State for Select All
//   const [isAllFilesSelected, setIsAllFilesSelected] = React.useState(false);

//   // Close dropdown when clicking outside
//   React.useEffect(() => {
//     const handleClickOutside = () => {
//       setOpenDropdownId(null);
//     };

//     if (openDropdownId) {
//       document.addEventListener('click', handleClickOutside);
//       return () => document.removeEventListener('click', handleClickOutside);
//     }
//   }, [openDropdownId]);

//   // Reset selection when folder changes
//   React.useEffect(() => {
//     setIsAllFilesSelected(false);
//   }, [selectedFolderId]);

//   const handleFolderClick = (folder: Folder) => {
//     console.log("📁 Trash folder clicked:", folder.name, "ID:", folder.id);
//     onFolderSelect(folder.id);
//   };

//   const handleBackClick = () => {
//     console.log("🔙 Going back to previous folder");
//     if (onBackNavigation) {
//       onBackNavigation();
//     } else {
//       onFolderSelect(null);
//     }
//   };

//   const handleDropdownToggle = (folderId: number, e: React.MouseEvent) => {
//     e.stopPropagation();
//     setOpenDropdownId(openDropdownId === folderId ? null : folderId);
//   };

//   const handleRestoreFolder = (folderId: number, folderName: string) => {
//     if (window.confirm(`Are you sure you want to restore "${folderName}"?`)) {
//       restoreFolder.mutate(folderId, {
//         onSuccess: () => {
//           console.log("✅ Folder restored successfully");
//         },
//         onError: (error: any) => {
//           console.error("❌ Failed to restore folder:", error);
//           alert("Failed to restore folder. Please try again.");
//         },
//       });
//     }
//     setOpenDropdownId(null);
//   };

//   const handlePermanentDeleteFolder = (folderId: number, folderName: string) => {
//     if (window.confirm(`Are you sure you want to permanently delete "${folderName}"? This action cannot be undone.`)) {
//       permanentDeleteFolder.mutate(folderId, {
//         onSuccess: () => {
//           console.log("✅ Folder permanently deleted");
//         },
//         onError: (error: any) => {
//           console.error("❌ Failed to permanently delete folder:", error);
//           alert("Failed to permanently delete folder. Please try again.");
//         },
//       });
//     }
//     setOpenDropdownId(null);
//   };

//   // Logic to delete all selected files
//   const handleDeleteAllFiles = () => {
//     if (!trashFiles || trashFiles.length === 0) return;

//     const confirmMessage = `Are you sure you want to permanently delete all ${trashFiles.length} files in this view? This action cannot be undone.`;

//     if (window.confirm(confirmMessage)) {
//       // Iterate and delete each file
//       trashFiles.forEach((file) => {
//         permanentDeleteFile.mutate(file.id, {
//           onError: (error: any) => {
//             console.error(`❌ Failed to delete file ${file.name}:`, error);
//           }
//         });
//       });
//       setIsAllFilesSelected(false);
//       console.log("✅ Bulk delete initiated for files");
//     }
//   };

//   const calculateRemainingDays = (deletedAt?: string | null) => {
//     if (!deletedAt) return 30;
//     const deletedDate = new Date(deletedAt);
//     const deletionDeadline = new Date(deletedDate);
//     deletionDeadline.setDate(deletedDate.getDate() + 30);

//     const now = new Date();
//     const timeDiff = deletionDeadline.getTime() - now.getTime();
//     const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));

//     return daysLeft > 0 ? daysLeft : 0;
//   };

//   const isLoading = filesLoading || foldersLoading;
//   const totalItems = (trashFiles?.length || 0) + (trashFolders?.length || 0);

//   return (
//     <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 p-6">
//       <div className="flex items-center justify-between mb-8">
//         <div className="flex items-center space-x-4">
//           {selectedFolderId && (
//             <button
//               onClick={handleBackClick}
//               className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
//             >
//               <FiArrowLeft size={18} />
//               <span>Back</span>
//             </button>
//           )}
//           <div>
//             <h2 className="text-xl font-bold text-gray-900 flex items-center">
//               <FiTrash2 className="text-red-500 mr-2" size={24} />
//               Trash
//               {selectedFolderId && (
//                 <span className="ml-2 text-sm font-normal text-gray-500">
//                   - Folder Contents
//                 </span>
//               )}
//             </h2>
//             <p className="text-gray-500 mt-1">
//               {totalItems} deleted items
//             </p>
//             <p className="text-red-500 text-sm mt-1 font-medium">
//               The files and folders will be deleted permanently after 30 days
//             </p>
//           </div>
//         </div>

//         {/* Select All & Delete All Controls */}
//         <div className="flex items-center space-x-4">
//           {trashFiles && trashFiles.length > 0 && (
//             <>
//               <label className="flex items-center space-x-2 cursor-pointer select-none px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
//                 <input
//                   type="checkbox"
//                   checked={isAllFilesSelected}
//                   onChange={(e) => setIsAllFilesSelected(e.target.checked)}
//                   className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
//                 />
//                 <span className="text-sm font-medium text-gray-700">Select All Files</span>
//               </label>

//               {isAllFilesSelected && (
//                 <button
//                   onClick={handleDeleteAllFiles}
//                   className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors shadow-sm"
//                 >
//                   <FiTrash2 size={16} />
//                   <span>Delete All ({trashFiles.length})</span>
//                 </button>
//               )}
//             </>
//           )}
//         </div>
//       </div>

//       {isLoading ? (
//         <div className="flex justify-center py-16">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//         </div>
//       ) : (
//         <div className="space-y-6">
//           {/* Trash Folders Section */}
//           {trashFolders && trashFolders.length > 0 && (
//             <div>
//               <h3 className="text-lg font-semibold text-gray-900 mb-4">
//                 Deleted Folders
//               </h3>
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
//                 {trashFolders.map((folder) => {
//                   const daysLeft = calculateRemainingDays(folder.deleted_at);
//                   return (
//                     <div
//                       key={folder.id}
//                       onClick={() => handleFolderClick(folder)}
//                       className="flex items-center p-4 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-md transition-all cursor-pointer group relative opacity-75"
//                     >
//                       <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-500 rounded-lg flex items-center justify-center shadow-lg mr-4">
//                         <FiFolder className="text-white" size={20} />
//                       </div>
//                       <div className="flex-1 min-w-0">
//                         <h4 className="font-medium text-gray-900 truncate group-hover:text-blue-600">
//                           {folder.name}
//                         </h4>
//                         <div className="flex items-center text-xs text-red-500 font-medium mt-1">
//                           <FiClock className="mr-1" size={12} />
//                           {daysLeft} days left
//                         </div>
//                       </div>

//                       {/* 3-dot dropdown menu */}
//                       <div className="relative">
//                         <button
//                           onClick={(e) => handleDropdownToggle(folder.id, e)}
//                           className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
//                           title="More options"
//                         >
//                           <FiMoreVertical size={16} />
//                         </button>

//                         {openDropdownId === folder.id && (
//                           <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
//                             <div className="py-1">
//                               <button
//                                 onClick={(e) => {
//                                   e.stopPropagation();
//                                   handleRestoreFolder(folder.id, folder.name);
//                                 }}
//                                 className="flex items-center w-full px-4 py-2 text-sm text-green-600 hover:bg-green-50"
//                               >
//                                 <FiRotateCcw className="mr-3" size={16} />
//                                 Restore
//                               </button>
//                               <button
//                                 onClick={(e) => {
//                                   e.stopPropagation();
//                                   handlePermanentDeleteFolder(folder.id, folder.name);
//                                 }}
//                                 className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
//                               >
//                                 <FiTrash2 className="mr-3" size={16} />
//                                 Delete Forever
//                               </button>
//                             </div>
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>
//           )}

//           {/* Trash Files Section */}
//           {trashFiles && trashFiles.length > 0 && (
//             <div>
//               <h3 className="text-lg font-semibold text-gray-900 mb-4">
//                 {trashFolders && trashFolders.length > 0 ? "Deleted Files" : "All Deleted Items"}
//               </h3>
//               <FileList
//                 files={trashFiles}
//                 onAssignPermission={onAssignPermission}
//                 userRole={user.role}
//                 userId={user.id}
//                 showFavouriteToggle={false}
//                 isTrashView={true}
//               />
//             </div>
//           )}

//           {/* Empty State */}
//           {totalItems === 0 && !isLoading && (
//             <div className="text-center py-16">
//               <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center mx-auto mb-6">
//                 <FiTrash2 className="text-gray-400" size={32} />
//               </div>
//               <h3 className="text-xl font-semibold text-gray-900 mb-2">
//                 Trash is empty
//               </h3>
//               <p className="text-gray-500 mb-6 max-w-md mx-auto">
//                 Deleted files and folders will appear here. You can restore them or delete them permanently.
//               </p>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default TrashView;
// components/TrashView.tsx
import React from "react";
import {
  FiFolder,
  FiTrash2,
  FiMoreVertical,
  FiRotateCcw,
  FiArrowLeft,
  FiClock,
} from "react-icons/fi";
import FileList from "./FileList";
import { useTrashFilesByFolder, useBulkPermanentDeleteFiles } from "../hooks/useFiles";
import { useTrashFoldersByParent, useRestoreFolder, usePermanentDeleteFolder } from "../hooks/useFolders";
// import { useUserPermissions } from "../hooks/usePermissions";
import type { User, Folder } from "../types";

interface TrashViewProps {
  user: User;
  selectedFolderId: number | null;
  onFolderSelect: (folderId: number | null) => void;
  onBackNavigation?: () => void;
  onAssignPermission: (resourceId: number, resourceType: "folder" | "file") => void;
}

const TrashView: React.FC<TrashViewProps> = ({
  user,
  selectedFolderId,
  onFolderSelect,
  onBackNavigation,
  onAssignPermission,
}) => {
  const { data: trashFiles, isLoading: filesLoading } = useTrashFilesByFolder(selectedFolderId);
  const { data: trashFolders, isLoading: foldersLoading } = useTrashFoldersByParent(selectedFolderId);

  // Mutation hooks

  const bulkPermanentDeleteFiles = useBulkPermanentDeleteFiles();
  const restoreFolder = useRestoreFolder();
  const permanentDeleteFolder = usePermanentDeleteFolder();

  // State for dropdown management
  const [openDropdownId, setOpenDropdownId] = React.useState<number | null>(null);

  // State for File Selection (Array of IDs allows individual selection)
  const [selectedFileIds, setSelectedFileIds] = React.useState<number[]>([]);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => {
      setOpenDropdownId(null);
    };

    if (openDropdownId) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openDropdownId]);

  // Reset selection when folder changes
  React.useEffect(() => {
    setSelectedFileIds([]);
  }, [selectedFolderId]);

  const handleFolderClick = (folder: Folder) => {
    console.log("📁 Trash folder clicked:", folder.name, "ID:", folder.id);
    onFolderSelect(folder.id);
  };

  const handleBackClick = () => {
    console.log("🔙 Going back to previous folder");
    if (onBackNavigation) {
      onBackNavigation();
    } else {
      onFolderSelect(null);
    }
  };

  const handleDropdownToggle = (folderId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenDropdownId(openDropdownId === folderId ? null : folderId);
  };

  const handleRestoreFolder = (folderId: number, folderName: string) => {
    if (window.confirm(`Are you sure you want to restore "${folderName}"?`)) {
      restoreFolder.mutate(folderId, {
        onSuccess: () => {
          console.log("✅ Folder restored successfully");
        },
        onError: (error: any) => {
          console.error("❌ Failed to restore folder:", error);
          alert("Failed to restore folder. Please try again.");
        },
      });
    }
    setOpenDropdownId(null);
  };

  const handlePermanentDeleteFolder = (folderId: number, folderName: string) => {
    if (window.confirm(`Are you sure you want to permanently delete "${folderName}"? This action cannot be undone.`)) {
      permanentDeleteFolder.mutate(folderId, {
        onSuccess: () => {
          console.log("✅ Folder permanently deleted");
        },
        onError: (error: any) => {
          console.error("❌ Failed to permanently delete folder:", error);
          alert("Failed to permanently delete folder. Please try again.");
        },
      });
    }
    setOpenDropdownId(null);
  };

  // --- Selection Logic ---

  // 1. Toggle Single File
  const handleToggleFileSelection = (fileId: number) => {
    setSelectedFileIds((prev) =>
      prev.includes(fileId)
        ? prev.filter((id) => id !== fileId)
        : [...prev, fileId]
    );
  };

  // 2. Toggle "Select All"
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked && trashFiles) {
      // Select all IDs
      setSelectedFileIds(trashFiles.map((f) => f.id));
    } else {
      // Clear selection
      setSelectedFileIds([]);
    }
  };

  // 3. Delete Selected Files
  const handleDeleteSelectedFiles = () => {
    if (selectedFileIds.length === 0) return;

    const confirmMessage = `Are you sure you want to permanently delete these ${selectedFileIds.length} files? This action cannot be undone.`;

    if (window.confirm(confirmMessage)) {
      bulkPermanentDeleteFiles.mutate(selectedFileIds, {
        onSuccess: () => {
          setSelectedFileIds([]);
          console.log("✅ Bulk delete successful");
        },
        onError: (error: any) => {
          console.error("❌ Bulk delete failed:", error);
        }
      });
    }
  };

  // Helper to check if "Select All" box should be checked
  const isAllSelected = trashFiles && trashFiles.length > 0 && selectedFileIds.length === trashFiles.length;

  const calculateRemainingDays = (deletedAt?: string | null) => {
    if (!deletedAt) return 30;
    const deletedDate = new Date(deletedAt);
    const deletionDeadline = new Date(deletedDate);
    deletionDeadline.setDate(deletedDate.getDate() + 30);

    const now = new Date();
    const timeDiff = deletionDeadline.getTime() - now.getTime();
    const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));

    return daysLeft > 0 ? daysLeft : 0;
  };

  const isLoading = filesLoading || foldersLoading;
  const totalItems = (trashFiles?.length || 0) + (trashFolders?.length || 0);

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          {selectedFolderId && (
            <button
              onClick={handleBackClick}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiArrowLeft size={18} />
              <span>Back</span>
            </button>
          )}
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <FiTrash2 className="text-red-500 mr-2" size={24} />
              Trash
              {selectedFolderId && (
                <span className="ml-2 text-sm font-normal text-gray-500">
                  - Folder Contents
                </span>
              )}
            </h2>
            <p className="text-gray-500 mt-1">
              {totalItems} deleted items
            </p>
            <p className="text-red-500 text-sm mt-1 font-medium">
              The files and folders will be deleted permanently after 30 days
            </p>
          </div>
        </div>

        {/* Select All & Delete Selected Controls */}
        <div className="flex items-center space-x-4">
          {trashFiles && trashFiles.length > 0 && (
            <>
              <label className="flex items-center space-x-2 cursor-pointer select-none px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                  className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-sm font-medium text-gray-700">Select All Files</span>
              </label>

              {selectedFileIds.length > 0 && (
                <button
                  onClick={handleDeleteSelectedFiles}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors shadow-sm"
                >
                  <FiTrash2 size={16} />
                  <span>Delete Selected ({selectedFileIds.length})</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Trash Folders Section */}
          {trashFolders && trashFolders.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Deleted Folders
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {trashFolders.map((folder) => {
                  const daysLeft = calculateRemainingDays(folder.deleted_at);
                  return (
                    <div
                      key={folder.id}
                      onClick={() => handleFolderClick(folder)}
                      className="flex items-center p-4 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-md transition-all cursor-pointer group relative opacity-75"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-500 rounded-lg flex items-center justify-center shadow-lg mr-4">
                        <FiFolder className="text-white" size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate group-hover:text-blue-600">
                          {folder.name}
                        </h4>
                        <div className="flex items-center text-xs text-red-500 font-medium mt-1">
                          <FiClock className="mr-1" size={12} />
                          {daysLeft} days left
                        </div>
                      </div>

                      {/* 3-dot dropdown menu */}
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
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRestoreFolder(folder.id, folder.name);
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-green-600 hover:bg-green-50"
                              >
                                <FiRotateCcw className="mr-3" size={16} />
                                Restore
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePermanentDeleteFolder(folder.id, folder.name);
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                              >
                                <FiTrash2 className="mr-3" size={16} />
                                Delete Forever
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Trash Files Section */}
          {trashFiles && trashFiles.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {trashFolders && trashFolders.length > 0 ? "Deleted Files" : "All Deleted Items"}
              </h3>
              <FileList
                files={trashFiles}
                onAssignPermission={onAssignPermission}
                userRole={user.role}
                userId={user.id}
                showFavouriteToggle={false}
                isTrashView={true}
                // 👇 Passing the selection props so checkboxes appear in the list
                selectedFileIds={selectedFileIds}
                onToggleSelection={handleToggleFileSelection}
              />
            </div>
          )}

          {/* Empty State */}
          {totalItems === 0 && !isLoading && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <FiTrash2 className="text-gray-400" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Trash is empty
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Deleted files and folders will appear here. You can restore them or delete them permanently.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TrashView;