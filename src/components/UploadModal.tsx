import React, { useState, useRef, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useUploadFile,
  useUploadFolder,
  setMasterStampPreference,
  invalidateAfterUpload,
} from "../hooks/useFiles";
import { FiUpload, FiX, FiFile, FiFolder, FiCloud } from "react-icons/fi";
import { toast } from "react-toastify";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  folderId: number | null;
  existingFolderNames?: string[];
}

type UploadedItem = { id: number; name: string };

const extractUploadedItems = (data: any): UploadedItem[] => {
  if (!data) return [];
  const list = Array.isArray(data.files)
    ? data.files
    : Array.isArray(data)
      ? data
      : data.id
        ? [data]
        : [];
  return list
    .filter((f: any) => f && f.id)
    .map((f: any) => ({
      id: Number(f.id),
      name: f.name || f.original_name || `File ${f.id}`,
    }));
};

const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  folderId,
  existingFolderNames = [],
}) => {
  const queryClient = useQueryClient();
  const [uploadType, setUploadType] = useState<"file" | "folder">("file");
  const [files, setFiles] = useState<FileList | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [step, setStep] = useState<"upload" | "stamp">("upload");
  const [uploadedItems, setUploadedItems] = useState<UploadedItem[]>([]);
  const [savingStamp, setSavingStamp] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFileMutation = useUploadFile();
  const uploadFolderMutation = useUploadFolder();

  const isBusy =
    savingStamp ||
    uploadFileMutation.isPending ||
    uploadFolderMutation.isPending;

  useEffect(() => {
    if (isOpen) {
      setFiles(null);
      setUploadType("file");
      setIsDragging(false);
      setStep("upload");
      setUploadedItems([]);
      setSavingStamp(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [isOpen]);

  const handleUploadTypeChange = (type: "file" | "folder") => {
    if (type !== uploadType) {
      setFiles(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
    setUploadType(type);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(e.target.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (uploadType === "file") {
      setIsDragging(true);
      e.dataTransfer.dropEffect = "copy";
    } else {
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
    if (
      uploadType === "file" &&
      e.dataTransfer.files &&
      e.dataTransfer.files.length > 0
    ) {
      setFiles(e.dataTransfer.files);
    }
  };

  const goToStampStep = (data: any) => {
    setUploadedItems(extractUploadedItems(data));
    setStep("stamp");
  };

  /** Upload now; stamp confirmation comes next before files appear in the UI. */
  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();

    if (!files || files.length === 0) {
      toast.error(
        `Please select ${
          uploadType === "folder" ? "a folder" : "file(s)"
        } to upload.`
      );
      return;
    }

    if (uploadType === "folder") {
      const hasWebkitRelativePath = Array.from(files).some(
        (file) =>
          (file as any).webkitRelativePath &&
          (file as any).webkitRelativePath.includes("/")
      );

      if (hasWebkitRelativePath) {
        const topLevelFolders = new Set<string>();
        Array.from(files).forEach((file) => {
          const relPath = (file as any).webkitRelativePath;
          if (relPath) topLevelFolders.add(relPath.split("/")[0]);
        });

        for (const folderName of topLevelFolders) {
          if (existingFolderNames.includes(folderName)) {
            toast.error(
              `Folder '${folderName}' already exists in this directory. Please rename the folder or choose a different directory.`
            );
            return;
          }
        }

        const folderSet = new Set<string>();
        const filesArray: File[] = [];
        const pathsArray: string[] = [];

        for (const file of Array.from(files)) {
          const relPath = (file as any).webkitRelativePath;
          filesArray.push(file);
          pathsArray.push(relPath);
          const pathParts = relPath.split("/");
          pathParts.pop();
          let cumulativePath = "";
          for (const part of pathParts) {
            cumulativePath += (cumulativePath ? "/" : "") + part;
            folderSet.add(cumulativePath);
          }
        }

        uploadFolderMutation.mutate(
          {
            files: filesArray,
            paths: pathsArray,
            folderId,
            allPaths: [...folderSet],
          },
          {
            onSuccess: goToStampStep,
            onError: (error: any) => {
              toast.error(error.message || "Upload failed");
            },
          }
        );
      } else {
        const filesArray: File[] = [];
        const pathsArray: string[] = [];
        for (const file of Array.from(files)) {
          filesArray.push(file);
          pathsArray.push(file.name);
        }
        uploadFolderMutation.mutate(
          {
            files: filesArray,
            paths: pathsArray,
            folderId,
            allPaths: [],
          },
          {
            onSuccess: goToStampStep,
            onError: (error: any) => {
              toast.error(error.message || "Upload failed");
            },
          }
        );
      }
    } else {
      const formData = new FormData();
      if (folderId !== null) {
        formData.append("folder_id", folderId.toString());
      }
      for (const file of Array.from(files)) {
        formData.append("files", file);
      }
      uploadFileMutation.mutate(formData, {
        onSuccess: goToStampStep,
        onError: (error: any) => {
          toast.error(error.message || "Upload failed");
        },
      });
    }
  };

  const applyAllStamp = async (withStamp: boolean) => {
    try {
      setSavingStamp(true);
      const ids = uploadedItems.map((item) => item.id);
      if (ids.length > 0) {
        await setMasterStampPreference(ids, withStamp);
      }
      invalidateAfterUpload(queryClient);
      toast.success("Upload complete");
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Failed to save stamp preference"
      );
    } finally {
      setSavingStamp(false);
    }
  };

  const selectedFile = files && files.length > 0 ? files[0] : null;

  return (
    <Dialog
      open={isOpen}
      onClose={() => {
        if (!isBusy) onClose();
      }}
      className="relative z-50"
    >
      <div
        className="fixed inset-0 bg-transparent backdrop-blur-md"
        aria-hidden="true"
      />
      <div className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto">
        <Dialog.Panel className="bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-md w-full max-h-[min(90vh,720px)] overflow-y-auto my-auto transform transition-all">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FiUpload className="text-blue-600" size={20} />
              </div>
              <div>
                <Dialog.Title className="text-xl font-bold text-gray-900">
                  {step === "stamp"
                    ? "Confirm Stamp"
                    : `Upload ${uploadType === "file" ? "File(s)" : "Folder"}`}
                </Dialog.Title>
                <p className="text-sm text-gray-500">
                  {step === "stamp"
                    ? "Choose how these documents should be stamped"
                    : "Add new content to your storage"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isBusy}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <FiX size={20} />
            </button>
          </div>

          {step === "stamp" ? (
            <>
              <div className="p-6 space-y-4">
                <p className="text-sm text-gray-600">
                  Documents were uploaded successfully. Confirm the stamp option
                  before they appear in your library.
                </p>
                <p className="text-sm text-gray-500">
                  Select <strong>With Stamp</strong> or{" "}
                  <strong>Without Stamp</strong>
                  {uploadedItems.length > 1
                    ? ` for all ${uploadedItems.length} documents`
                    : ""}
                  .
                </p>
              </div>

              <div className="flex justify-end gap-3 p-6 border-t border-gray-100">
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => applyAllStamp(false)}
                  className="px-5 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium disabled:opacity-50"
                >
                  Without Stamp
                </button>
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => applyAllStamp(true)}
                  className="px-5 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-medium disabled:opacity-50"
                >
                  {savingStamp ? "Saving…" : "With Stamp"}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleUploadTypeChange("file")}
                    className={`p-4 border-2 rounded-xl text-center transition-all ${
                      uploadType === "file"
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 hover:border-gray-300 text-gray-600"
                    }`}
                  >
                    <FiFile size={24} className="mx-auto mb-2" />
                    <div className="font-medium">File(s)</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUploadTypeChange("folder")}
                    className={`p-4 border-2 rounded-xl text-center transition-all ${
                      uploadType === "folder"
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 hover:border-gray-300 text-gray-600"
                    }`}
                  >
                    <FiFolder size={24} className="mx-auto mb-2" />
                    <div className="font-medium">Folder</div>
                  </button>
                </div>

                <div
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                    uploadType === "file" && isDragging
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
                      uploadType === "folder"
                        ? "Select a folder"
                        : "Select files"
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

              <div className="flex justify-end space-x-3 p-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isBusy}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={!files || isBusy}
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
            </>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default UploadModal;
