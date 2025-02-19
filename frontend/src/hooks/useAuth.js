import { getCurrentUser, login } from "@/api/auth";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useUser = () => {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
    retry: false,
  });
};

export const useLogin = () => {
  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      localStorage.setItem("accessToken", data.data.accessToken);
    },
  });
};
