import axiosClient from "./client";

export const login = async (credentials) => {
  try {
    const { data } = await axiosClient.post("/auth/login", credentials);
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Login failed");
  }
};

export const logout = async () => {
  // Always clear client-side token
  localStorage.removeItem("accessToken");
  // Call your backend logout endpoint if exists
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
