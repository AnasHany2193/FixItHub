import { useToast } from "./useToast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  acceptBid,
  acceptOffer,
  cancelRepair,
  completeRepair,
  createRepair,
  getAuctionDetails,
  getCustomerHistory,
  getNonAuctionRepairDetails,
  getNonAuctionRepairs,
  getOpenAuctions,
  getRepairDetails,
  getRepairRequests,
  getWorkerHistory,
  getWorkerRepairs,
  returnRepair,
  startRepairAuction,
  submitBid,
  submitOffer,
  updateBid,
  updateOffer,
  updateRepairRequest,
  updateTrackingStatus,
} from "@/api/repairs";
import { useNavigate } from "react-router";

// Customer endpoints
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

export const useAcceptBid = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: acceptBid,
    onSuccess: (data, { repairId }) => {
      queryClient.invalidateQueries(["repairs", repairId]);
      queryClient.invalidateQueries(["auctions"]);
      toast({
        variant: "success",
        title: "Bid Accepted",
        description: data.message,
      });
    },
    onError: (error) => {
      toast({
        variant: "error",
        title: "Acceptance Failed",
        description: error.message,
      });
    },
  });
};

export const useAcceptOffer = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: acceptOffer,
    onSuccess: (data, { repairId }) => {
      queryClient.invalidateQueries(["repairs", repairId]);
      queryClient.invalidateQueries(["non-auctions"]);
      toast({
        variant: "success",
        title: "Offer Accepted",
        description: data.message,
      });
    },
    onError: (error) => {
      toast({
        variant: "error",
        title: "Acceptance Failed",
        description: error.message,
      });
    },
  });
};

// Worker endpoints
export const useWorkerRepairs = (status) =>
  useQuery({
    queryKey: ["worker-repairs", status],
    queryFn: () => getWorkerRepairs({ status }),
  });

export const useWorkerRepair = (repairId) => {
  return useQuery({
    queryKey: ["worker-repair", repairId],
    queryFn: () => getRepairDetails(repairId),
    enabled: !!repairId, // Only run the query if repairId is provided
  });
};

export const useCompleteRepair = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: completeRepair,
    onSuccess: (data, repairId) => {
      queryClient.invalidateQueries(["worker-repairs"]);
      queryClient.invalidateQueries(["repairs", repairId]);
      toast({
        variant: "success",
        title: "Repair Completed",
        description: data.message,
      });
    },
    onError: (error) => {
      toast({
        variant: "error",
        title: "Completion Failed",
        description: error.message,
      });
    },
  });
};

export const useUpdateTracking = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: updateTrackingStatus,
    onSuccess: (data, repairId) => {
      queryClient.invalidateQueries(["repairs", repairId]);
      toast({
        variant: "success",
        title: "Status Updated",
        description: data.message,
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

export const useReturnRepair = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: returnRepair,
    onSuccess: (data, repairId) => {
      queryClient.invalidateQueries(["worker-repairs"]);
      queryClient.invalidateQueries(["repairs", repairId]);
      toast({
        variant: "success",
        title: "Return Initiated",
        description: data.message,
      });
    },
    onError: (error) => {
      toast({
        variant: "error",
        title: "Return Failed",
        description: error.message,
      });
    },
  });
};

export const useWorkerHistory = (filters) =>
  useQuery({
    queryKey: ["worker-history", filters],
    queryFn: () => getWorkerHistory(filters),
  });

// Auction endpoints
export const useOpenAuctions = (filters) =>
  useQuery({
    queryKey: ["auctions", filters],
    queryFn: () => getOpenAuctions(filters),
    staleTime: 60 * 1000, // 1 minute cache
  });

export const useAuctionDetails = (auctionId) =>
  useQuery({
    queryKey: ["auctions", auctionId],
    queryFn: () => getAuctionDetails(auctionId),
    enabled: !!auctionId,
    staleTime: 60 * 1000, // 1 minute cache
  });

export const useSubmitBid = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: submitBid,
    onSuccess: (data, { auctionId }) => {
      queryClient.invalidateQueries(["auctions", auctionId]);
      toast({
        variant: "success",
        title: "Bid Submitted",
        description: data.message,
      });
    },
    onError: (error) => {
      toast({
        variant: "error",
        title: "Bid Failed",
        description: error.message,
      });
    },
  });
};

export const useUpdateBid = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: updateBid,
    onSuccess: (data, { bidId }) => {
      queryClient.invalidateQueries(["auctions", bidId]);
      toast({
        variant: "success",
        title: "Bid Updated",
        description: data.message,
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

// Non Auction Repairs endpoints
export const useNonAuctionRepairs = (filters) =>
  useQuery({
    queryKey: ["non-auctions", filters],
    queryFn: () => getNonAuctionRepairs(filters),
  });

export const useNonAuctionRepairDetails = (repairId) =>
  useQuery({
    queryKey: ["non-auctions", repairId],
    queryFn: () => getNonAuctionRepairDetails(repairId),
    enabled: !!repairId,
  });

export const useSubmitOffer = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: submitOffer,
    onSuccess: (data, { repairId }) => {
      queryClient.invalidateQueries(["non-auctions", repairId]);
      queryClient.invalidateQueries(["non-auctions"]);

      toast({
        variant: "success",
        title: "Offer Submitted",
        description: data.message,
      });
    },
    onError: (error) => {
      toast({
        variant: "error",
        title: "Submission Failed",
        description: error.message,
      });
    },
  });
};

export const useUpdateOffer = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: updateOffer,
    onSuccess: (data, { offerId, repairId }) => {
      queryClient.invalidateQueries(["non-auctions", repairId]);
      queryClient.invalidateQueries(["offers", offerId]);

      toast({
        variant: "success",
        title: "Offer Updated",
        description: data.message,
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
