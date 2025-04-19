import { useToast } from "./useToast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  cancelRepair,
  createRepair,
  getCustomerHistory,
  getRepairDetails,
  getRepairRequests,
  startRepairAuction,
  updateRepairRequest,
} from "@/api/repairs";
import { useNavigate } from "react-router";

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
        description: data.message,
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
      queryClient.invalidateQueries(["repairs", variables.repairId]);
      toast({
        variant: "success",
        title: "Auction Started",
        description: data.message,
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
    mutationFn: updateRepairRequest,
    onSuccess: (data, variables) => {
      // Update single repair cache
      queryClient.setQueryData(["repairs", variables.repairId], data);

      // Invalidate list cache to ensure freshness
      queryClient.invalidateQueries(["repairs"]);

      toast({
        variant: "success",
        title: "Repair Updated",
        description: data.message,
      });
      navigate("/repairs/all");
    },
    onError: (error) => {
      console.log("error", error);
      toast({
        variant: "error",
        title: "Update Failed",
        description: error.message,
      });
    },
  });
};

export const useRepairRequests = (status) =>
  useQuery({
    queryKey: ["repairs", status],
    queryFn: () => getRepairRequests({ status }),
    staleTime: 5 * 60 * 1000,
  });

export const useRepairDetails = (repairId) =>
  useQuery({
    queryKey: ["repairs", repairId],
    queryFn: () => getRepairDetails(repairId),
    enabled: !!repairId,
  });

export const useCancelRepair = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: cancelRepair,
    onSuccess: (data) => {
      queryClient.invalidateQueries(["repairs"]);
      toast({
        variant: "success",
        title: "Repair Cancelled",
        description: data.message,
      });
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

export const useCustomerHistory = (filters) =>
  useQuery({
    queryKey: ["repairs", "history", filters],
    queryFn: () => getCustomerHistory(filters),
  });
