import axiosClient from "./axiosClient";

// Register a user (customer or worker)
export const registerUser = async (data) => {
  // data should be { username, email, password, role, ... }
  const response = await axiosClient.post("/auth/register", data);
  return response.data;
};

// Upload an image/document
export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append("image", file);
  const response = await axiosClient.post("/document/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// OTP Verification
export const verifyOtp = async (data) => {
  // data should be { email, code }
  const response = await axiosClient.post("/auth/verify-otp", data);
  return response.data;
};

// Login function
export const loginUser = async (data) => {
  // data should be { email, password }
  const response = await axiosClient.post("/auth/login", data);
  return response.data;
};
