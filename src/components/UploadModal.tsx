import React, { useState, useRef, useEffect, useMemo } from "react";
import { Dialog } from "@headlessui/react";
import { useQueryClient } from "@tanstack/react-query";
import JSZip from "jszip";
import {
  useUploadFile,
  useUploadFolder,
  setMasterStampPreference,
  invalidateAfterUpload,
} from "../hooks/useFiles";
import {
  FiUpload,
  FiX,
  FiFile,
  FiFolder,
  FiCloud,
  FiPackage,
} from "react-icons/fi";
import { toast } from "react-toastify";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  folderId: number | null;
  existingFolderNames?: string[];
}

type UploadType = "file" | "folder" | "zip";
type UploadedItem = { id: number; name: string };

const SKIP_ZIP_PATH = (rawPath: string) => {
  const path = rawPath.replace(/\\/g, "/");
  if (!path || path.endsWith("/")) return false;
  const parts = path.split("/").filter(Boolean);
  if (parts.some((p) => p === "__MACOSX" || p.startsWith(".__"))) return true;
  if (parts[parts.length - 1] === ".DS_Store") return true;
  return false;
};

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

const buildFolderPathsFromRelative = (
  relPath: string,
  folderSet: Set<string>
) => {
  const pathParts = relPath.split("/").filter(Boolean);
  pathParts.pop();
  let cumulativePath = "";
  for (const part of pathParts) {
    cumulativePath += (cumulativePath ? "/" : "") + part;
    folderSet.add(cumulativePath);
  }
};

const extractZipContents = async (zipFile: File) => {
  const zip = await JSZip.loadAsync(zipFile);
  const filesArray: File[] = [];
  const pathsArray: string[] = [];
  const folderSet = new Set<string>();

  const entries = Object.values(zip.files);
  for (const entry of entries) {
    const rawPath = entry.name.replace(/\\/g, "/");
    if (SKIP_ZIP_PATH(rawPath) && !entry.dir) continue;

    if (entry.dir) {
      const parts = rawPath.split("/").filter(Boolean);
      if (parts.some((p) => p === "__MACOSX")) continue;
      let cumulative = "";
      for (const part of parts) {
        cumulative += (cumulative ? "/" : "") + part;
        folderSet.add(cumulative);
      }
      continue;
    }

    if (SKIP_ZIP_PATH(rawPath)) continue;

    const parts = rawPath.split("/").filter(Boolean);
    const relPath = parts.join("/");
    if (!relPath) continue;

    const blob = await entry.async("blob");
    const fileName = parts[parts.length - 1];
    const file = new window.File([blob], fileName, {
      type: blob.type || "application/octet-stream",
    });
    filesArray.push(file);
    pathsArray.push(relPath);
    buildFolderPathsFromRelative(relPath, folderSet);
  }

  return {
    filesArray,
    pathsArray,
    allPaths: [...folderSet],
  };
};

const formatBytes = (bytes: number) => {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );
  const value = bytes / Math.pow(1024, i);
  return `${value < 10 && i > 0 ? value.toFixed(1) : Math.round(value)} ${units[i]}`;
};

