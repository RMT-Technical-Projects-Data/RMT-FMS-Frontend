// // components/FileList.tsx
// import React from "react";
// import type { File } from "../types";
// import {
//   // useDownloadFile,
//   useDeleteFile,
//   // useToggleFileFavourite,
//   useRestoreFile,
//   usePermanentDeleteFile,
// } from "../hooks/useFiles";
// import { useUserPermissions } from "../hooks/usePermissions";
// import {
//   FiDownload,
//   FiKey,
//   FiFile,
//   FiImage,
//   FiVideo,
//   FiMusic,
//   FiArchive,
//   FiFileText,
//   FiTrash2,
//   // FiHeart,
//   FiRotateCcw,
//   FiExternalLink,
//   FiMove,
//   FiClock,
// } from "react-icons/fi";
// import MoveFileModal from "./MoveFileModal";

// interface FileListProps {
//   files: File[];
//   onAssignPermission: (resourceId: number, resourceType: "file") => void;
//   userRole: string;
//   userId?: number;
//   showFavouriteToggle?: boolean;
//   isTrashView?: boolean;
// }

// const FileList: React.FC<FileListProps> = ({
//   files,
//   onAssignPermission,
//   userRole,
//   userId,
//   isTrashView = false,
// }) => {
//   // const downloadFile = useDownloadFile();
//   const deleteFile = useDeleteFile();
//   // const toggleFavourite = useToggleFileFavourite();
//   const restoreFile = useRestoreFile();
//   const permanentDeleteFile = usePermanentDeleteFile();
//   const { data: userPermissions } = useUserPermissions();

//   // State for move modal
//   const [moveModalOpen, setMoveModalOpen] = React.useState(false);
//   const [selectedFileForMove, setSelectedFileForMove] = React.useState<{
//     id: number;
//     name: string;
//   } | null>(null);

//   const handleMoveClick = (fileId: number, fileName: string) => {
//     console.log("🖱️ Move icon clicked:", { fileId, fileName });
//     setSelectedFileForMove({ id: fileId, name: fileName });
//     setMoveModalOpen(true);
//     console.log("✅ setMoveModalOpen(true) called");
//   };

//   // Check if user has download permission for a file
//   const hasDownloadPermission = (fileId: number) => {
//     if (!userPermissions) return false;

//     // Check if file is owned by user (owners have all permissions)
//     const file = files.find((f) => f.id === fileId);
//     if (file && userId && file.created_by === userId) {
//       return true;
//     }

//     // Check direct permission for this file
//     const directPermission = userPermissions.find(
//       (perm) => perm.resource_id === fileId && perm.resource_type === "file"
//     );

//     if (directPermission) {
//       return directPermission.can_download || false;
//     }

//     // Check inherited permission from parent folder
//     if (file && file.folder_id) {
//       const folderPermission = userPermissions.find(
//         (perm) =>
//           perm.resource_id === file.folder_id && perm.resource_type === "folder"
//       );

//       if (folderPermission) {
//         return folderPermission.can_download || false;
//       }
//     }

//     return false;
//   };

//   // Check if user has view permission for a file
//   const hasViewPermission = (fileId: number) => {
//     if (!userPermissions) return false;

//     // Check if file is owned by user (owners have all permissions)
//     const file = files.find((f) => f.id === fileId);
//     if (file && userId && file.created_by === userId) {
//       return true;
//     }

//     // Check direct permission for this file
//     const directPermission = userPermissions.find(
//       (perm) => perm.resource_id === fileId && perm.resource_type === "file"
//     );

//     if (directPermission) {
//       return directPermission.can_read || false;
//     }

//     // Check inherited permission from parent folder
//     if (file && file.folder_id) {
//       const folderPermission = userPermissions.find(
//         (perm) =>
//           perm.resource_id === file.folder_id && perm.resource_type === "folder"
//       );

//       if (folderPermission) {
//         return folderPermission.can_read || false;
//       }
//     }

//     return false;
//   };

//   const handleDownload = async (file: File) => {
//     try {
//       console.log(
//         `🖱️ Download button clicked - ID: ${file.id}, Name: ${file.name}`
//       );

//       // Validate file ID
//       if (!file.id || isNaN(file.id)) {
//         console.error("Invalid file ID:", file.id);
//         return;
//       }

//       // Check if file exists in the current files list
//       const fileExists = files.find((f) => f.id === file.id);
//       if (!fileExists) {
//         console.error(
//           `File with ID ${file.id} not found in current files list`
//         );
//         return;
//       }

//       const token = localStorage.getItem("token");
//       if (!token) {
//         console.error("No token found");
//         return;
//       }

