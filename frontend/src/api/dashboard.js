import axiosClient from "./client";

// Dashboard Summary
export const getDashboardSummary = async () => {
  try {
    const { data } = await axiosClient.get("/dashboard/summary");
    return data.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to load dashboard summary"
    );
  }
};

// User Profile
export const getProfile = async () => {
  try {
    const { data } = await axiosClient.get("/dashboard/profile");
    return data.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch user profile"
    );
  }
};

export const updateProfile = async (profileData) => {
  try {
    const { data } = await axiosClient.patch("/dashboard/profile", profileData);
    return data.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to update profile"
    );
  }
};
