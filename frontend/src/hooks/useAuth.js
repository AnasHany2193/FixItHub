import { useToast } from "./useToast";
import { uploadImage } from "@/api/upload";
import {
  forgotPassword,
  getCurrentUser,
  login,
  logout,
  register,
  resendOTP,
  resetPassword,
  verifyOTP,
} from "@/api/auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

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
      // Clear all application data
      queryClient.clear();
      localStorage.clear();

      toast({
        variant: "success",
        title: "Logged Out",
        description: "You've been successfully logged out",
      });

      // Force DOM cleanup for sensitive data
      window.location.href = "/login";
    },
    onError: (error) => {
      // Nuclear cleanup on error
      queryClient.clear();
      localStorage.clear();

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
  const navigate = useNavigate();

  return useMutation({
    mutationFn: register,
    onSuccess: (data) => {
      toast({
        variant: "success",
        title: "Account Created",
        description:
          data.message || "Please check your email to verify your account",
      });

      navigate("/verify-email");
    },
    onError: (error) => {
      toast({
        variant: "error",
        title: "Registration Failed",
        description: error.response?.data?.message || error.message,
      });
    },
  });
};

export const useUpload = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: uploadImage,
    onSuccess: (data) => {
      toast({
        variant: "success",
        title: "Upload Successful",
        description:
          data.message || "Your image has been uploaded successfully",
      });
    },
    onError: (error) => {
      toast({
        variant: "error",
        title: "Upload Failed",
        description: error.message,
      });
    },
  });
};

export const useVerifyOTP = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: verifyOTP,
    onSuccess: (data) => {
      toast({
        variant: "success",
        title: "Email Verified!",
        description:
          data.message || "Your email has been successfully verified",
      });

      navigate("/login");
    },
    onError: (error) => {
      toast({
        variant: "error",
        title: "Verification Failed",
        description: error.message,
      });
    },
  });
};

export const useResendOTP = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: resendOTP,
    onSuccess: (data) => {
      toast({
        variant: "success",
        title: "OTP Resent!",
        description: data.message || "New OTP sent to your email",
      });

      navigate("/verify-email");
    },
    onError: (error) => {
      toast({
        variant: "error",
        title: "Resend Failed",
        description: error.message,
      });
    },
  });
};

export const useForgotPassword = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: forgotPassword,
    onSuccess: (data) => {
      toast({
        variant: "success",
        title: "OTP Sent",
        description: data.message || "Check your email for the reset OTP",
      });
      navigate("/reset-password");
    },
    onError: (error) => {
      toast({
        variant: "error",
        title: "Password Reset Failed",
        description: error.message,
      });
    },
  });
};

export const useResetPassword = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: resetPassword,
    onSuccess: (data) => {
      toast({
        variant: "success",
        title: "Password Updated",
        description: data.message || "Login with your new password",
      });
      navigate("/login");
    },
    onError: (error) => {
      toast({
        variant: "error",
        title: "Reset Failed",
        description: error.message,
      });
    },
  });
};
