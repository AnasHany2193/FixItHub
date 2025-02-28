import axiosClient from "./client";

export const createRepair = async (repairData) => {
  try {
    // Separate auction data from base repair
    const { startingMaxPrice, expiresAt, ...baseRepair } = repairData;
    const payload = {
      ...baseRepair,
      createAuction: !!startingMaxPrice && !!expiresAt,
      ...(startingMaxPrice && { startingMaxPrice }),
      ...(expiresAt && { expiresAt }),
    };

    const { data } = await axiosClient.post("/repairs", payload);
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Repair creation failed");
  }
};

export const startRepairAuction = async ({ repairId, auctionData }) => {
  try {
    const { data } = await axiosClient.post(
      `/repairs/${repairId}/auction`,
      auctionData
    );
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Failed to start auction");
  }
};

export const updateRepairRequest = async (repairId, updateData) => {
  try {
    const { data } = await axiosClient.put(`/repairs/${repairId}`, updateData);
    return data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || "Failed to update repair request"
    );
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
    return data.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || "Failed to fetch repair details"
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

export const getCustomerHistory = async (params = {}) => {
  try {
    const { data } = await axiosClient.get("/repairs/customer/history", {
      params,
    });
    return data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || "Failed to fetch repair history"
    );
  }
};