const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  folderId,
  existingFolderNames = [],
}) => {
  const queryClient = useQueryClient();
  const [uploadType, setUploadType] = useState<UploadType>("file");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [step, setStep] = useState<"upload" | "stamp">("upload");
  const [uploadedItems, setUploadedItems] = useState<UploadedItem[]>([]);
  const [savingStamp, setSavingStamp] = useState(false);
  const [unzipping, setUnzipping] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFileMutation = useUploadFile();
  const uploadFolderMutation = useUploadFolder();

  const isBusy =
    savingStamp ||
    unzipping ||
    uploadProgress !== null ||
    uploadFileMutation.isPending ||
    uploadFolderMutation.isPending;

  useEffect(() => {
    if (isOpen) {
      setSelectedFiles([]);
      setUploadType("file");
      setIsDragging(false);
      setStep("upload");
      setUploadedItems([]);
      setSavingStamp(false);
      setUnzipping(false);
      setUploadProgress(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [isOpen]);

  const selectedSummary = useMemo(() => {
    if (selectedFiles.length === 0) return null;
    if (uploadType === "folder") {
      const top = new Set(
        selectedFiles
          .map(
            (f) =>
              (f as File & { webkitRelativePath?: string }).webkitRelativePath
          )
          .filter(Boolean)
          .map((p) => String(p).split("/")[0])
      );
      const folderName = top.size === 1 ? [...top][0] : `${top.size} folders`;
      return {
        title: folderName || "Selected folder",
        count: selectedFiles.length,
      };
    }
    if (uploadType === "zip") {
      return {
        title: selectedFiles[0]?.name || "Selected zip",
        count: selectedFiles.length,
      };
    }
    return {
      title: `${selectedFiles.length} file${selectedFiles.length === 1 ? "" : "s"} selected`,
      count: selectedFiles.length,
    };
  }, [selectedFiles, uploadType]);

  const handleUploadTypeChange = (type: UploadType) => {
    if (type !== uploadType) {
      setSelectedFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
    setUploadType(type);
  };

  const setFilesFromList = (list: FileList | File[] | null) => {
    if (!list) {
      setSelectedFiles([]);
      return;
    }
    setSelectedFiles(Array.from(list));
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const clearSelectedFiles = () => {
    setSelectedFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (uploadType === "zip" && selected && selected.length > 0) {
      const zipOnly = Array.from(selected).filter((f) =>
        f.name.toLowerCase().endsWith(".zip")
      );
      if (zipOnly.length === 0) {
        toast.error("Please select a .zip file");
        e.target.value = "";
        setSelectedFiles([]);
        return;
      }
      setSelectedFiles([zipOnly[0]]);
      return;
    }
    setFilesFromList(selected);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (uploadType === "file" || uploadType === "zip") {
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
    if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) return;

    if (uploadType === "zip") {
      const zip = Array.from(e.dataTransfer.files).find((f) =>
        f.name.toLowerCase().endsWith(".zip")
      );
      if (!zip) {
        toast.error("Please drop a .zip file");
        return;
      }
      setSelectedFiles([zip]);
      return;
    }

    if (uploadType === "file") {
      setFilesFromList(e.dataTransfer.files);
    }
  };

  const goToStampStep = (data: any) => {
    setUploadProgress(null);
    setUploadedItems(extractUploadedItems(data));
    setStep("stamp");
  };

  const runFolderUpload = (
    filesArray: File[],
    pathsArray: string[],
    allPaths: string[]
  ) => {
    setUploadProgress(0);
    uploadFolderMutation.mutate(
      {
        files: filesArray,
        paths: pathsArray,
        folderId,
        allPaths,
        onProgress: setUploadProgress,
      },
      {
        onSuccess: goToStampStep,
        onError: (error: any) => {
          setUploadProgress(null);
          toast.error(error.message || "Upload failed");
        },
      }
    );
  };

  const handleZipUpload = async (zipFile: File) => {
    try {
      setUnzipping(true);
      setUploadProgress(0);
      toast.info("Extracting zip…");
      const { filesArray, pathsArray, allPaths } =
        await extractZipContents(zipFile);

      if (filesArray.length === 0) {
        toast.error("Zip archive is empty or contains no uploadable files");
        setUploadProgress(null);
        return;
      }

      const topLevel = new Set(
        pathsArray.map((p) => p.split("/").filter(Boolean)[0]).filter(Boolean)
      );
      for (const name of topLevel) {
        if (existingFolderNames.includes(name)) {
          toast.error(
            `Folder '${name}' already exists in this directory. Rename the zip contents or choose a different location.`
          );
          setUploadProgress(null);
          return;
        }
      }

      toast.success(
        `Extracted ${filesArray.length} file${filesArray.length === 1 ? "" : "s"} — uploading…`
      );
      setUnzipping(false);
      runFolderUpload(filesArray, pathsArray, allPaths);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to extract zip");
      setUploadProgress(null);
    } finally {
      setUnzipping(false);
    }
  };

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedFiles.length === 0) {
      toast.error(
        `Please select ${
          uploadType === "folder"
            ? "a folder"
            : uploadType === "zip"
              ? "a zip file"
              : "file(s)"
        } to upload.`
      );
      return;
    }

    if (uploadType === "zip") {
      const zipFile = selectedFiles[0];
      if (!zipFile?.name.toLowerCase().endsWith(".zip")) {
        toast.error("Please select a .zip file");
        return;
      }
      void handleZipUpload(zipFile);
      return;
    }

    if (uploadType === "folder") {
      const hasWebkitRelativePath = selectedFiles.some(
        (file) =>
          (file as any).webkitRelativePath &&
          (file as any).webkitRelativePath.includes("/")
      );

      if (hasWebkitRelativePath) {
        const topLevelFolders = new Set<string>();
        selectedFiles.forEach((file) => {
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

        for (const file of selectedFiles) {
          const relPath = (file as any).webkitRelativePath;
          filesArray.push(file);
          pathsArray.push(relPath);
          buildFolderPathsFromRelative(relPath, folderSet);
        }

        runFolderUpload(filesArray, pathsArray, [...folderSet]);
      } else {
        const filesArray: File[] = [];
        const pathsArray: string[] = [];
        for (const file of selectedFiles) {
          filesArray.push(file);
          pathsArray.push(file.name);
        }
        runFolderUpload(filesArray, pathsArray, []);
      }
      return;
    }

    const formData = new FormData();
    if (folderId !== null) {
      formData.append("folder_id", folderId.toString());
    }
    for (const file of selectedFiles) {
      formData.append("files", file);
    }
    setUploadProgress(0);
    uploadFileMutation.mutate(
      { formData, onProgress: setUploadProgress },
      {
        onSuccess: goToStampStep,
        onError: (error: any) => {
          setUploadProgress(null);
          toast.error(error.message || "Upload failed");
        },
      }
    );
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
      toast.error(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Failed to save stamp preference"
      );
    } finally {
      setSavingStamp(false);
    }
  };

  const typeLabel =
    uploadType === "folder"
      ? "Folder"
      : uploadType === "zip"
        ? "Zip"
        : "File(s)";

  const progressLabel = unzipping
    ? "Extracting zip…"
    : uploadProgress !== null
      ? `Uploading… ${uploadProgress}%`
      : null;

  return (
    <Dialog
      open={isOpen}
      onClose={() => {
        // Must pick With/Without Stamp before leaving after a successful upload
        if (step === "stamp" || isBusy) return;
        onClose();
      }}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-ink/40" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto">
        <Dialog.Panel className="bg-white rounded-lg shadow-xl border border-rule max-w-lg w-full max-h-[min(90vh,720px)] overflow-y-auto my-auto">
          <div className="flex items-center justify-between px-5 py-4 border-b border-rule">
            <div className="flex items-center gap-3">
              <span className="h-9 w-9 rounded-md bg-[#0b1622] text-white flex items-center justify-center">
                <FiUpload size={16} />
              </span>
              <div>
                <Dialog.Title className="text-[15px] font-semibold text-ink">
                  {step === "stamp" ? "Confirm Stamp" : `Upload ${typeLabel}`}
                </Dialog.Title>
                <p className="text-xs text-muted">
                  {step === "stamp"
                    ? "Choose how these documents should be stamped"
                    : "Add files, a folder, or a zip archive"}
                </p>
              </div>
            </div>
            {step !== "stamp" && (
              <button
                type="button"
                onClick={onClose}
                disabled={isBusy}
                className="p-2 hover:bg-[#f3f1ea] rounded-md disabled:opacity-50"
              >
                <FiX size={18} className="text-muted" />
              </button>
            )}
          </div>

          {step === "stamp" ? (
            <>
              <div className="p-5 space-y-3">
                <p className="text-sm text-ink">
                  Upload succeeded. Choose a stamp option to finish — files stay
                  hidden on the dashboard until you confirm
                  {uploadedItems.length > 1
                    ? ` for all ${uploadedItems.length} documents`
                    : ""}
                  .
                </p>
                {uploadedItems.length > 0 && (
                  <ul className="max-h-36 overflow-y-auto border border-rule rounded-md divide-y divide-[#eeeae1] text-[13px]">
                    {uploadedItems.slice(0, 30).map((item) => (
                      <li key={item.id} className="px-3 py-2 truncate text-ink">
                        {item.name}
                      </li>
                    ))}
                    {uploadedItems.length > 30 && (
                      <li className="px-3 py-2 text-muted">
                        +{uploadedItems.length - 30} more
                      </li>
                    )}
                  </ul>
                )}
              </div>
              <div className="flex justify-end gap-2 px-5 py-4 border-t border-rule">
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => applyAllStamp(false)}
                  className="h-9 px-4 rounded-md border border-rule text-[13px] font-medium text-ink hover:border-brand-dark disabled:opacity-50"
                >
                  Without Stamp
                </button>
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => applyAllStamp(true)}
                  className="h-9 px-4 rounded-md bg-[#0b1622] text-white text-[13px] font-medium hover:bg-ink-soft disabled:opacity-50"
                >
                  {savingStamp ? "Saving…" : "With Stamp"}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => handleUploadTypeChange("file")}
                    className={`p-3 border rounded-md text-center transition-colors disabled:opacity-50 ${
                      uploadType === "file"
                        ? "border-ink bg-[#0b1622] text-white"
                        : "border-rule text-muted hover:text-ink"
                    }`}
                  >
                    <FiFile size={20} className="mx-auto mb-1.5" />
                    <div className="text-[13px] font-medium">File(s)</div>
                  </button>
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => handleUploadTypeChange("folder")}
                    className={`p-3 border rounded-md text-center transition-colors disabled:opacity-50 ${
                      uploadType === "folder"
                        ? "border-ink bg-[#0b1622] text-white"
                        : "border-rule text-muted hover:text-ink"
                    }`}
                  >
                    <FiFolder size={20} className="mx-auto mb-1.5" />
                    <div className="text-[13px] font-medium">Folder</div>
                  </button>
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => handleUploadTypeChange("zip")}
                    className={`p-3 border rounded-md text-center transition-colors disabled:opacity-50 ${
                      uploadType === "zip"
                        ? "border-ink bg-[#0b1622] text-white"
                        : "border-rule text-muted hover:text-ink"
                    }`}
                  >
                    <FiPackage size={20} className="mx-auto mb-1.5" />
                    <div className="text-[13px] font-medium">Zip</div>
                  </button>
                </div>

                <div
                  className={`border border-dashed rounded-md p-6 text-center transition-colors ${
                    isBusy ? "opacity-60 pointer-events-none" : "cursor-pointer"
                  } ${
                    (uploadType === "file" || uploadType === "zip") &&
                    isDragging
                      ? "border-ink bg-[#f8f7f3]"
                      : "border-rule hover:border-[#b9b19f]"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => !isBusy && fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple={uploadType === "file"}
                    accept={
                      uploadType === "zip" ? ".zip,application/zip" : undefined
                    }
                    {...(uploadType === "folder"
                      ? ({ webkitdirectory: "", directory: "" } as any)
                      : {})}
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={isBusy}
                  />
                  <FiCloud className="mx-auto text-muted mb-3" size={28} />
                  <p className="text-sm font-medium text-ink">
                    {uploadType === "file"
                      ? "Drop files here or click to browse"
                      : uploadType === "zip"
                        ? "Drop a .zip here or click to browse"
                        : "Click to select a folder"}
                  </p>
                  {uploadType === "folder" && (
                    <p className="text-xs text-muted mt-1">
                      Folder structure will be preserved
                    </p>
                  )}
                  {uploadType === "zip" && (
                    <p className="text-xs text-muted mt-1">
                      Archive is unzipped; folders and files are uploaded in
                      place
                    </p>
                  )}
                </div>

                {selectedSummary && (
                  <div className="border border-rule rounded-md overflow-hidden">
                    <div className="px-3 py-2 bg-[#f8f7f3] border-b border-rule flex items-center justify-between gap-2">
                      <span className="text-[13px] font-medium text-ink truncate">
                        {uploadType === "folder"
                          ? `${selectedSummary.title} · ${selectedSummary.count} files`
                          : selectedSummary.title}
                      </span>
                      {!isBusy && (
                        <button
                          type="button"
                          onClick={clearSelectedFiles}
                          className="text-[12px] text-muted hover:text-ink shrink-0"
                        >
                          Clear all
                        </button>
                      )}
                    </div>
                    <ul className="max-h-44 overflow-y-auto divide-y divide-[#eeeae1] text-[13px]">
                      {selectedFiles.map((file, i) => {
                        const rel =
                          (file as File & { webkitRelativePath?: string })
                            .webkitRelativePath || file.name;
                        return (
                          <li
                            key={`${rel}-${i}`}
                            className="px-3 py-2 flex items-center gap-2"
                          >
                            <FiFile
                              size={14}
                              className="text-muted shrink-0"
                            />
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-ink">
                                {rel}
                              </span>
                              <span className="block text-[11px] text-muted">
                                {formatBytes(file.size)}
                              </span>
                            </span>
                            {!isBusy && (
                              <button
                                type="button"
                                onClick={() => removeSelectedFile(i)}
                                className="p-1.5 rounded-md text-muted hover:text-[#b42318] hover:bg-[#fdecea] shrink-0"
                                title="Remove"
                                aria-label={`Remove ${file.name}`}
                              >
                                <FiX size={15} />
                              </button>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                {progressLabel && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[13px]">
                      <span className="text-ink font-medium">
                        {progressLabel}
                      </span>
                      {!unzipping && uploadProgress !== null && (
                        <span className="text-muted tabular-nums">
                          {uploadProgress}%
                        </span>
                      )}
                    </div>
                    <div className="h-2 rounded-full bg-[#eeeae1] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#0b1622] transition-[width] duration-200 ease-out"
                        style={{
                          width: unzipping
                            ? "35%"
                            : `${Math.max(uploadProgress ?? 0, 4)}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 px-5 py-4 border-t border-rule">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isBusy}
                  className="h-9 px-4 rounded-md border border-rule text-[13px] font-medium text-ink disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={selectedFiles.length === 0 || isBusy}
                  className="h-9 px-4 rounded-md bg-[#0b1622] text-white text-[13px] font-medium hover:bg-ink-soft disabled:opacity-50 inline-flex items-center gap-2"
                >
                  {isBusy && (
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  {unzipping
                    ? "Extracting…"
                    : uploadProgress !== null
                      ? "Uploading…"
                      : `Upload ${typeLabel}`}
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
