// src/hooks/useAuthMutations.js
import { useMutation } from "@tanstack/react-query";
import { registerUser, uploadImage } from "../api/auth";

export const useRegisterMutation = () => {
  return useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      console.log("Registration successful", data);
    },
    onError: (error) => {
      console.error("Registration error:", error);
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
