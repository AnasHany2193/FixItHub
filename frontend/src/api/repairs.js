import apiClient from "./client";

export const createRepair = async (repairData) => {
  return apiClient.post("/repairs", repairData);
};

export const getRepairs = async () => {
  return apiClient.get("/repairs");
};
