import axiosClient from "./client";

export const createRepair = async (repairData) => {
  try {
    const { data } = await axiosClient.post("/repairs", repairData);
    return data;
  } catch (error) {
    console.log("createRepair error", error);
  }
};

export const getRepairs = async () => {
  return axiosClient.get("/repairs");
};
