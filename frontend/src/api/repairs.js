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
    throw new Error(error.response?.data?.message || "Repair creation failed");
  }
};

export const startRepairAuction = async ({ repairId, auctionData }) => {
  try {
    const { data } = await axiosClient.post(`/repairs/${repairId}/auction`, {
      ...auctionData,
    });
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Auction start failed");
  }
};

export const updateRepairRequest = async ({ repairId, updateData }) => {
  try {
    const { data } = await axiosClient.put(`/repairs/${repairId}`, updateData);
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Update failed");
  }
};

export const getRepairRequests = async (params = {}) => {
  try {
    const { data } = await axiosClient.get("/repairs", { params });
    return data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch repairs");
  }
};

export const getRepairDetails = async (repairId) => {
  try {
    const { data } = await axiosClient.get(`/repairs/${repairId}`);
    return data.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch repair details"
    );
  }
};

export const cancelRepair = async (repairId) => {
  try {
    const { data } = await axiosClient.patch(`/repairs/${repairId}/cancel`);
    return data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to cancel repair request"
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
      error.response?.data?.message || "Failed to fetch repair history"
    );
  }
};

export const acceptBid = async ({ repairId, bidId }) => {
  try {
    console.log({ repairId, bidId });
    const { data } = await axiosClient.put(`/repairs/${repairId}/accept-bid`, {
      bidId,
    });
    return data;
  } catch (error) {
    console.log(error);
    throw new Error(error.response?.data?.message || "Bid acceptance failed");
  }
};

export const acceptOffer = async ({ repairId, offerId }) => {
  try {
    const { data } = await axiosClient.put(
      `/repairs/${repairId}/accept-offer`,
      {
        offerId,
      }
    );
    return data;
  } catch (error) {
    console.log(error);
    throw new Error(error.response?.data?.message || "Offer acceptance failed");
  }
};

export const createPaymentSession = async ({ repairId }) => {
  try {
    const { data } = await axiosClient.post(
      "/repairs/payment/create-checkout-session",
      {
        repairId,
      }
    );
    console.log("createPaymentSession", data);
    return data;
  } catch (error) {
    console.log("createPaymentSession error", error);
    throw new Error(error.response?.data?.message || "Payment failed");
  }
};

// Worker endpoints
export const getWorkerRepairs = async ({ status }) => {
  try {
    const { data } = await axiosClient.get("/repairs/workers", {
      params: { status },
    });
    return data.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch worker repairs"
    );
  }
};

export const getWorkerRepair = async ({ repairId }) => {
  try {
    const { data } = await axiosClient.get(
      `/repairs/workers/active/${repairId}`
    );
    return data.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch repair details"
    );
  }
};

export const completeRepair = async ({ repairId }) => {
  try {
    const { data } = await axiosClient.patch(`/repairs/complete/${repairId}`);
    return data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to complete repair"
    );
  }
};

export const updateTrackingStatus = async ({ repairId, status }) => {
  try {
    const { data } = await axiosClient.put(`/repairs/tracking/${repairId}`, {
      status,
    });
    return data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to update tracking status"
    );
  }
};

export const returnRepair = async ({ repairId }) => {
  try {
    const { data } = await axiosClient.patch(`/repairs/return/${repairId}`);
    return data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to initiate return"
    );
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
      error.response?.data?.message || "Failed to fetch worker history"
    );
  }
};

// Auction & Non-Auction endpoints
export const getRepairList = async (type, filters) => {
  try {
    const { data } = await axiosClient.get(`/repairs/${type}`, {
      params: filters,
    });
    return data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch repairs");
  }
};

// Auction endpoints
export const getAuctionDetails = async (auctionId) => {
  try {
    const { data } = await axiosClient.get(`/repairs/auctions/${auctionId}`);
    return data.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch auction details"
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
    throw new Error(error.response?.data?.message || "Bid update failed");
  }
};

// Direct Offer Repairs endpoints
export const getDirectOffersRepairDetails = async (repairId) => {
  try {
    const { data } = await axiosClient.get(
      `/repairs/direct-offers/${repairId}`
    );
    return data.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch repair details"
    );
  }
};

export const submitOffer = async ({ repairId, offerPrice }) => {
  try {
    console.log({ repairId, offerPrice });
    const { data } = await axiosClient.post(
      `/repairs/direct-offers/${repairId}/offers`,
      { offerPrice }
    );
    return data;
  } catch (error) {
    console.log("error", error);
    throw new Error(error.response?.data?.message || "Offer submission failed");
  }
};

export const updateOffer = async ({ offerId, offerPrice }) => {
  try {
    const { data } = await axiosClient.put(`/repairs/offers/${offerId}`, {
      offerPrice,
    });
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Offer update failed");
  }
};
