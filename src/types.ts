// types/index.ts
export interface User {
  id: number;
  username: string;
  role: "super_admin" | "admin" | "user";
}

export interface Folder {
  id: number;
  name: string;
  parent_id: number | null;
  created_by: number;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  deleted_at?: string | null;
  folder_name?: string; // For joined queries
  nested_folders?: Folder[];
}

export interface File {
  id: number;
  name: string;
  original_name: string;
  folder_id: number | null;
  file_path: string; // Changed from cloudinary_public_id
  file_url: string; // Changed from cloudinary_url
  mime_type: string;
  size: number;
  created_by: number;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  deleted_at?: string | null;
  folder_name?: string; // For joined queries
}

export interface Permission {
  id: number;
  user_id: number;
  resource_id: number;
  resource_type: "folder" | "file";
  can_read: boolean;
  can_download: boolean;
  created_at: string;
  updated_at: string;
  username?: string; // For joined queries
  role?: string; // For joined queries
}

export interface SharedResource {
  id: number;
  resource_id: number;
  resource_type: "file" | "folder";
  shared_by: number;
  shared_with: number;
  share_token: string;
  can_edit: boolean;
  can_download: boolean;
  can_share: boolean;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface FilesResponse {
  files: File[];
}

export interface FoldersResponse {
  folders: Folder[];
}

export interface FolderResponse {
  folder: Folder;
  subfolders?: Folder[];
}

export interface PermissionsResponse {
  permissions: Permission[];
}

export interface LoginResponse {
  token: string;
  user: User;
}