//       // Use the correct backend endpoint: /files/download/{id}
//       const fileUrl = `https://rmtfms.duckdns.org/api/files/download/${file.id}`;
//       console.log(`📥 Downloading from: ${fileUrl}`);

//       const response = await fetch(fileUrl, {
//         method: "GET",
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       if (!response.ok) {
//         console.error("Failed to download file");
//         return;
//       }

//       // Get filename from headers or fallback
//       const disposition = response.headers.get("content-disposition");
//       let filename = file.name;
//       if (disposition && disposition.includes("filename=")) {
//         filename = disposition
//           .split("filename=")[1]
//           .replace(/['"]/g, "")
//           .trim();
//       }

//       // Convert to blob and trigger download
//       const blob = await response.blob();
//       const blobUrl = window.URL.createObjectURL(blob);

//       const a = document.createElement("a");
//       a.href = blobUrl;
//       a.download = filename; // ✅ triggers direct download
//       document.body.appendChild(a);
//       a.click();
//       a.remove();

//       // Cleanup blob URL
//       window.URL.revokeObjectURL(blobUrl);
//     } catch (error) {
//       console.error("Error downloading file:", error);
//     }
//   };

//   const handleOpenFile = async (fileId: number, token: string) => {
//     try {
//       // 1️⃣ Ask backend for short-lived signed URL
//       const res = await fetch(
//         `https://rmtfms.duckdns.org/api/files/open/${fileId}/url`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       if (!res.ok) throw new Error("Failed to get file URL");
//       const data = await res.json();

//       // 2️⃣ Open signed URL directly — no token required in headers
//       window.open(data.url, "_blank", "noopener,noreferrer");
//     } catch (err) {
//       console.error("❌ Error opening file:", err);
//       alert("Failed to open file. Please try again.");
//     }
//   };

//   const handleDelete = (fileId: number, fileName: string) => {
//     if (window.confirm(`Are you sure you want to delete "${fileName}"?`)) {
//       deleteFile.mutate(fileId);
//     }
//   };

//   // const handleToggleFavourite = (fileId: number, e: React.MouseEvent) => {
//   //   e.stopPropagation();
//   //   toggleFavourite.mutate(fileId, {
//   //     onSuccess: (data) => {
//   //       console.log("✅ File toggle success:", data);
//   //     },
//   //     onError: (error) => {
//   //       console.error("❌ File toggle error:", error);
//   //     }
//   //   });
//   // };

//   const handleRestore = (fileId: number, fileName: string) => {
//     if (window.confirm(`Are you sure you want to restore "${fileName}"?`)) {
//       restoreFile.mutate(fileId, {
//         onSuccess: () => {
//           console.log("✅ File restored successfully");
//         },
//         onError: (error: any) => {
//           console.error("❌ Failed to restore file:", error);
//           alert("Failed to restore file. Please try again.");
//         },
//       });
//     }
//   };

//   const handlePermanentDelete = (fileId: number, fileName: string) => {
//     if (
//       window.confirm(
//         `Are you sure you want to permanently delete "${fileName}"? This action cannot be undone.`
//       )
//     ) {
//       permanentDeleteFile.mutate(fileId, {
//         onSuccess: () => {
//           console.log("✅ File permanently deleted");
//         },
//         onError: (error: any) => {
//           console.error("❌ Failed to permanently delete file:", error);
//           alert("Failed to permanently delete file. Please try again.");
//         },
//       });
//     }
//   };

//   const formatFileSize = (bytes: number) => {
//     if (bytes === 0) return "0 Bytes";
//     const k = 1024;
//     const sizes = ["Bytes", "KB", "MB", "GB"];
//     const i = Math.floor(Math.log(bytes) / Math.log(k));
//     return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
//   };

//   const getFileIcon = (mimeType: string) => {
//     if (mimeType.startsWith("image/")) return FiImage;
//     if (mimeType.startsWith("video/")) return FiVideo;
//     if (mimeType.startsWith("audio/")) return FiMusic;
//     if (mimeType.includes("pdf")) return FiFileText;
//     if (mimeType.includes("zip") || mimeType.includes("compressed"))
//       return FiArchive;
//     if (mimeType.includes("text") || mimeType.includes("document"))
//       return FiFileText;
//     return FiFile;
//   };

//   const getFileColor = (mimeType: string) => {
//     if (mimeType.startsWith("image/")) return "text-green-600 bg-green-50";
//     if (mimeType.startsWith("video/")) return "text-purple-600 bg-purple-50";
//     if (mimeType.startsWith("audio/")) return "text-yellow-600 bg-yellow-50";
//     if (mimeType.includes("pdf")) return "text-red-600 bg-red-50";
//     if (mimeType.includes("zip")) return "text-orange-600 bg-orange-50";
//     return "text-blue-600 bg-blue-50";
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

//   return (
//     <div className="space-y-4">
//       {files.length === 0 ? (
//         <div className="text-center py-16">
//           <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
//             <FiFile className="h-12 w-12 text-gray-400" />
//           </div>
//           <h3 className="text-lg font-semibold text-gray-900 mb-2">
//             No files found
//           </h3>
//           <p className="text-gray-500 max-w-sm mx-auto">
//             {files.length === 0
//               ? "Get started by uploading your first file."
//               : "No files match your search."}
//           </p>
//         </div>
//       ) : (
//         <div className="grid gap-4">
//           {files.map((file) => {
//             const FileIcon = getFileIcon(file.mime_type);
//             const fileColor = getFileColor(file.mime_type);
//             const canView = hasViewPermission(file.id);
//             const canDownload = hasDownloadPermission(file.id);

//             return (
//               <div
//                 key={file.id}
//                 className={`flex items-center space-x-4 p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200 ${canView ? "cursor-pointer" : "cursor-not-allowed opacity-50"
//                   } ${isTrashView ? "opacity-75" : ""}`}
//               >
//                 <div className={`p-3 rounded-xl ${fileColor}`}>
//                   <FileIcon size={24} />
//                 </div>

//                 <div className="flex-1 min-w-0">
//                   <h4 className="font-semibold text-gray-900 truncate">
//                     {file.name}
//                   </h4>
//                   <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
//                     <span>{formatFileSize(file.size || 0)}</span>
//                     <span>•</span>
//                     <span>
//                       {new Date(file.created_at).toLocaleDateString()}
//                     </span>
//                     {isTrashView && (
//                       <>
//                         <span>•</span>
//                         <span className="text-red-500 text-xs font-medium flex items-center">
//                           <FiClock className="mr-1" size={12} />
//                           {calculateRemainingDays(file.deleted_at)} days left
//                         </span>
//                       </>
//                     )}
//                     {/* {file.mime_type && (
//                       <>
//                         <span>•</span>
//                         <span className="capitalize">
//                           {file.mime_type.split("/")[1] || file.mime_type}
//                         </span>
//                       </>
//                     )} */}
//                     {!canView && (
//                       <span className="text-red-500 text-xs font-medium">
//                         No view permission
//                       </span>
//                     )}
//                   </div>
//                 </div>

//                 <div className="flex items-center space-x-2">
//                   {/* Heart icon for favourites */}
//                   {/* {showFavouriteToggle && (
//                     <button
//                       onClick={(e) => {
//                         console.log("🖱️ Heart clicked for file:", file.id, "favourited:", file.favourited);
//                         handleToggleFavourite(file.id, e);
//                       }}
//                       className={`p-2 rounded-xl transition-colors ${
//                         file.is_faviourite
//                           ? "text-red-500 hover:text-red-600 hover:bg-red-50"
//                           : "text-gray-400 hover:text-red-500 hover:bg-red-50"
//                       }`}
//                       title={
//                         file.is_faviourite
//                           ? "Remove from favorites"
//                           : "Add to favorites"
//                       }
//                     >
//                       <FiHeart
//                         size={18}
//                         fill={file.is_faviourite ? "currentColor" : "none"}
//                       />
//                     </button>
//                   )} */}

//                   {/* Move button (left of Open in new window) */}
//                   {canView && !isTrashView && userRole === "super_admin" && (
//                     <button
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         handleMoveClick(file.id, file.name);
//                       }}
//                       className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
//                       title="Move File"
//                     >
//                       <FiMove size={18} />
//                     </button>
//                   )}

//                   {/* Open in new window button (for view permission) */}
//                   {canView && !isTrashView && (
//                     <button
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         const token = localStorage.getItem("token") || "";
//                         handleOpenFile(file.id, token);
//                       }}
//                       className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
//                       title="Open in new window"
//                     >
//                       <FiExternalLink size={18} />
//                     </button>
//                   )}

//                   {/* Download button (for download permission) */}
//                   {canDownload && !isTrashView && (
//                     <button
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         handleDownload(file);
//                       }}
//                       className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-xl transition-colors"
//                       title="Download"
//                     >
//                       <FiDownload size={18} />
//                     </button>
//                   )}

//                   {userRole === "super_admin" &&
//                     !isTrashView &&
//                     !file.folder_id && (
//                       <button
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           onAssignPermission(file.id, "file");
//                         }}
//                         className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-colors"
//                         title="Set Permissions"
//                       >
//                         <FiKey size={18} />
//                       </button>
//                     )}

//                   {/* Trash view actions */}
//                   {isTrashView && (
//                     <>
//                       <button
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           handleRestore(file.id, file.name);
//                         }}
//                         className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-xl transition-colors"
//                         title="Restore"
//                       >
//                         <FiRotateCcw size={18} />
//                       </button>
//                       <button
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           handlePermanentDelete(file.id, file.name);
//                         }}
//                         className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
//                         title="Delete Forever"
//                       >
//                         <FiTrash2 size={18} />
//                       </button>
//                     </>
//                   )}

//                   {/* Regular view actions */}
//                   {!isTrashView && userRole === "super_admin" && (
//                     <button
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         handleDelete(file.id, file.name);
//                       }}
//                       className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
//                       title="Delete"
//                     >
//                       <FiTrash2 size={18} />
//                     </button>
//                   )}
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       )}
//       {/* Move File Modal */}
//       <MoveFileModal
//         isOpen={moveModalOpen}
//         onClose={() => {
//           console.log("❌ Closing move modal");
//           setMoveModalOpen(false);
//           setSelectedFileForMove(null);
//         }}
//         fileId={selectedFileForMove?.id || null}
//         fileName={selectedFileForMove?.name || ""}
//       />
//     </div>
//   );
// };

