import { getCurrentUser, login, logout } from "@/api/auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "./useToast";

export const useUser = () => {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
    staleTime: 1000 * 60 * 15, // 15 minutes matches access token expiry
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      queryClient.setQueryData(["currentUser"], data.user);
      toast({
        variant: "success",
        title: "Login Successful",
        description: data.message || "Welcome back!",
      });
    },
    onError: (error) => {
      toast({
        variant: "error",
        title: "Login Failed",
        description: error.message,
      });
    },
  });
};

export const useLogout = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      // Force full page reload to clear all state
      queryClient.removeQueries(["currentUser"]);
      toast({
        variant: "success",
        title: "Logged Out",
        description: "You've been successfully logged out",
      });
      window.location.href = "/";
    },
    onError: (error) => {
      // Even if logout fails, force state clearance
      queryClient.removeQueries(["currentUser"]);
      localStorage.removeItem("accessToken");
      toast({
        variant: "error",
        title: "Logout Failed",
        description: error.message,
      });
      window.location.href = "/login";
    },
  });
};
