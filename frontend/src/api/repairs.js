import axiosClient from "./client";

// Customer endpoints
export const createRepair = async (repairData) => {
  try {
    const { data } = await axiosClient.post("/repairs", {
      ...repairData,
      auctionDetails: repairData.auctionDetails,
    });
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Repair creation failed");
  }
};

export const startRepairAuction = async ({ repairId, auctionData }) => {
  try {
    const { data } = await axiosClient.post(`/repairs/${repairId}/auction`, {
      ...auctionData,
    });
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Auction start failed");
  }
};

export const updateRepairRequest = async ({ repairId, updateData }) => {
  try {
    const { data } = await axiosClient.put(`/repairs/${repairId}`, updateData);
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Update failed");
  }
};

export const getRepairRequests = async (params = {}) => {
  try {
    const { data } = await axiosClient.get("/repairs", { params });
    return data.data;
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
    const { data } = await axiosClient.get("/repairs/history", {
      params,
    });
    return data.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || "Failed to fetch repair history"
    );
  }
};

export const acceptBid = async (repairId, bidId) => {
  try {
    const { data } = await axiosClient.put(`/repairs/${repairId}/accept-bid`, {
      bidId,
    });
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Bid acceptance failed");
  }
};

export const acceptOffer = async (repairId, offerId) => {
  try {
    const { data } = await axiosClient.put(
      `/repairs/${repairId}/accept-offer`,
      { offerId }
    );
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Offer acceptance failed");
  }
};

// Worker endpoints
export const getWorkerRepairs = async (status) => {
  try {
    const { data } = await axiosClient.get("/repairs/workers", {
      params: { status },
    });
    return data.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || "Failed to fetch worker repairs"
    );
  }
};

export const completeRepair = async (repairId) => {
  try {
    const { data } = await axiosClient.patch(`/repairs/${repairId}/complete`);
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Failed to complete repair");
  }
};

export const updateTrackingStatus = async (repairId, statusData) => {
  try {
    const { data } = await axiosClient.put(
      `/repairs/workshop/${repairId}`,
      statusData
    );
    return data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || "Failed to update tracking status"
    );
  }
};

export const returnRepair = async (repairId, reason) => {
  try {
    const { data } = await axiosClient.patch(`/repairs/${repairId}/return`, {
      reason,
    });
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Failed to initiate return");
  }
};

export const getWorkerHistory = async (params = {}) => {
  try {
    const { data } = await axiosClient.get("/repairs/workers/history", {
      params,
    });
    return data.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || "Failed to fetch worker history"
    );
  }
};

// Auction endpoints
export const getOpenAuctions = async (filters = {}) => {
  try {
    const { data } = await axiosClient.get("/repairs/auctions", {
      params: filters,
    });
    return data.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Failed to fetch auctions");
  }
};

export const getAuctionDetails = async (auctionId) => {
  try {
    const { data } = await axiosClient.get(`/repairs/auctions/${auctionId}`);
    return data.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || "Failed to fetch auction details"
    );
  }
};

export const submitBid = async ({ auctionId, bidPrice }) => {
  try {
    const { data } = await axiosClient.post(
      `/repairs/auctions/${auctionId}/bids`,
      { bidPrice }
    );
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Bid submission failed");
  }
};

export const updateBid = async ({ bidId, bidPrice }) => {
  try {
    const { data } = await axiosClient.put(`/repairs/bids/${bidId}`, {
      bidPrice,
    });
    return data;
  } catch (error) {
    console.log(error);
    throw new Error(error.response?.data?.error || "Bid update failed");
  }
};

// Non Auction Repairs endpoints
export const getNonAuctionRepairs = async (filters = {}) => {
  try {
    const { data } = await axiosClient.get("/repairs/non-auctions", {
      params: filters,
    });
    return data.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || "Failed to fetch direct offers"
    );
  }
};

export const getNonAuctionRepairDetails = async (repairId) => {
  try {
    const { data } = await axiosClient.get(`/repairs/non-auctions/${repairId}`);
    return data.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || "Failed to fetch repair details"
    );
  }
};

export const submitOffer = async (repairId, offerData) => {
  try {
    const { data } = await axiosClient.post(
      `/repairs/non-auctions/${repairId}/offers`,
      offerData
    );
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Offer submission failed");
  }
};

export const updateOffer = async (offerId, offerData) => {
  try {
    const { data } = await axiosClient.put(
      `/repairs/offers/${offerId}`,
      offerData
    );
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Offer update failed");
  }
};
