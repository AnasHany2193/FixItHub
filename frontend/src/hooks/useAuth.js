import { getCurrentUser, login } from "@/api/auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useUser = () => {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
    enabled: !!localStorage.getItem("accessToken"), // Add this line
    retry: (failureCount, error) => {
      if (error?.response?.status === 401) return false;
      return failureCount < 2;
    },
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      localStorage.setItem("accessToken", data.data.accessToken);
      queryClient.invalidateQueries(["currentUser"]); // Add this
    },
  });
};
