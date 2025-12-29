// hooks/useFiles.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";
import type { File } from "../types";

import { API_BASE_URL } from "../config";
// File functions
const fetchFiles = async (folderId: number | null = null): Promise<File[]> => {
  const url = folderId
    ? `${API_BASE_URL}/files?folder_id=${folderId}`
    : `${API_BASE_URL}/files`;

  console.log(
    `🔍 Frontend fetchFiles called - folderId: ${folderId}, url: ${url}`
  );

  const response = await axios.get(url, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });

  console.log(
    `📁 Frontend received ${response.data.files.length} files:`,
    response.data.files.map((f: any) => ({
      id: f.id,
      name: f.name,
      folder_id: f.folder_id,
    }))
  );

  return response.data.files as File[];
};

const uploadFile = async (data: FormData): Promise<File> => {
  console.log("🚀 Starting file upload...");

  // Debug: Log FormData contents
  console.log("📋 FormData contents:");
  for (let [key, value] of data.entries()) {
    if (value instanceof File) {
      console.log(
        `  ${key}: File - ${value.name} (${value.size} bytes, ${value.type})`
      );
    } else {
      console.log(`  ${key}: ${value}`);
    }
  }

  try {
    const response = await axios.post(`${API_BASE_URL}/files/upload`, data, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "multipart/form-data",
      },
      timeout: 120000, // 2 minute timeout for large files
      onUploadProgress: (progressEvent) => {
        const progress = progressEvent.total
          ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
          : 0;
        console.log(`📤 Upload Progress: ${progress}%`);
      },
    });

    console.log("✅ Upload successful:", response.data);
    return response.data as File;
  } catch (error: any) {
    console.error("❌ Upload failed:", error);
    if (error.response) {
      console.error("Response error:", error.response.data);
      console.error("Response status:", error.response.status);
    }
    throw error;
  }
};

const uploadFolder = async (data: FormData): Promise<{ files: File[] }> => {
  console.log("🚀 Starting folder upload...");

  // Debug: Log FormData contents
  console.log("📋 FormData contents for folder:");
  for (let [key, value] of data.entries()) {
    if (value instanceof File) {
      console.log(`  ${key}: File - ${value.name} (${value.size} bytes)`);
      console.log(
        `    - webkitRelativePath: ${(value as any).webkitRelativePath || "NOT SET"
        }`
      );
    } else {
      console.log(`  ${key}: ${value}`);
    }
  }

  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await axios.post(
      `${API_BASE_URL}/files/upload-folder`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        timeout: 300000, // 5 minute timeout for folders
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;
          console.log(`📤 Upload Progress: ${progress}%`);
        },
      }
    );

    console.log("✅ Folder upload successful:", response.data);
    return response.data as { files: File[] };
  } catch (error: any) {
    console.error("❌ Folder upload failed:", error);
    if (error.response) {
      console.error("Response error:", error.response.data);
      console.error("Response status:", error.response.status);
    }
    throw error;
  }
};

