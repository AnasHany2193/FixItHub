import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "./useToast";
import { getMyProfile, updateMyProfile } from "@/api/user";

// Fetch my profile
export const useMyProfile = () =>
  useQuery({
    queryKey: ["me"],
    queryFn: getMyProfile,
    staleTime: 5 * 60 * 1000,
  });

// Update my profile
export const useUpdateMyProfile = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: updateMyProfile,
    onSuccess: (message) => {
      toast({
        variant: "success",
        title: "Profile Updated",
        description: message,
      });
      queryClient.invalidateQueries(["me"]);
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
