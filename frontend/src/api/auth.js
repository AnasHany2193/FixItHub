import apiClient from "./client";

export const login = async (credentials) => {
  return apiClient.post("/auth/login", credentials);
};

export const getCurrentUser = async () => {
  try {
    const { data } = await apiClient.get("/users/me");
    return data;
  } catch (error) {
    console.log("error", error);
    return null;
  }
};