const downloadFile = async (id: number, fileName?: string): Promise<void> => {
  console.log(`📥 Downloading file ${id}...`);
  console.log(`📥 Download URL: ${API_BASE_URL}/files/${id}/download`);

  // Validate file ID
  if (!id || isNaN(id)) {
    throw new Error("Invalid file ID provided for download");
  }

  try {
    // Use the correct backend endpoint: /files/download/{id}
    console.log(`📥 Downloading from: ${API_BASE_URL}/files/download/${id}`);
    const response = await axios.get(`${API_BASE_URL}/files/download/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      responseType: "blob",
    });
    console.log(`✅ Download successful`);
    console.log("🔍 All response headers:", response.headers);

    // Check if response is valid
    if (!response.data) {
      throw new Error("No file data received");
    }

    // Get filename from content-disposition header or use provided filename
    const contentDisposition = response.headers["content-disposition"];
    console.log("🔍 Content-Disposition header:", contentDisposition);

    let filename = `file-${id}`;
    if (contentDisposition) {
      // Split by semicolon and find the filename part
      const parts = contentDisposition.split(";");
      for (const part of parts) {
        const trimmed = part.trim();
        if (trimmed.startsWith("filename=")) {
          filename = trimmed.substring(9); // Remove "filename="
          // Remove quotes if present
          if (filename.startsWith('"') && filename.endsWith('"')) {
            filename = filename.slice(1, -1);
          }
          break;
        }
      }
      console.log("🔍 Extracted filename:", filename);
    } else if (fileName) {
      // Use the filename passed from the component
      filename = fileName;
      console.log("🔍 Using provided filename:", filename);
    } else {
      console.log(
        "❌ No Content-Disposition header found and no filename provided"
      );
      filename = `downloaded-file-${id}`;
    }

    // Get MIME type from response headers
    const contentType =
      response.headers["content-type"] || "application/octet-stream";

    // Create blob with correct MIME type
    const blob = new Blob([response.data], { type: contentType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();

    // Clean up after a short delay
    setTimeout(() => {
      link.remove();
      window.URL.revokeObjectURL(url);
    }, 100);

    console.log("✅ Download completed:", filename);
  } catch (error: any) {
    console.error("❌ Download failed:", error);
    console.error("❌ Error response:", error.response?.data);
    console.error("❌ Error status:", error.response?.status);
    console.error("❌ Error URL:", error.config?.url);

    // Handle specific error cases
    if (error.response?.status === 404) {
      throw new Error(
        `File not found (ID: ${id}). Please check if the file exists.`
      );
    } else if (error.response?.status === 403) {
      throw new Error("Permission denied");
    } else if (error.response?.status === 500) {
      throw new Error("Server error occurred");
    } else {
      throw new Error(error.message || "Download failed");
    }
  }
};

const downloadFolder = async (id: number): Promise<void> => {
  console.log(`📥 Downloading folder ${id}...`);

  try {
    const response = await axios.get(`${API_BASE_URL}/folders/${id}/download`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      responseType: "blob",
    });

    // Check if response is valid
    if (!response.data) {
      throw new Error("No folder data received");
    }

    // Create blob and download
    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;

    // Get filename from content-disposition header
    const contentDisposition = response.headers["content-disposition"];
    let filename = `folder-${id}.zip`; // Fallback name

    if (contentDisposition) {
      // Handle both quoted and unquoted filenames
      const filenameMatch = contentDisposition.match(
        /filename\*?=["']?([^"']+)["']?/i
      );
      if (filenameMatch && filenameMatch[1]) {
        // Extract the actual filename, handling potential encoding
        filename = decodeURIComponent(
          filenameMatch[1].split("''").pop() || filenameMatch[1]
        );
      } else {
        // Alternative pattern matching
        const altMatch = contentDisposition.match(
          /filename=["']?([^"';]+)["']?/i
        );
        if (altMatch && altMatch[1]) {
          filename = altMatch[1];
        }
      }
    }

    console.log("📁 Downloading folder with filename:", filename);

    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();

    // Clean up after a short delay
    setTimeout(() => {
      link.remove();
      window.URL.revokeObjectURL(url);
    }, 100);

    console.log("✅ Folder download completed:", filename);
  } catch (error: any) {
    console.error("❌ Folder download failed:", error);

    // Handle specific error cases
    if (error.response?.status === 404) {
      throw new Error(
        "Folder not found or you don't have permission to access it"
      );
    } else if (error.response?.status === 403) {
      throw new Error(
        "Permission denied - you don't have download permission for this folder"
      );
    } else if (error.response?.status === 500) {
      throw new Error("Server error occurred");
    } else {
      throw new Error(error.message || "Folder download failed");
    }
  }
};

// hooks/useFiles.ts - Add this function
const fetchRootFiles = async (): Promise<File[]> => {
  console.log(
    `🔍 Frontend fetchRootFiles called - url: ${API_BASE_URL}/files/root`
  );

  const response = await axios.get(`${API_BASE_URL}/files/root`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });

  console.log(
    `📁 Frontend received ${response.data.files.length} root files:`,
    response.data.files.map((f: any) => ({
      id: f.id,
      name: f.name,
      folder_id: f.folder_id,
    }))
  );

  return response.data.files as File[];
};

// Add this hook
export const useRootFiles = () =>
  useQuery({
    queryKey: ["rootFiles"],
    queryFn: fetchRootFiles,
    enabled: !!localStorage.getItem("token"),
  });

const updateFile = async ({
  id,
  name,
}: {
  id: number;
  name: string;
}): Promise<File> => {
  const response = await axios.put(
    `${API_BASE_URL}/files/${id}`,
    { name },
    {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    }
  );
  return response.data as File;
};

const deleteFile = async (id: number): Promise<{ message: string }> => {
  const response = await axios.delete(`${API_BASE_URL}/files/${id}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  return response.data as { message: string };
};

// Favourites and Trash functions
// const toggleFileFavourite = async (
//   id: number
// ): Promise<{ id: number; is_faviourite: boolean }> => {
//   const response = await axios.post(
//     `${API_BASE_URL}/files/${id}/favourite/toggle`,
//     {},
//     {
//       headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
//     }
//   );
//   return response.data as { id: number; is_faviourite: boolean };
// };

// const fetchFavouriteFiles = async (): Promise<File[]> => {
//   const response = await axios.get(`${API_BASE_URL}/files/favourites`, {
//     headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
//   });
//   return response.data.files as File[];
// };

const fetchTrashFiles = async (): Promise<File[]> => {
  const response = await axios.get(`${API_BASE_URL}/files/trash`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  return response.data.files as File[];
};

const fetchTrashFilesByFolder = async (
  folderId: number | null = null
): Promise<File[]> => {
  const url = folderId
    ? `${API_BASE_URL}/files/trash?folder_id=${folderId}`
    : `${API_BASE_URL}/files/trash`;

  console.log(
    `🔍 Frontend fetchTrashFilesByFolder called - folderId: ${folderId}, url: ${url}`
  );

  const response = await axios.get(url, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });

  console.log(
    `📁 Frontend received ${response.data.files.length} trash files:`,
    response.data.files.map((f: any) => ({
      id: f.id,
      name: f.name,
      folder_id: f.folder_id,
    }))
  );

  return response.data.files as File[];
};

// Favourites navigation functions
// const fetchFavouriteFilesNavigation = async (
//   folderId: number | null = null
// ): Promise<File[]> => {
//   const url = folderId
//     ? `${API_BASE_URL}/files/favourites/navigate?folder_id=${folderId}`
//     : `${API_BASE_URL}/files/favourites/navigate`;

//   console.log(
//     `🔍 Frontend fetchFavouriteFilesNavigation called - folderId: ${folderId}, url: ${url}`
//   );

//   const response = await axios.get(url, {
//     headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
//   });

//   console.log(
//     `📁 Frontend received ${response.data.files.length} favourite files:`,
//     response.data.files.map((f) => ({
//       id: f.id,
//       name: f.name,
//       folder_id: f.folder_id,
//     }))
//   );

//   return response.data.files as File[];
// };

// Restore and permanent delete functions
const restoreFile = async (id: number): Promise<{ message: string }> => {
  const response = await axios.post(
    `${API_BASE_URL}/files/${id}/restore`,
    {},
    {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    }
  );
  return response.data as { message: string };
};

const permanentDeleteFile = async (
  id: number
): Promise<{ message: string }> => {
  const response = await axios.delete(`${API_BASE_URL}/files/${id}/permanent`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  return response.data as { message: string };
};

const moveFile = async ({
  fileId,
  targetFolderIds,
}: {
  fileId: number;
  targetFolderIds: number[];
}): Promise<{ message: string }> => {
  const response = await axios.post(
    `${API_BASE_URL}/files/${fileId}/move`,
    { targetFolderIds },
    {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    }
  );
  return response.data as { message: string };
};

// Hooks
export const useFiles = (folderId: number | null = null) =>
  useQuery({
    queryKey: ["files", folderId],
    queryFn: () => fetchFiles(folderId),
    enabled: !!localStorage.getItem("token"),
  });

export const useUploadFile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: uploadFile,
    onSuccess: (data) => {
      console.log("🎉 FILE UPLOAD SUCCESS:", data);

      queryClient.invalidateQueries({ queryKey: ["files"] });
      queryClient.invalidateQueries({ queryKey: ["rootFiles"] });
      // Invalidate all file queries to ensure UI updates
      queryClient.invalidateQueries({ queryKey: ["files", undefined] });
      toast.success(`File  uploaded successfully!`);
    },
    onError: (error: any) => {
      console.error("Upload mutation error:", error);
      toast.error(error.response?.data?.message || "Failed to upload file");
    },
  });
};

