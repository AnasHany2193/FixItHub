import axiosClient from "./client";

export const register = async (credentials) => {
  try {
    const { data } = await axiosClient.post("/auth/register", credentials);
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Registration failed");
  }
};

export const login = async (credentials) => {
  try {
    const { data } = await axiosClient.post("/auth/login", credentials);
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Login failed");
  }
};

export const logout = async () => {
  await axiosClient.post("/auth/logout");
};

export const getCurrentUser = async () => {
  try {
    const { data } = await axiosClient.get("/users/me");
    return data;
  } catch {
    return null;
  }
};

export const verifyOTP = async ({ email, code }) => {
  try {
    const { data } = await axiosClient.post("/auth/verify-otp", {
      email,
      code,
    });
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "OTP verification failed");
  }
};

export const resendOTP = async (email) => {
  try {
    console.log("resendOTP", email);
    const { data } = await axiosClient.post("/auth/resend-otp", email);
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to resend OTP");
  }
};

export const forgotPassword = async (email) => {
  try {
    const { data } = await axiosClient.post("/auth/forgot-password", email);
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Password reset failed");
  }
};

export const resetPassword = async ({ email, code, newPassword }) => {
  try {
    const { data } = await axiosClient.post("/auth/reset-password", {
      email,
      code,
      newPassword,
    });
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Password reset failed");
  }
};
