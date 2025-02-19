import apiClient from "./client";

export const login = async (credentials) => {
  return apiClient.post("/auth/login", credentials);
};

export const getCurrentUser = async () => {
  return apiClient.get("/users/me");
};