export const useUploadFolder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: uploadFolder,
    onSuccess: (data) => {
      console.log("🎉 FOLDER UPLOAD SUCCESS:", data);
      console.log("🔄 Invalidating queries...");

      // Invalidate all file and folder queries
      queryClient.invalidateQueries({ queryKey: ["files"] });
      queryClient.invalidateQueries({ queryKey: ["rootFiles"] });
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      queryClient.invalidateQueries({ queryKey: ["rootFolders"] });

      // Invalidate specific folder queries (for nested folders)
      queryClient.invalidateQueries({ queryKey: ["files", null] });
      queryClient.invalidateQueries({ queryKey: ["files", undefined] });
      queryClient.invalidateQueries({ queryKey: ["folders", null] });
      queryClient.invalidateQueries({ queryKey: ["folders", undefined] });

      // Force refetch of all data
      queryClient.refetchQueries({ queryKey: ["files"] });
      queryClient.refetchQueries({ queryKey: ["folders"] });
      queryClient.refetchQueries({ queryKey: ["rootFiles"] });
      queryClient.refetchQueries({ queryKey: ["rootFolders"] });

      // Also invalidate all queries to be safe
      queryClient.invalidateQueries();

      // Add a small delay to ensure backend has processed the upload
      setTimeout(() => {
        console.log("🔄 [Delayed] Refetching queries after upload...");
        queryClient.refetchQueries({ queryKey: ["files"] });
        queryClient.refetchQueries({ queryKey: ["folders"] });
        queryClient.refetchQueries({ queryKey: ["rootFiles"] });
        queryClient.refetchQueries({ queryKey: ["rootFolders"] });
      }, 1000);

      console.log("✅ All queries invalidated and refetched");
      toast.success(
        `Folder uploaded successfully! ${data.files.length} files added.`
      );
    },
    onError: (error: any) => {
      console.error("❌ FOLDER UPLOAD ERROR:", error);
      console.error("❌ Error details:", error.message);
      console.error("❌ Error response:", error.response?.data);
      console.error("❌ Error status:", error.response?.status);
      toast.error(error.response?.data?.message || "Failed to upload folder");
    },
  });
};

