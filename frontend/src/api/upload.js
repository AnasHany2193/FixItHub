import axiosClient from "./client";

export const uploadImage = async (formData) => {
  try {
    const { data } = await axiosClient.post("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Image upload failed");
  }
};
