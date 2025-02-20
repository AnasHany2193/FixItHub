import apiClient from "./client";

export const login = async (credentials) => {
  try {
    const { data } = await apiClient.post("/auth/login", credentials);
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Login failed");
  }
};

export const logout = async () => {
  try {
    // Call your backend logout endpoint if exists
    await apiClient.post("/auth/logout");
  } finally {
    // Always clear client-side token
    localStorage.removeItem("accessToken");
  }
};

export const getCurrentUser = async () => {
  try {
    const { data } = await apiClient.get("/users/me");
    console.log("data", data);
    return data;
  } catch {
    return null;
  }
};
