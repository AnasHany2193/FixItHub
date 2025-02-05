import { useMutation } from "@tanstack/react-query";
import { loginUser, registerUser, uploadImage, verifyOtp } from "../api/auth";
import { useNavigate } from "react-router-dom";

export const useRegisterMutation = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      console.log("Registration successful", data);
      navigate("/login");
    },
    onError: (error) => {
      console.error("Registration error:", error.message);
    },
  });
};

export const useUploadMutation = () => {
  return useMutation({
    mutationFn: uploadImage,
    onSuccess: (data) => {
      console.log("Upload successful", data);
    },
    onError: (error) => {
      console.error("Upload error:", error);
    },
  });
};

export const useVerifyOtpMutation = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: verifyOtp,
    onSuccess: (data) => {
      console.log("OTP verification successful", data);
      // Optionally, redirect the user to the login page or show a success message
      // For example:
      navigate("/login");
    },
    onError: (error) => {
      console.error("OTP verification error:", error.message);
    },
  });
};

export const useLoginMutation = () => {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      console.log("Login successful", data);

      // Store the access token in localStorage (or in your global state)
      localStorage.setItem("accessToken", data.accessToken);
      // Optionally, you can update your user context with the returned user data
      // Redirect the user to the home page
      navigate("/dashboard");
    },
    onError: (error) => {
      console.error("Login error:", error.message);
    },
  });
};
