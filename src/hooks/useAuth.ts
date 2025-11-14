// hooks/useAuth.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";
import type { User } from "../types";

const API_BASE_URL = "https://rmtfms.duckdns.org/api";
// const API_BASE_URL = "http://localhost:3000/api";

// Login types and hook
interface LoginCredentials {
  username: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: User;
}

export const useLogin = () => {
  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      console.log("Login successful:", data);

      // Store token and user data in localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      toast.success(`Welcome back, ${data.user.username}!`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Login failed");
    },
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUser,
    onSuccess: (data, variables) => {
      console.log("User created:", data);
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success(`User "${variables.username}" created successfully!`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create user");
    },
  });
};

export const useUsers = () =>
  useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
    enabled: !!localStorage.getItem("token"),
  });

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUser,
    onSuccess: (data, variables) => {
      console.log("User updated:", data);

      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success(`User "${variables.username}" updated successfully!`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update user");
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUser,
    onSuccess: (data, variables) => {
      console.log("User deleted:", data, variables);

      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User deleted successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete user");
    },
  });
};

// Auth functions
const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials);
  return response.data;
};

const createUser = async (userData: {
  username: string;
  password: string;
  role: string;
}) => {
  const response = await axios.post(`${API_BASE_URL}/auth/register`, userData, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  return response.data as User;
};

const fetchUsers = async () => {
  const response = await axios.get(`${API_BASE_URL}/auth/users`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  return response.data as User[];
};

const updateUser = async (userData: {
  id: number;
  username: string;
  password?: string;
  role: string;
}) => {
  const response = await axios.put(
    `${API_BASE_URL}/auth/users/${userData.id}`,
    userData,
    {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    }
  );
  return response.data as User;
};

const deleteUser = async (userId: number) => {
  const response = await axios.delete(`${API_BASE_URL}/auth/users/${userId}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  return response.data;
};