export const useDownloadFile = () =>
  useMutation({
    mutationFn: ({ id, fileName }: { id: number; fileName?: string }) =>
      downloadFile(id, fileName),
    onSuccess: () => {
      toast.success("File downloaded successfully!");
    },
    onError: (error: any) => {
      console.error("Download mutation error:", error);
      toast.error(error.response?.data?.message || "Failed to download file");
    },
  });

export const useDownloadFolder = () =>
  useMutation({
    mutationFn: downloadFolder,
    onSuccess: () => {
      toast.success("Folder downloaded successfully!");
    },
    onError: (error: any) => {
      console.error("Folder download mutation error:", error);
      toast.error(error.response?.data?.message || "Failed to download folder");
    },
  });

export const useUpdateFile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateFile,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
      queryClient.invalidateQueries({ queryKey: ["rootFiles"] });
      // Invalidate all file queries to ensure UI updates
      queryClient.invalidateQueries({ queryKey: ["files", undefined] });
      toast.success(`File renamed to "${data.name}" successfully!`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update file");
    },
  });
};

export const useDeleteFile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteFile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
      queryClient.invalidateQueries({ queryKey: ["rootFiles"] });
      // Invalidate all file queries to ensure UI updates
      queryClient.invalidateQueries({ queryKey: ["files", undefined] });
      toast.success("File moved to trash successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete file");
    },
  });
};