// export default FileList;

// components/FileList.tsx
import React from "react";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../config";
import type { File } from "../types";
import {
  // useDownloadFile,
  useDeleteFile,
  // useToggleFileFavourite,
  useRestoreFile,
  usePermanentDeleteFile,
  useUpdateFile,
  useArchiveFile,
  useUnarchiveFile,
} from "../hooks/useFiles";
import { useUserPermissions } from "../hooks/usePermissions";
import {
  FiDownload,
  FiKey,
  FiFile,
  FiImage,
  FiVideo,
  FiMusic,
  FiArchive,
  FiFileText,
  FiTrash2,
  // FiHeart,
  FiRotateCcw,
  FiExternalLink,
  FiMove,
  FiClock,
  FiEdit3,
} from "react-icons/fi";
import MoveFileModal from "./MoveFileModal";
import ConfirmModal, { type ConfirmTone } from "./ConfirmModal";
import PromptModal from "./PromptModal";
import StampChoiceModal from "./StampChoiceModal";
import type { ViewMode } from "../types";

type FileConfirmAction =
  | "delete"
  | "archive"
  | "unarchive"
  | "restore"
  | "permanentDelete";

interface FileListProps {
  files: File[];
  onAssignPermission: (resourceId: number, resourceType: "file") => void;
  userRole: string;
  userId?: number;
  showFavouriteToggle?: boolean;
  isTrashView?: boolean;
  isArchiveView?: boolean;
  viewMode?: ViewMode;
  selectedFileIds?: number[];
  onToggleSelection?: (fileId: number) => void;
}

