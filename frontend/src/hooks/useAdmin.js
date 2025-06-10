import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "./useToast";

import {
  getUsersByRole,
  getUserDetails,
  updateUserStatus,
  updateWorkerApproval,
  getAdminLogs,
} from "@/api/admin";

// Users by role (customer/worker)
export const useUsersByRole = (role) =>
  useQuery({
    queryKey: ["admin-users", role],
    queryFn: () => getUsersByRole(role),
    staleTime: 5 * 60 * 1000,
  });

// Single user details
export const useUserDetails = (userId) =>
  useQuery({
    queryKey: ["admin-user", userId],
    queryFn: () => getUserDetails(userId),
    enabled: !!userId,
  });

// Update user status (active/banned)
export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: updateUserStatus,
    onSuccess: (data, { userId }) => {
      toast({
        variant: "success",
        title: "Status Updated",
        description: data.message,
      });
      queryClient.invalidateQueries(["admin-user", userId]);
      queryClient.invalidateQueries(["admin-users"]);
    },
    onError: (error) => {
      toast({
        variant: "error",
        title: "Update Failed",
        description: error.message,
      });
    },
  });
};

// Approve or reject a worker
export const useUpdateWorkerApproval = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: updateWorkerApproval,
    onSuccess: (data, { userId }) => {
      toast({
        variant: "success",
        title: "Worker Status Updated",
        description: data.message,
      });
      queryClient.invalidateQueries(["admin-user", userId]);
      queryClient.invalidateQueries(["admin-users", "worker"]);
    },
    onError: (error) => {
      toast({
        variant: "error",
        title: "Update Failed",
        description: error.message,
      });
    },
  });
};

// Admin logs
export const useAdminLogs = () =>
  useQuery({
    queryKey: ["admin-logs"],
    queryFn: getAdminLogs,
    staleTime: 5 * 60 * 1000,
  });
