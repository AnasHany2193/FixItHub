import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "./useToast";

import {
  getUsersByRole,
  getUserDetails,
  updateUserStatus,
  updateWorkerApproval,
  getAdminLogs,
  getAllRepairs,
  getRepairDetails,
  resetAuction,
  deleteRepair,
  cancelRepair,
  closeAuction,
  deleteReview,
  getAllProducts,
  getProductDetails,
  deleteProduct,
  getAllOrders,
  getAllReviews,
  deleteOrder,
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
export const useAdminLogs = (params) =>
  useQuery({
    queryKey: ["admin-logs", params],
    queryFn: () => getAdminLogs(params),
    staleTime: 5 * 60 * 1000,
  });

// List all repairs
export const useAdminRepairs = ({ auction, status, page, limit }) =>
  useQuery({
    queryKey: ["admin-repairs", auction, status, page, limit],
    queryFn: () => getAllRepairs({ auction, status, page, limit }),
    staleTime: 5 * 60 * 1000,
  });

// Repair details
export const useRepairDetails = (id) =>
  useQuery({
    queryKey: ["admin-repair", id],
    queryFn: () => getRepairDetails(id),
    enabled: !!id,
  });

// Reset auction
export const useResetAuction = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: resetAuction,
    onSuccess: (message) => {
      toast({
        variant: "success",
        title: "Auction Reset",
        description: message,
      });
      queryClient.invalidateQueries(["admin-repairs"]);
    },
    onError: (error) => {
      toast({
        variant: "error",
        title: "Reset Failed",
        description: error.message,
      });
    },
  });
};

// Delete repair
export const useDeleteRepair = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: deleteRepair,
    onSuccess: (message) => {
      toast({
        variant: "success",
        title: "Repair Deleted",
        description: message,
      });
      queryClient.invalidateQueries(["admin-repairs"]);
    },
    onError: (error) => {
      toast({
        variant: "error",
        title: "Delete Failed",
        description: error.message,
      });
    },
  });
};

// Cancel repair
export const useCancelRepair = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: cancelRepair,
    onSuccess: (message) => {
      toast({
        variant: "success",
        title: "Repair Canceled",
        description: message,
      });
      queryClient.invalidateQueries(["admin-repairs"]);
    },
    onError: (error) => {
      toast({
        variant: "error",
        title: "Cancel Failed",
        description: error.message,
      });
    },
  });
};

// Close auction
export const useCloseAuction = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: closeAuction,
    onSuccess: (message) => {
      toast({
        variant: "success",
        title: "Auction Closed",
        description: message,
      });
      queryClient.invalidateQueries(["admin-repairs"]);
    },
    onError: (error) => {
      toast({
        variant: "error",
        title: "Close Failed",
        description: error.message,
      });
    },
  });
};

// Products
export const useAllProducts = (filters) =>
  useQuery({
    queryKey: ["admin-products", filters],
    queryFn: () => getAllProducts(filters),
  });

export const useProductDetails = (id) =>
  useQuery({
    queryKey: ["admin-product", id],
    queryFn: () => getProductDetails(id),
    enabled: !!id,
  });

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: (message) => {
      toast({
        variant: "success",
        title: "Product Deleted",
        description: message,
      });
      queryClient.invalidateQueries(["admin-products"]);
    },
    onError: (error) => {
      toast({
        variant: "error",
        title: "Delete Failed",
        description: error.message,
      });
    },
  });
};

// Orders
export const useAllOrders = (filters) =>
  useQuery({
    queryKey: ["admin-orders", filters],
    queryFn: () => getAllOrders(filters),
  });

export const useDeleteOrder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: deleteOrder,
    onSuccess: (message) => {
      toast({
        variant: "success",
        title: "Order Deleted",
        description: message,
      });
      queryClient.invalidateQueries(["admin-orders"]);
    },
    onError: (error) => {
      toast({
        variant: "error",
        title: "Delete Failed",
        description: error.message,
      });
    },
  });
};

// Reviews
export const useAllReviews = () =>
  useQuery({
    queryKey: ["admin-reviews"],
    queryFn: getAllReviews,
  });

export const useDeleteReview = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: deleteReview,
    onSuccess: (message) => {
      toast({
        variant: "success",
        title: "Review Deleted",
        description: message,
      });
      queryClient.invalidateQueries(["admin-reviews"]);
    },
    onError: (error) => {
      toast({
        variant: "error",
        title: "Delete Failed",
        description: error.message,
      });
    },
  });
};
