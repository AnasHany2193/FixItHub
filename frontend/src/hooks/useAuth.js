import { getCurrentUser, login, logout } from "@/api/auth";
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
      // Fix data structure access
      localStorage.setItem("accessToken", data.accessToken);
      queryClient.invalidateQueries(["currentUser"]);
    },
    onError: (error) => {
      console.error("Login error:", error.message);
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.removeQueries(["currentUser"]);
      queryClient.clear();
    },
    onError: (error) => {
      console.error("Logout error:", error.message);
    },
  });
};
