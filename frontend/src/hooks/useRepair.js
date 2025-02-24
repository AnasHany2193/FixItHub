import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useToast } from "./useToast";

import { createRepair } from "@/api/repairs";

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
      navigate("/dashboard");
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
