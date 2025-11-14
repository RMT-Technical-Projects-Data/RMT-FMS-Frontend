// // hooks/usePermissions.ts
// import { useMutation, useQuery } from "@tanstack/react-query";
// import axios from "axios";
// import { toast } from "react-toastify";
// import type { Permission } from "../types";

// const API_BASE_URL = "https://rmtfms.duckdns.org/api";

// // Permission functions
// const assignPermission = async (
//   data: Omit<Permission, "id" | "created_at" | "updated_at">
// ) => {
//   const response = await axios.post(
//     `${API_BASE_URL}/permissions/assign`,
//     data,
//     {
//       headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
//     }
//   );
//   return response.data as { id: number; message: string };
// };

// const getResourcePermissions = async (
//   resource_id: number,
//   resource_type: "file" | "folder"
// ) => {
//   const response = await axios.get(
//     `${API_BASE_URL}/permissions/resource?resource_id=${resource_id}&resource_type=${resource_type}`,
//     {
//       headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
//     }
//   );
//   return response.data.permissions as Permission[];
// };

// const removePermission = async (permission_id: number) => {
//   const response = await axios.delete(`${API_BASE_URL}/permissions/remove`, {
//     headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
//     data: { permission_id },
//   });
//   return response.data as { message: string };
// };

// const getUserPermissions = async () => {
//   const response = await axios.get(`${API_BASE_URL}/permissions/user`, {
//     headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
//   });
//   return response.data.permissions as Permission[];
// };

// // Hooks
// export const useAssignPermission = () =>
//   useMutation({
//     mutationFn: assignPermission,
//     onSuccess: (data) => {
//       toast.success("Permission altered succeesfully");
//     },
//     onError: () => {
//       toast.error("Failed to assign permission");
//     },
//   });

// export const useResourcePermissions = (
//   resource_id: number,
//   resource_type: "file" | "folder"
// ) =>
//   useQuery({
//     queryKey: ["permissions", resource_id, resource_type],
//     queryFn: () => getResourcePermissions(resource_id, resource_type),
//     enabled: !!resource_id && !!localStorage.getItem("token"),
//   });

// export const useUserPermissions = () =>
//   useQuery({
//     queryKey: ["userPermissions"],
//     queryFn: getUserPermissions,
//     enabled: !!localStorage.getItem("token"),
//   });

// export const useRemovePermission = () =>
//   useMutation({
//     mutationFn: removePermission,
//     onSuccess: (data) => {
//       toast.success(data.message || "Permission removed successfully");
//     },
//     onError: () => {
//       toast.error("Failed to remove permission");
//     },
//   });
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import type { Permission } from "../types";

const API_BASE_URL = "https://rmtfms.duckdns.org/api";

// Permission functions
const assignPermission = async (
  data: Omit<Permission, "id" | "created_at" | "updated_at">
) => {
  const response = await axios.post(`${API_BASE_URL}/permissions/assign`, data, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  return response.data as { id: number; message: string };
};

const getResourcePermissions = async (
  resource_id: number,
  resource_type: "file" | "folder"
) => {
  const response = await axios.get(
    `${API_BASE_URL}/permissions/resource?resource_id=${resource_id}&resource_type=${resource_type}`,
    {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    }
  );
  return response.data.permissions as Permission[];
};

// Remove permission by permission id
const removePermission = async (permission_id: number) => {
  const response = await axios.delete(`${API_BASE_URL}/permissions/remove`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    data: { permission_id },
  });
  return response.data as { message: string };
};

// Some backends offer removing by user/resource; attempt this endpoint if exists
const removePermissionByUser = async ({
  user_id,
  resource_id,
  resource_type,
}: {
  user_id: number;
  resource_id: number;
  resource_type: "file" | "folder";
}) => {
  // If your backend supports removing by user + resource, implement that endpoint here.
  // Fallback will be: find permission id from resource list and call removePermission(permission_id).
  const response = await axios.delete(`${API_BASE_URL}/permissions/remove-by-user`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    data: { user_id, resource_id, resource_type },
  });
  return response.data as { message: string };
};

const getUserPermissions = async () => {
  const response = await axios.get(`${API_BASE_URL}/permissions/user`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  return response.data.permissions as Permission[];
};

// Hooks
export const useAssignPermission = () =>
  useMutation({
    mutationFn: assignPermission,
    // intentionally no toasts here — caller controls consolidated notifications
  });

export const useResourcePermissions = (
  resource_id: number,
  resource_type: "file" | "folder"
) =>
  useQuery({
    queryKey: ["permissions", resource_id, resource_type],
    queryFn: () => getResourcePermissions(resource_id, resource_type),
    enabled: !!resource_id && !!localStorage.getItem("token"),
  });

export const useUserPermissions = () =>
  useQuery({
    queryKey: ["userPermissions"],
    queryFn: getUserPermissions,
    enabled: !!localStorage.getItem("token"),
  });

export const useRemovePermission = () =>
  useMutation({
    mutationFn: removePermission,
    // no toasts here either — caller will handle single consolidated toasts
    // but expose mutateAsyncByUser helper so caller can attempt remove-by-user endpoint if available
    onMutate: undefined,
  });

// attach helper to mutation object at runtime (some callers check for mutateAsyncByUser)
export const removePermissionHelpers = {
  removePermissionByUser,
};
