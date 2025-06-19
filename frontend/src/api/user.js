import axiosClient from "./client";

// Get logged-in user's profile
export const getMyProfile = async () => {
  try {
    const { data } = await axiosClient.get("/users/me");
    return data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch profile."
    );
  }
};

// Update logged-in user's profile
export const updateMyProfile = async (payload) => {
  try {
    const { data } = await axiosClient.patch("/users/me", payload);
    return data.message;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to update profile."
    );
  }
};
