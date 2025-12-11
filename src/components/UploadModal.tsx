import React, { useState, useRef, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { useUploadFile, useUploadFolder } from "../hooks/useFiles";
import { FiUpload, FiX, FiFile, FiFolder, FiCloud } from "react-icons/fi";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  folderId: number | null;
}

const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  folderId,
}) => {
  const [uploadType, setUploadType] = useState<"file" | "folder">("file");
  const [files, setFiles] = useState<FileList | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFileMutation = useUploadFile();
  const uploadFolderMutation = useUploadFolder();

  // ✅ Reset state when modal opens or closes
  useEffect(() => {
    if (isOpen) {
      setFiles(null);
      setUploadType("file");
      setIsDragging(false);
      if (fileInputRef.current) fileInputRef.current.value = ""; // reset input
    }
  }, [isOpen]);

  // ✅ Reset files when switching between upload types
  const handleUploadTypeChange = (type: "file" | "folder") => {
    if (type !== uploadType) {
      setFiles(null);
      if (fileInputRef.current) fileInputRef.current.value = ""; // reset input
    }
    setUploadType(type);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    const input = e.target;

    console.log("📁 Files selected:", files?.length);
    console.log("📁 Input attributes:", {
      webkitdirectory: input.webkitdirectory,
      multiple: input.multiple,
      type: input.type,
    });

    if (files) {
      Array.from(files).forEach((file, index) => {
        console.log(`📄 File ${index + 1}:`, {
          name: file.name,
          webkitRelativePath: (file as any).webkitRelativePath,
          size: file.size,
        });
      });
    }

    setFiles(files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Only allow drag & drop for files, not folders
    if (uploadType === "file") {
      setIsDragging(true);
      e.dataTransfer.dropEffect = "copy";
    } else {
      // For folders, show not allowed cursor
      e.dataTransfer.dropEffect = "none";
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    // Only allow drag & drop for files, not folders
    if (
      uploadType === "file" &&
      e.dataTransfer.files &&
      e.dataTransfer.files.length > 0
    ) {
      setFiles(e.dataTransfer.files);
    }
    // For folders, do nothing (prevent default behavior)
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!files || files.length === 0) {
      alert(
        `Please select ${uploadType === "folder" ? "a folder" : "file(s)"
        } to upload.`
      );
      return;
    }

    const formData = new FormData();

    // 0. Append folderId FIRST (Global metadata)
    if (folderId !== null) {
      if (uploadType === "folder") {
        formData.append("folderId", folderId.toString()); // For folder upload
      } else {
        formData.append("folder_id", folderId.toString()); // For file upload (backend expects folder_id)
      }
    }

    if (uploadType === "folder") {
      // Check if we have webkitRelativePath for folder structure
      const hasWebkitRelativePath = Array.from(files).some(
        (file) =>
          (file as any).webkitRelativePath &&
          (file as any).webkitRelativePath.includes("/")
      );

      if (hasWebkitRelativePath) {
        // Full folder structure with webkitRelativePath (file picker)
        const folderSet = new Set<string>();
        // const relativePaths: string[] = [];

        // 1. Collect and append files/paths
        for (const file of Array.from(files)) {
          const relPath = (file as any).webkitRelativePath;
          formData.append("files", file);
          formData.append("paths", relPath);

          // Collect folder paths for empty folder creation
          const pathParts = relPath.split("/");
          pathParts.pop(); // remove filename
          let cumulativePath = "";
          for (const part of pathParts) {
            cumulativePath += (cumulativePath ? "/" : "") + part;
            folderSet.add(cumulativePath);
          }
        }

        // Send unique folder paths (includes empty ones)
        formData.append("allPaths", JSON.stringify([...folderSet]));
      } else {
        // Drag & drop folder upload - legacy simple structure
        // Note: For drag-drop, file.webkitRelativePath is usually empty or specific. 
        // We stick to simple logic here but ensure ID is already added.
        formData.append("allPaths", JSON.stringify([]));

        for (const file of Array.from(files)) {
          formData.append("files", file);
          formData.append("paths", file.name); // Legacy path usage
        }
      }

      // Use the React Query mutation for folder upload
      uploadFolderMutation.mutate(formData, {
        onSuccess: () => {
          alert("Folder uploaded successfully!");
          onClose(); // Close modal after successful upload
        },
        onError: (error: any) => {
          console.error("Folder upload error:", error);
          alert(error.message || "Upload failed");
        },
      });
    } else {
      // Handle single file uploads
      for (const file of Array.from(files)) {
        formData.append("files", file);
      }

      uploadFileMutation.mutate(formData, {
        onSuccess: () => {
          // alert("File uploaded successfully!");
          onClose(); // Close modal after successful upload
        },
        onError: (error: any) => {
          console.error("File upload error:", error);
          alert(error.message || "Upload failed");
        },
      });
    }
  };

  const selectedFile = files && files.length > 0 ? files[0] : null;

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        aria-hidden="true"
      />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FiUpload className="text-blue-600" size={20} />
              </div>
              <div>
                <Dialog.Title className="text-xl font-bold text-gray-900">
                  Upload {uploadType === "file" ? "File(s)" : "Folder"}
                </Dialog.Title>
                <p className="text-sm text-gray-500">
                  Add new content to your storage
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiX size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Upload Type */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleUploadTypeChange("file")}
                className={`p-4 border-2 rounded-xl text-center transition-all ${uploadType === "file"
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 hover:border-gray-300 text-gray-600"
                  }`}
              >
                <FiFile size={24} className="mx-auto mb-2" />
                <div className="font-medium">File(s)</div>
              </button>
              <button
                onClick={() => handleUploadTypeChange("folder")}
                className={`p-4 border-2 rounded-xl text-center transition-all ${uploadType === "folder"
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 hover:border-gray-300 text-gray-600"
                  }`}
              >
                <FiFolder size={24} className="mx-auto mb-2" />
                <div className="font-medium">Folder</div>
              </button>
            </div>

            {/* Drop Zone */}
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${uploadType === "file" && isDragging
                ? "border-blue-500 bg-blue-50"
                : uploadType === "folder" && isDragging
                  ? "border-red-500 bg-red-50"
                  : "border-gray-300 hover:border-gray-400"
                }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                {...(uploadType === "folder"
                  ? { webkitdirectory: "true" }
                  : {})}
                onChange={handleFileChange}
                className="hidden"
                title={
                  uploadType === "folder" ? "Select a folder" : "Select files"
                }
              />

              <FiCloud className="mx-auto h-12 w-12 text-gray-400 mb-4" />

              {selectedFile ? (
                <div>
                  <p className="font-medium text-gray-900">
                    {uploadType === "folder"
                      ? `${files?.length} files selected`
                      : `${files?.length} file(s) selected`}
                  </p>
                  {uploadType === "folder" && (
                    <p className="text-sm text-blue-600 mt-2">
                      ✓ Folder structure will be preserved
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  {uploadType === "folder" && isDragging ? (
                    <div>
                      <p className="font-medium text-red-600">
                        ⚠️ Drag & drop not allowed for folders
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Please click to browse and select a folder
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="font-medium text-gray-900">
                        {uploadType === "file"
                          ? "Drag and drop your file(s) here or click to browse"
                          : "Click to browse and select a folder"}
                      </p>
                      {uploadType === "folder" && (
                        <p className="text-sm text-blue-600 mt-1">
                          ✓ Folder structure will be preserved
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 p-6 border-t border-gray-100">
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={
                !files ||
                uploadFileMutation.isPending ||
                uploadFolderMutation.isPending
              }
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploadFileMutation.isPending ||
                uploadFolderMutation.isPending ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Uploading...</span>
                </div>
              ) : (
                `Upload ${uploadType === "folder" ? "Folder" : "File(s)"}`
              )}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default UploadModal;
