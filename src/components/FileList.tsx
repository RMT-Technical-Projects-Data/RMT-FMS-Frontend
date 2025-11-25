// components/FileList.tsx
import React from "react";
import type { File } from "../types";
import {
  // useDownloadFile,
  useDeleteFile,
  // useToggleFileFavourite,
  useRestoreFile,
  usePermanentDeleteFile,
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
} from "react-icons/fi";
import MoveFileModal from "./MoveFileModal";

interface FileListProps {
  files: File[];
  onAssignPermission: (resourceId: number, resourceType: "file") => void;
  userRole: string;
  userId?: number;
  showFavouriteToggle?: boolean;
  isTrashView?: boolean;
}

const FileList: React.FC<FileListProps> = ({
  files,
  onAssignPermission,
  userRole,
  userId,
  isTrashView = false,
}) => {
  // const downloadFile = useDownloadFile();
  const deleteFile = useDeleteFile();
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

  const handleMoveClick = (fileId: number, fileName: string) => {
    console.log("🖱️ Move icon clicked:", { fileId, fileName });
    setSelectedFileForMove({ id: fileId, name: fileName });
    setMoveModalOpen(true);
    console.log("✅ setMoveModalOpen(true) called");
  };

  // Check if user has download permission for a file
  const hasDownloadPermission = (fileId: number) => {
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

  const handleDownload = async (file: File) => {
    try {
      console.log(
        `🖱️ Download button clicked - ID: ${file.id}, Name: ${file.name}`
      );

      // Validate file ID
      if (!file.id || isNaN(file.id)) {
        console.error("Invalid file ID:", file.id);
        return;
      }

      // Check if file exists in the current files list
      const fileExists = files.find((f) => f.id === file.id);
      if (!fileExists) {
        console.error(
          `File with ID ${file.id} not found in current files list`
        );
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        return;
      }

      // Use the correct backend endpoint: /files/download/{id}
      const fileUrl = `https://rmtfms.duckdns.org/api/files/download/${file.id}`;
      console.log(`📥 Downloading from: ${fileUrl}`);

      const response = await fetch(fileUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.error("Failed to download file");
        return;
      }

      // Get filename from headers or fallback
      const disposition = response.headers.get("content-disposition");
      let filename = file.name;
      if (disposition && disposition.includes("filename=")) {
        filename = disposition
          .split("filename=")[1]
          .replace(/['"]/g, "")
          .trim();
      }

      // Convert to blob and trigger download
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename; // ✅ triggers direct download
      document.body.appendChild(a);
      a.click();
      a.remove();

      // Cleanup blob URL
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  const handleOpenFile = async (fileId: number, token: string) => {
    try {
      // 1️⃣ Ask backend for short-lived signed URL
      const res = await fetch(
        `https://rmtfms.duckdns.org/api/files/open/${fileId}/url`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Failed to get file URL");
      const data = await res.json();

      // 2️⃣ Open signed URL directly — no token required in headers
      window.open(data.url, "_blank", "noopener,noreferrer");
    } catch (err) {
      console.error("❌ Error opening file:", err);
      alert("Failed to open file. Please try again.");
    }
  };

  const handleDelete = (fileId: number, fileName: string) => {
    if (window.confirm(`Are you sure you want to delete "${fileName}"?`)) {
      deleteFile.mutate(fileId);
    }
  };

  // const handleToggleFavourite = (fileId: number, e: React.MouseEvent) => {
  //   e.stopPropagation();
  //   toggleFavourite.mutate(fileId, {
  //     onSuccess: (data) => {
  //       console.log("✅ File toggle success:", data);
  //     },
  //     onError: (error) => {
  //       console.error("❌ File toggle error:", error);
  //     }
  //   });
  // };

  const handleRestore = (fileId: number, fileName: string) => {
    if (window.confirm(`Are you sure you want to restore "${fileName}"?`)) {
      restoreFile.mutate(fileId, {
        onSuccess: () => {
          console.log("✅ File restored successfully");
        },
        onError: (error: any) => {
          console.error("❌ Failed to restore file:", error);
          alert("Failed to restore file. Please try again.");
        },
      });
    }
  };

  const handlePermanentDelete = (fileId: number, fileName: string) => {
    if (
      window.confirm(
        `Are you sure you want to permanently delete "${fileName}"? This action cannot be undone.`
      )
    ) {
      permanentDeleteFile.mutate(fileId, {
        onSuccess: () => {
          console.log("✅ File permanently deleted");
        },
        onError: (error: any) => {
          console.error("❌ Failed to permanently delete file:", error);
          alert("Failed to permanently delete file. Please try again.");
        },
      });
    }
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

  return (
    <div className="space-y-4">
      {files.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FiFile className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No files found
          </h3>
          <p className="text-gray-500 max-w-sm mx-auto">
            {files.length === 0
              ? "Get started by uploading your first file."
              : "No files match your search."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {files.map((file) => {
            const FileIcon = getFileIcon(file.mime_type);
            const fileColor = getFileColor(file.mime_type);
            const canView = hasViewPermission(file.id);
            const canDownload = hasDownloadPermission(file.id);

            return (
              <div
                key={file.id}
                className={`flex items-center space-x-4 p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200 ${canView ? "cursor-pointer" : "cursor-not-allowed opacity-50"
                  } ${isTrashView ? "opacity-75" : ""}`}
              >
                <div className={`p-3 rounded-xl ${fileColor}`}>
                  <FileIcon size={24} />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 truncate">
                    {file.name}
                  </h4>
                  <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                    <span>{formatFileSize(file.size || 0)}</span>
                    <span>•</span>
                    <span>
                      {new Date(file.created_at).toLocaleDateString()}
                    </span>
                    {/* {file.mime_type && (
                      <>
                        <span>•</span>
                        <span className="capitalize">
                          {file.mime_type.split("/")[1] || file.mime_type}
                        </span>
                      </>
                    )} */}
                    {!canView && (
                      <span className="text-red-500 text-xs font-medium">
                        No view permission
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Heart icon for favourites */}
                  {/* {showFavouriteToggle && (
                    <button
                      onClick={(e) => {
                        console.log("🖱️ Heart clicked for file:", file.id, "favourited:", file.favourited);
                        handleToggleFavourite(file.id, e);
                      }}
                      className={`p-2 rounded-xl transition-colors ${
                        file.is_faviourite
                          ? "text-red-500 hover:text-red-600 hover:bg-red-50"
                          : "text-gray-400 hover:text-red-500 hover:bg-red-50"
                      }`}
                      title={
                        file.is_faviourite
                          ? "Remove from favorites"
                          : "Add to favorites"
                      }
                    >
                      <FiHeart
                        size={18}
                        fill={file.is_faviourite ? "currentColor" : "none"}
                      />
                    </button>
                  )} */}

                  {/* Move button (left of Open in new window) */}
                  {canView && !isTrashView && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveClick(file.id, file.name);
                      }}
                      className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                      title="Move File"
                    >
                      <FiMove size={18} />
                    </button>
                  )}

                  {/* Open in new window button (for view permission) */}
                  {canView && !isTrashView && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const token = localStorage.getItem("token") || "";
                        handleOpenFile(file.id, token);
                      }}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                      title="Open in new window"
                    >
                      <FiExternalLink size={18} />
                    </button>
                  )}

                  {/* Download button (for download permission) */}
                  {canDownload && !isTrashView && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(file);
                      }}
                      className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-xl transition-colors"
                      title="Download"
                    >
                      <FiDownload size={18} />
                    </button>
                  )}

                  {userRole === "super_admin" &&
                    !isTrashView &&
                    !file.folder_id && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAssignPermission(file.id, "file");
                        }}
                        className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-colors"
                        title="Set Permissions"
                      >
                        <FiKey size={18} />
                      </button>
                    )}

                  {/* Trash view actions */}
                  {isTrashView && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRestore(file.id, file.name);
                        }}
                        className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-xl transition-colors"
                        title="Restore"
                      >
                        <FiRotateCcw size={18} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePermanentDelete(file.id, file.name);
                        }}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        title="Delete Forever"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </>
                  )}

                  {/* Regular view actions */}
                  {!isTrashView && userRole === "super_admin" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(file.id, file.name);
                      }}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                      title="Delete"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
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
    </div>
  );
};

export default FileList;