const FileList: React.FC<FileListProps> = ({
  files,
  onAssignPermission,
  userRole,
  userId,
  isTrashView = false,
  isArchiveView = false,
  viewMode = "list",
  selectedFileIds,
  onToggleSelection,
}) => {
  // const downloadFile = useDownloadFile();
  const deleteFile = useDeleteFile();
  const updateFile = useUpdateFile();
  const archiveFileMutation = useArchiveFile();
  const unarchiveFileMutation = useUnarchiveFile();
  // const toggleFavourite = useToggleFileFavourite();
  const restoreFile = useRestoreFile();
  const permanentDeleteFile = usePermanentDeleteFile();
  const { data: userPermissions } = useUserPermissions();

  // State for move modal
  const [moveModalOpen, setMoveModalOpen] = React.useState(false);
  const [selectedFileForMove, setSelectedFileForMove] = React.useState<{
    id: number;
    name: string;
  } | null>(null);

  const [renameTarget, setRenameTarget] = React.useState<{
    id: number;
    name: string;
  } | null>(null);
  const [dateEditTarget, setDateEditTarget] = React.useState<{
    id: number;
    date: string;
  } | null>(null);
  const [confirmTarget, setConfirmTarget] = React.useState<{
    id: number;
    name: string;
    action: FileConfirmAction;
  } | null>(null);
  const [downloadTarget, setDownloadTarget] = React.useState<{
    id: number;
    name: string;
  } | null>(null);
  const [isDownloading, setIsDownloading] = React.useState(false);

  // Super Admin discreet upload-date edit (5 rapid clicks on the date)
  const dateClickRef = React.useRef<{ fileId: number | null; count: number; timer: ReturnType<typeof setTimeout> | null }>({
    fileId: null,
    count: 0,
    timer: null,
  });

  const handleMoveClick = (fileId: number, fileName: string) => {
    console.log("🖱️ Move icon clicked:", { fileId, fileName });
    setSelectedFileForMove({ id: fileId, name: fileName });
    setMoveModalOpen(true);
    console.log("✅ setMoveModalOpen(true) called");
  };

  // Check if user has download permission for a file
  const hasDownloadPermission = (fileId: number) => {
    if (userRole === "super_admin") return true;
    if (!userPermissions) return false;

    // Check if file is owned by user (owners have all permissions)
    const file = files.find((f) => f.id === fileId);
    if (file && userId && file.created_by === userId) {
      return true;
    }

    // Check direct permission for this file
    const directPermission = userPermissions.find(
      (perm) => perm.resource_id === fileId && perm.resource_type === "file"
    );

    if (directPermission) {
      return directPermission.can_download || false;
    }

    // Check inherited permission from parent folder
    if (file && file.folder_id) {
      const folderPermission = userPermissions.find(
        (perm) =>
          perm.resource_id === file.folder_id && perm.resource_type === "folder"
      );

      if (folderPermission) {
        return folderPermission.can_download || false;
      }
    }

    return false;
  };

  // Check if user has view permission for a file
  const hasViewPermission = (fileId: number) => {
    if (userRole === "super_admin") return true;
    if (!userPermissions) return false;

    // Check if file is owned by user (owners have all permissions)
    const file = files.find((f) => f.id === fileId);
    if (file && userId && file.created_by === userId) {
      return true;
    }

    // Check direct permission for this file
    const directPermission = userPermissions.find(
      (perm) => perm.resource_id === fileId && perm.resource_type === "file"
    );

    if (directPermission) {
      return directPermission.can_read || false;
    }

    // Check inherited permission from parent folder
    if (file && file.folder_id) {
      const folderPermission = userPermissions.find(
        (perm) =>
          perm.resource_id === file.folder_id && perm.resource_type === "folder"
      );

      if (folderPermission) {
        return folderPermission.can_read || false;
      }
    }

    return false;
  };

  const requestDownload = (file: File) => {
    if (!file.id || isNaN(file.id)) return;
    setDownloadTarget({ id: file.id, name: file.name });
  };

  const performDownload = async (withStamp: boolean) => {
    if (!downloadTarget) return;
    const { id, name } = downloadTarget;

    try {
      setIsDownloading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please sign in again");
        return;
      }

      const fileUrl = `${API_BASE_URL}/files/download/${id}?stamp=${
        withStamp ? "1" : "0"
      }`;
      const response = await fetch(fileUrl, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        toast.error("Failed to download file");
        return;
      }

      const disposition = response.headers.get("content-disposition");
      let filename = name;
      if (disposition && disposition.includes("filename=")) {
        filename = disposition
          .split("filename=")[1]
          .replace(/['"]/g, "")
          .trim();
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
      setDownloadTarget(null);
      toast.success("File downloaded successfully!");
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error("Failed to download file");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleOpenFile = async (file: File) => {
    try {
      const token = localStorage.getItem("token") || "";

      // Ask backend for short-lived signed URL
      const res = await fetch(`${API_BASE_URL}/files/open/${file.id}/url`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to get file URL");
      const data = await res.json();
      let fileUrl = String(data.url || "");

      // Prefer a public HTTPS URL so Office Online can fetch the file
      try {
        const parsed = new URL(fileUrl);
        const isLocalHost =
          parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";
        if (isLocalHost && API_BASE_URL.startsWith("https://")) {
          const api = new URL(API_BASE_URL);
          parsed.protocol = api.protocol;
          parsed.host = api.host;
          fileUrl = parsed.toString();
        }
      } catch {
        // keep original url
      }

      const isOfficeFile = /\.(docx?|xlsx?|pptx?)$/i.test(file.name);
      const urlIsPublicHttps = /^https:\/\//i.test(fileUrl);

      if (isOfficeFile && urlIsPublicHttps) {
        // Microsoft Office Online viewer (no download required)
        fileUrl = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(
          fileUrl
        )}`;
      } else if (isOfficeFile && !urlIsPublicHttps) {
        toast.info(
          "Office preview needs a public HTTPS link. Open this app on the deployed site to view Word/Excel/PowerPoint in the browser."
        );
        return;
      }

      window.open(fileUrl, "_blank", "noopener,noreferrer");
    } catch (err) {
      console.error("❌ Error opening file:", err);
      toast.error("Failed to open file. Please try again.");
    }
  };

  const handleRename = (fileId: number, currentName: string) => {
    setRenameTarget({ id: fileId, name: currentName });
  };

  /**
   * Discreet Super Admin interaction: 5 clicks on the upload date within 2s
   * opens a date editor. Regular users see no affordance and clicks do nothing.
   */
  const handleUploadDateClick = (file: File, e: React.MouseEvent) => {
    e.stopPropagation();
    if (userRole !== "super_admin" || isTrashView) return;

    const ref = dateClickRef.current;
    if (ref.timer) clearTimeout(ref.timer);

    if (ref.fileId !== file.id) {
      ref.fileId = file.id;
      ref.count = 1;
    } else {
      ref.count += 1;
    }

    if (ref.count >= 5) {
      ref.count = 0;
      ref.fileId = null;
      const current = file.created_at
        ? new Date(file.created_at).toISOString().slice(0, 10)
        : "";
      setDateEditTarget({ id: file.id, date: current });
      return;
    }

    ref.timer = setTimeout(() => {
      ref.count = 0;
      ref.fileId = null;
    }, 2000);
  };

  const handleArchive = (fileId: number, fileName: string) => {
    setConfirmTarget({ id: fileId, name: fileName, action: "archive" });
  };

  const handleUnarchive = (fileId: number, fileName: string) => {
    setConfirmTarget({ id: fileId, name: fileName, action: "unarchive" });
  };

  const handleDelete = (fileId: number, fileName: string) => {
    setConfirmTarget({ id: fileId, name: fileName, action: "delete" });
  };

  const handleRestore = (fileId: number, fileName: string) => {
    setConfirmTarget({ id: fileId, name: fileName, action: "restore" });
  };

  const handlePermanentDelete = (fileId: number, fileName: string) => {
    setConfirmTarget({
      id: fileId,
      name: fileName,
      action: "permanentDelete",
    });
  };

  const confirmActionMeta: Record<
    FileConfirmAction,
    { title: string; confirmLabel: string; tone: ConfirmTone; message: (name: string) => React.ReactNode }
  > = {
    delete: {
      title: "Move to Trash",
      confirmLabel: "Delete",
      tone: "danger",
      message: (name) => (
        <>
          Move <strong>"{name}"</strong> to trash?
        </>
      ),
    },
    archive: {
      title: "Move to Archive",
      confirmLabel: "Archive",
      tone: "warning",
      message: (name) => (
        <>
          Move <strong>"{name}"</strong> to archive? Opening it will show an
          OBSOLETE stamp.
        </>
      ),
    },
    unarchive: {
      title: "Restore from Archive",
      confirmLabel: "Restore",
      tone: "primary",
      message: (name) => (
        <>
          Restore <strong>"{name}"</strong> from archive?
        </>
      ),
    },
    restore: {
      title: "Restore File",
      confirmLabel: "Restore",
      tone: "primary",
      message: (name) => (
        <>
          Restore <strong>"{name}"</strong> from trash?
        </>
      ),
    },
    permanentDelete: {
      title: "Delete Forever",
      confirmLabel: "Delete Forever",
      tone: "danger",
      message: (name) => (
        <>
          Permanently delete <strong>"{name}"</strong>? This cannot be undone.
        </>
      ),
    },
  };

  const handleConfirmAction = () => {
    if (!confirmTarget) return;
    const { id, action } = confirmTarget;

    const close = () => setConfirmTarget(null);

    if (action === "delete") {
      deleteFile.mutate(id, { onSettled: close });
      return;
    }
    if (action === "archive") {
      archiveFileMutation.mutate(id, { onSettled: close });
      return;
    }
    if (action === "unarchive") {
      unarchiveFileMutation.mutate(id, { onSettled: close });
      return;
    }
    if (action === "restore") {
      restoreFile.mutate(id, { onSettled: close });
      return;
    }
    permanentDeleteFile.mutate(id, { onSettled: close });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return FiImage;
    if (mimeType.startsWith("video/")) return FiVideo;
    if (mimeType.startsWith("audio/")) return FiMusic;
    if (mimeType.includes("pdf")) return FiFileText;
    if (mimeType.includes("zip") || mimeType.includes("compressed"))
      return FiArchive;
    if (mimeType.includes("text") || mimeType.includes("document"))
      return FiFileText;
    return FiFile;
  };

  const getFileColor = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return "text-green-600 bg-green-50";
    if (mimeType.startsWith("video/")) return "text-purple-600 bg-purple-50";
    if (mimeType.startsWith("audio/")) return "text-yellow-600 bg-yellow-50";
    if (mimeType.includes("pdf")) return "text-red-600 bg-red-50";
    if (mimeType.includes("zip")) return "text-orange-600 bg-orange-50";
    return "text-blue-600 bg-blue-50";
  };

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

  const actionBtn =
    "p-1.5 rounded-md text-muted hover:text-ink hover:bg-[#f3f1ea] transition-colors";

  const renderActions = (file: File) => {
    const canView = hasViewPermission(file.id);
    const canDownload = hasDownloadPermission(file.id);
    return (
      <div
        className="inline-flex items-center gap-0.5"
        onClick={(e) => e.stopPropagation()}
      >
        {!isTrashView &&
          !isArchiveView &&
          (userRole === "super_admin" || file.created_by === userId) && (
            <button
              type="button"
              onClick={() => handleRename(file.id, file.name)}
              className={actionBtn}
              title="Rename File"
            >
              <FiEdit3 size={16} />
            </button>
          )}
        {canView && !isTrashView && !isArchiveView && userRole === "super_admin" && (
          <button
            type="button"
            onClick={() => handleMoveClick(file.id, file.name)}
            className={actionBtn}
            title="Move File"
          >
            <FiMove size={16} />
          </button>
        )}
        {canView && !isTrashView && (
          <button
            type="button"
            onClick={() => handleOpenFile(file)}
            className={actionBtn}
            title={isArchiveView ? "Open (OBSOLETE)" : "Open in new window"}
          >
            <FiExternalLink size={16} />
          </button>
        )}
        {canDownload && !isTrashView && (
          <button
            type="button"
            onClick={() => requestDownload(file)}
            className={actionBtn}
            title="Download"
          >
            <FiDownload size={16} />
          </button>
        )}
        {userRole === "super_admin" &&
          !isTrashView &&
          !isArchiveView &&
          !file.folder_id && (
            <button
              type="button"
              onClick={() => onAssignPermission(file.id, "file")}
              className={actionBtn}
              title="Set Permissions"
            >
              <FiKey size={16} />
            </button>
          )}
        {!isTrashView && !isArchiveView && userRole === "super_admin" && (
          <button
            type="button"
            onClick={() => handleArchive(file.id, file.name)}
            className={actionBtn}
            title="Move to Archive"
          >
            <FiArchive size={16} />
          </button>
        )}
        {isArchiveView && (
          <button
            type="button"
            onClick={() => handleUnarchive(file.id, file.name)}
            className={actionBtn}
            title="Restore from Archive"
          >
            <FiRotateCcw size={16} />
          </button>
        )}
        {isTrashView && (
          <>
            <button
              type="button"
              onClick={() => handleRestore(file.id, file.name)}
              className={actionBtn}
              title="Restore"
            >
              <FiRotateCcw size={16} />
            </button>
            <button
              type="button"
              onClick={() => handlePermanentDelete(file.id, file.name)}
              className={actionBtn}
              title="Delete Forever"
            >
              <FiTrash2 size={16} />
            </button>
          </>
        )}
        {!isTrashView && !isArchiveView && userRole === "super_admin" && (
          <button
            type="button"
            onClick={() => handleDelete(file.id, file.name)}
            className={actionBtn}
            title="Delete"
          >
            <FiTrash2 size={16} />
          </button>
        )}
      </div>
    );
  };

  void viewMode;

  let body: React.ReactNode;
  if (files.length === 0) {
    body = (
      <div className="bg-white py-16 text-center">
        <FiFile className="mx-auto text-muted mb-3" size={28} />
        <h3 className="text-[15px] font-semibold text-ink mb-1">No files found</h3>
        <p className="text-sm text-muted">
          {isTrashView
            ? "Trash is empty."
            : isArchiveView
              ? "No archived documents."
              : "Get started by uploading your first file."}
        </p>
      </div>
    );
  } else {
    body = (
      <div className="overflow-x-auto">
        <table className="edms-table">
          <thead>
            <tr>
              {onToggleSelection && selectedFileIds && (
                <th className="w-10" aria-label="Select" />
              )}
              <th className="w-16">Sr No</th>
              <th>File Name</th>
              <th className="text-right w-[1%] whitespace-nowrap">Action</th>
            </tr>
          </thead>
          <tbody>
            {files.map((file, index) => {
              const FileIcon = getFileIcon(file.mime_type);
              const fileColor = getFileColor(file.mime_type);
              const canView = hasViewPermission(file.id);

              return (
                <tr
                  key={file.id}
                  className={
                    canView ? "cursor-pointer" : "cursor-not-allowed opacity-50"
                  }
                >
                  {onToggleSelection && selectedFileIds && (
                    <td onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedFileIds.includes(file.id)}
                        onChange={() => onToggleSelection(file.id)}
                        className="w-4 h-4 rounded border-rule cursor-pointer"
                      />
                    </td>
                  )}
                  <td className="tabular-nums text-muted">{index + 1}</td>
                  <td className="wrap min-w-[200px]">
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`h-9 w-9 rounded-md flex items-center justify-center shrink-0 ${fileColor}`}
                      >
                        <FileIcon size={16} />
                      </span>
                      <div className="min-w-0">
                        <p className="font-medium text-ink truncate">
                          {file.name}
                        </p>
                        {!isTrashView && !isArchiveView && file.folder_name && (
                          <p
                            className="text-[11px] text-muted truncate"
                            title={file.folder_name}
                          >
                            in {file.folder_name}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5 text-[12px] text-muted">
                          <span>{formatFileSize(file.size || 0)}</span>
                          <span aria-hidden>•</span>
                          <span
                            onClick={(e) => handleUploadDateClick(file, e)}
                            className={
                              userRole === "super_admin" && !isTrashView
                                ? "select-none hover:text-ink"
                                : undefined
                            }
                          >
                            {new Date(
                              isTrashView && file.deleted_at
                                ? file.deleted_at
                                : file.created_at
                            ).toLocaleDateString()}
                          </span>
                          {isTrashView && (
                            <>
                              <span aria-hidden>•</span>
                              <span className="text-[#b42318] inline-flex items-center gap-1">
                                <FiClock size={11} />
                                {calculateRemainingDays(file.deleted_at)} days
                                left
                              </span>
                            </>
                          )}
                          {isArchiveView && (
                            <span className="text-amber-700">Archived</span>
                          )}
                          {!canView && (
                            <span className="text-[#b42318]">
                              No view permission
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="text-right whitespace-nowrap">
                    {renderActions(file)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div>
      {body}
      {/* Move File Modal */}
      <MoveFileModal
        isOpen={moveModalOpen}
        onClose={() => {
          console.log("❌ Closing move modal");
          setMoveModalOpen(false);
          setSelectedFileForMove(null);
        }}
        fileId={selectedFileForMove?.id || null}
        fileName={selectedFileForMove?.name || ""}
      />

      <PromptModal
        isOpen={!!renameTarget}
        title="Rename File"
        label="File name"
        initialValue={renameTarget?.name || ""}
        confirmLabel="Rename"
        isLoading={updateFile.isPending}
        onClose={() => setRenameTarget(null)}
        onSubmit={(newName) => {
          if (!renameTarget || newName === renameTarget.name) {
            setRenameTarget(null);
            return;
          }
          updateFile.mutate(
            { id: renameTarget.id, name: newName },
            { onSettled: () => setRenameTarget(null) }
          );
        }}
      />

      <PromptModal
        isOpen={!!dateEditTarget}
        title="Edit Upload Date"
        label="Upload date"
        description="Super Admin only"
        inputType="date"
        initialValue={dateEditTarget?.date || ""}
        confirmLabel="Update Date"
        isLoading={updateFile.isPending}
        onClose={() => setDateEditTarget(null)}
        onSubmit={(next) => {
          if (!dateEditTarget) return;
          const parsed = new Date(next);
          if (Number.isNaN(parsed.getTime())) {
            toast.error("Invalid date");
            return;
          }
          updateFile.mutate(
            { id: dateEditTarget.id, created_at: parsed.toISOString() },
            { onSettled: () => setDateEditTarget(null) }
          );
        }}
      />

      <ConfirmModal
        isOpen={!!confirmTarget}
        title={
          confirmTarget
            ? confirmActionMeta[confirmTarget.action].title
            : "Confirm"
        }
        message={
          confirmTarget
            ? confirmActionMeta[confirmTarget.action].message(confirmTarget.name)
            : ""
        }
        confirmLabel={
          confirmTarget
            ? confirmActionMeta[confirmTarget.action].confirmLabel
            : "Confirm"
        }
        tone={
          confirmTarget
            ? confirmActionMeta[confirmTarget.action].tone
            : "danger"
        }
        isLoading={
          deleteFile.isPending ||
          archiveFileMutation.isPending ||
          unarchiveFileMutation.isPending ||
          restoreFile.isPending ||
          permanentDeleteFile.isPending
        }
        onClose={() => setConfirmTarget(null)}
        onConfirm={handleConfirmAction}
      />

      <StampChoiceModal
        isOpen={!!downloadTarget}
        title="Download File"
        itemName={downloadTarget?.name}
        isLoading={isDownloading}
        onClose={() => {
          if (!isDownloading) setDownloadTarget(null);
        }}
        onWithoutStamp={() => performDownload(false)}
        onWithStamp={() => performDownload(true)}
      />
    </div>
  );
};

export default FileList;