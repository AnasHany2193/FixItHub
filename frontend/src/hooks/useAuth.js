import { getCurrentUser, login, logout, register } from "@/api/auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "./useToast";

export const useUser = () => {
  const { toast } = useToast();

  return useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
    staleTime: 1000 * 60 * 15, // 🏆 15 minutes cache
    cacheTime: 1000 * 60 * 30, // ✅ Keeps cache for 30 mins
    refetchOnMount: false, // 🚀 Prevents re-fetch on component mount
    refetchOnWindowFocus: false, // 🚀 Stops auto-fetch on tab switch
    refetchOnReconnect: false, // ❌ Prevents fetching on network reconnect
    retry: (failureCount, error) => {
      if (error?.response?.status === 401) return false;
      return failureCount < 2;
    },
    onError: (error) => {
      if (error?.response?.status === 401) {
        toast({
          variant: "error",
          title: "Session Expired",
          description: "Please log in again",
        });
      }
    },
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      console.log("Login data", data);

      // ✅ Set cached user data
      queryClient.setQueryData(["currentUser"], data.user);

      // 🚀 Force refetch immediately
      queryClient.invalidateQueries(["currentUser"], { exact: true });

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
      // 🏆 Fully reset React Query cache (including persisted data)
      queryClient.clear();

      // 🗑️ Clear React Query persisted storage (localStorage)
      localStorage.removeItem("REACT_QUERY_OFFLINE_CACHE");
      toast({
        variant: "success",
        title: "Logged Out",
        description: "You've been successfully logged out",
      });
      window.location.href = "/";
    },
    onError: (error) => {
      // Even if logout fails, force cache reset
      queryClient.clear();
      localStorage.removeItem("REACT_QUERY_OFFLINE_CACHE");

      toast({
        variant: "error",
        title: "Logout Failed",
        description: error.message,
      });
      window.location.href = "/login";
    },
  });
};

export const useRegister = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: register,
    onSuccess: (data) => {
      toast({
        variant: "success",
        title: "Account Created",
        description:
          data.message || "Please check your email to verify your account",
      });

      // Redirect to OTP verification page "Later"
      // window.location.href = `/verify-email?email=${encodeURIComponent(
      //   data.email || ""
      // )}`;
    },
    onError: (error) => {
      toast({
        variant: "error",
        title: "Registration Failed",
        description: error.response?.data?.error || error.message,
      });
    },
  });
};
