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

// Repair History
export const getRepairHistory = async (page = 1, limit = 10) => {
  try {
    const { data } = await axiosClient.get("/dashboard/repairs/history", {
      params: { page, limit },
    });
    return data.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch repair history"
    );
  }
};

// Active Repairs
export const getActiveRepairs = async () => {
  try {
    const { data } = await axiosClient.get("/dashboard/repairs/active");
    return data.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch active repairs"
    );
  }
};

// Marketplace Activity
export const getMarketplaceActivity = async (page = 1, limit = 5) => {
  try {
    const { data } = await axiosClient.get("/dashboard/marketplace/activity", {
      params: { page, limit },
    });
    return data.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch marketplace activity"
    );
  }
};

// Favorite Products
export const getFavoriteProducts = async () => {
  try {
    const { data } = await axiosClient.get("/dashboard/marketplace/favorites");
    return data.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch favorite products"
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
