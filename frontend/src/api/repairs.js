import axiosClient from "./client";

export const createRepair = async (repairData) => {
  try {
    const { data } = await axiosClient.post("/repairs", repairData);
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Repair creation failed");
  }
};

export const getRepairRequests = async (params = {}) => {
  try {
    const { data } = await axiosClient.get("/repairs", { params });
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Failed to fetch repairs");
  }
};

export const getRepairDetails = async (repairId) => {
  try {
    const { data } = await axiosClient.get(`/repairs/${repairId}`);
    return data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || "Failed to fetch repair details"
    );
  }
};

export const updateRepairStatus = async ({ repairId, status }) => {
  try {
    const { data } = await axiosClient.patch(`/repairs/${repairId}/status`, {
      status,
    });
    return data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || "Failed to update repair status"
    );
  }
};

export const cancelRepair = async (repairId) => {
  try {
    const { data } = await axiosClient.patch(`/repairs/${repairId}/cancel`);
    return data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || "Failed to cancel repair request"
    );
  }
};
