import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  forgotPassword,
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
  resendOtp,
  resetPassword,
  uploadImage,
  verifyOtp,
} from "../api/auth";
import { useNavigate } from "react-router-dom";
import { useCustomToast } from "./useCustomToast";
import { useUser } from "@/contexts/UserContext";
import axiosClient from "@/api/axiosClient";

export const useRegisterMutation = () => {
  const navigate = useNavigate();
  const { showToast } = useCustomToast();

  return useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      showToast("success", data.message);
      navigate("/verify-email");
    },
    onError: (error) => {
      showToast("error", error.message);
    },
  });
};

export const useUploadMutation = () => {
  const { showToast } = useCustomToast();

  return useMutation({
    mutationFn: uploadImage,
    onError: (error) => {
      showToast("error", error.message);
    },
  });
};

export const useVerifyOtpMutation = () => {
  const navigate = useNavigate();
  const { showToast } = useCustomToast();

  return useMutation({
    mutationFn: verifyOtp,
    onSuccess: (data) => {
      // Optionally, redirect the user to the login page or show a success message
      showToast("success", data.message);
      navigate("/login");
    },
    onError: (error) => {
      showToast("error", error.message);
    },
  });
};

export const useLoginMutation = () => {
  const navigate = useNavigate();

  const { updateUser } = useUser();
  const { showToast } = useCustomToast();

  return useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      showToast("success", data.message);

      // Store the access token in localStorage (or in your global state)
      localStorage.setItem("accessToken", data.accessToken);

      // Optionally, you can update your user context with the returned user data
      updateUser(data.user);

      // Redirect the user to the home page
      navigate("/");
    },
    onError: (error) => {
      showToast("error", error.message);
    },
  });
};

export const useLogoutMutation = () => {
  const navigate = useNavigate();
  const { logout } = useUser(); // or use logout() if defined in your context
  const { showToast } = useCustomToast();
  const queryClient = useQueryClient(); // get the query client

  return useMutation({
    mutationFn: logoutUser,
    onSuccess: (data) => {
      // Clear user data from context and localStorage
      logout();
      localStorage.removeItem("accessToken");

      delete axiosClient.defaults.headers.common["Authorization"];

      // Cancel or clear any pending queries (like currentUser)
      queryClient.cancelQueries(["currentUser"]);
      queryClient.clear(); // or use invalidateQueries if you prefer

      showToast("success", data.message);

      // Redirect to the login page
      navigate("/");
    },
    onError: (error) => {
      showToast("error", error.message);
    },
  });
};

// Forgot Password Mutation
export const useForgotPasswordMutation = () => {
  const navigate = useNavigate();
  const { showToast } = useCustomToast();

  return useMutation({
    mutationFn: forgotPassword,
    onSuccess: (data) => {
      // Optionally notify the user that an OTP has been sent
      showToast("success", data.message);

      navigate("/reset-password");
    },
    onError: (error) => {
      showToast("error", error.message);
    },
  });
};

// Reset Password Mutation
export const useResetPasswordMutation = () => {
  const navigate = useNavigate();
  const { showToast } = useCustomToast();

  return useMutation({
    mutationFn: resetPassword,
    onSuccess: (data) => {
      // Optionally redirect to login page after success
      showToast("success", data.message);
      navigate("/login");
    },
    onError: (error) => {
      showToast("error", error.message);
    },
  });
};

export const useResendOtpMutation = () => {
  const navigate = useNavigate();
  const { showToast } = useCustomToast();

  return useMutation({
    mutationFn: resendOtp,
    onSuccess: (data) => {
      // Optionally, show a success toast or message here.
      showToast("success", data.message);
      navigate("/verify-email");
    },
    onError: (error) => {
      // Optionally, show an error toast or message here.
      showToast("error", error.message);
    },
  });
};

// Hook to fetch current user data
export const useCurrentUserQuery = () => {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    onError: (error) => {
      console.error("Error fetching current user:", error.message);
    },
  });
};
