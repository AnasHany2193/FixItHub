import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useToast } from "./useToast";

import {
  cancelRepair,
  createRepair,
  getRepairDetails,
  getRepairRequests,
  startRepairAuction,
  updateRepairRequest,
  updateRepairStatus,
} from "@/api/repairs";

export const useCreateRepair = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: createRepair,
    onSuccess: (data) => {
      queryClient.invalidateQueries(["repairs"]);

      toast({
        variant: "success",
        title: "Repair Created",
        description: data.message || "Repair request submitted successfully",
      });
      navigate("/repairs/all");
    },
    onError: (error) => {
      toast({
        variant: "error",
        title: "Creation Failed",
        description: error.message,
      });
    },
  });
};

export const useStartRepairAuction = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: startRepairAuction,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(["repairs", variables.id]);
      toast({
        variant: "success",
        title: "Auction Started",
        description: data.message || "Bidding is now open for workers",
      });
    },
    onError: (error) => {
      toast({
        variant: "error",
        title: "Auction Failed",
        description: error.message,
      });
    },
  });
};

export const useUpdateRepair = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({ id, ...updateData }) => updateRepairRequest(id, updateData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(["repairs", variables.id]);
      queryClient.invalidateQueries(["repairs"]);
      toast({
        variant: "success",
        title: "Repair Updated",
        description: data.message || "Repair request updated successfully",
      });
      navigate(`/repairs/${variables.id}`);
    },
    onError: (error) => {
      toast({
        variant: "error",
        title: "Update Failed",
        description: error.message || "Failed to update repair request",
      });
    },
  });
};

export const useUpdateRepairStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: updateRepairStatus,
    onSuccess: (data) => {
      queryClient.invalidateQueries(["repairs"]);
      toast({
        variant: "success",
        title: "Status Updated",
        description: data.message || "Repair status updated successfully",
      });
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

export const useRepairRequests = (statusFilters = []) => {
  const { toast } = useToast();

  return useQuery({
    queryKey: ["repairs", statusFilters],
    queryFn: () =>
      getRepairRequests({
        status: Array.isArray(statusFilters)
          ? statusFilters.join(",")
          : statusFilters,
      }),
    staleTime: 1000 * 60 * 5, // 5 minutes
    onError: (error) => {
      toast({
        variant: "error",
        title: "Failed to load repairs",
        description: error.message,
      });
    },
  });
};

export const useRepairDetails = (repairId) => {
  const { toast } = useToast();

  return useQuery({
    queryKey: ["repairs", repairId],
    queryFn: () => getRepairDetails(repairId),
    enabled: !!repairId, // Only fetch when ID exists
    staleTime: 1000 * 60 * 5, // 5 minutes cache
    onError: (error) => {
      toast({
        variant: "error",
        title: "Failed to load repair",
        description: error.message,
      });
    },
  });
};

export const useCancelRepair = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: cancelRepair,
    onSuccess: (data) => {
      queryClient.invalidateQueries(["repairs"]);
      toast({
        variant: "success",
        title: "Repair Cancelled",
        description: data.message || "Repair request cancelled successfully",
      });
      navigate("/repairs/all");
    },
    onError: (error) => {
      toast({
        variant: "error",
        title: "Cancellation Failed",
        description: error.message,
      });
    },
  });
};