// New hooks for favourites and trash
// export const useToggleFileFavourite = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: toggleFileFavourite,
//     onSuccess: (data) => {
//       queryClient.invalidateQueries({ queryKey: ["files"] });
//       queryClient.invalidateQueries({ queryKey: ["rootFiles"] });
//       queryClient.invalidateQueries({ queryKey: ["favouriteFiles"] });
//       queryClient.invalidateQueries({ queryKey: ["trashFiles"] });

//       if (data.is_faviourite) {
//         toast.success("File added to favorites!");
//       } else {
//         toast.success("File removed from favorites!");
//       }
//     },
//     onError: (error: any) => {
//       toast.error(
//         error.response?.data?.message || "Failed to update favorites"
//       );
//     },
//   });
// };

// export const useFavouriteFiles = () =>
//   useQuery({
//     queryKey: ["favouriteFiles"],
//     queryFn: fetchFavouriteFiles,
//     enabled: !!localStorage.getItem("token"),
//   });

export const useTrashFiles = () =>
  useQuery({
    queryKey: ["trashFiles"],
    queryFn: fetchTrashFiles,
    enabled: !!localStorage.getItem("token"),
  });

export const useTrashFilesByFolder = (folderId: number | null) =>
  useQuery({
    queryKey: ["trashFiles", folderId],
    queryFn: () => fetchTrashFilesByFolder(folderId),
    enabled: !!localStorage.getItem("token"),
  });

// New hooks for favourites navigation
// export const useFavouriteFilesNavigation = (folderId: number | null = null) =>
//   useQuery({
//     queryKey: ["favouriteFilesNavigation", folderId],
//     queryFn: () => fetchFavouriteFilesNavigation(folderId),
//     enabled: !!localStorage.getItem("token"),
//   });

// New hooks for restore and permanent delete
export const useRestoreFile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: restoreFile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
      queryClient.invalidateQueries({ queryKey: ["rootFiles"] });
      queryClient.invalidateQueries({ queryKey: ["favouriteFiles"] });
      queryClient.invalidateQueries({ queryKey: ["trashFiles"] });
      toast.success("File restored successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to restore file");
    },
  });
};

export const usePermanentDeleteFile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: permanentDeleteFile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
      queryClient.invalidateQueries({ queryKey: ["rootFiles"] });
      queryClient.invalidateQueries({ queryKey: ["favouriteFiles"] });
      queryClient.invalidateQueries({ queryKey: ["trashFiles"] });
      toast.success("File permanently deleted!");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to delete file permanently"
      );
    },
  });
};

export const useMoveFile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: moveFile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
      queryClient.invalidateQueries({ queryKey: ["rootFiles"] });
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      queryClient.invalidateQueries({ queryKey: ["rootFolders"] });
      toast.success("File moved successfully!");
    },
  });
};
export const useBulkPermanentDeleteFiles = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ids: number[]) => {
      // Execute all deletions in parallel
      await Promise.all(ids.map((id) => permanentDeleteFile(id)));
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
      queryClient.invalidateQueries({ queryKey: ["rootFiles"] });
      queryClient.invalidateQueries({ queryKey: ["favouriteFiles"] });
      queryClient.invalidateQueries({ queryKey: ["trashFiles"] });
      toast.success(`${variables.length} files permanently deleted!`);
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to delete some files permanently"
      );
    },
  });
};
