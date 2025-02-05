// src/hooks/useAuthMutations.js
import { useMutation } from "@tanstack/react-query";
import { registerUser, uploadImage } from "../api/auth";
import { useNavigate } from "react-router";

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
