import axiosClient from "./client";

export const createProduct = async (productData) => {
  try {
    const { data } = await axiosClient.post("/marketplace/worker/products", {
      ...productData,
      imageUrls: productData.imageUrls,
    });
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Product creation failed");
  }
};

export const updateProduct = async ({ productId, updateData }) => {
  try {
    const { data } = await axiosClient.put(
      `/marketplace/worker/products/${productId}`,
      updateData
    );
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Product update failed");
  }
};

export const getProducts = async (params = {}) => {
  try {
    const { data } = await axiosClient.get("/marketplace/products", { params });
    return data.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch products"
    );
  }
};

export const getProductDetails = async (productId) => {
  try {
    const { data } = await axiosClient.get(
      `/marketplace/products/${productId}`
    );
    return data.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch product details"
    );
  }
};

export const getMyProducts = async (filters = {}) => {
  try {
    const { data } = await axiosClient.get("/marketplace/worker/products", {
      params: filters,
    });
    return data.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch your products"
    );
  }
};

export const deleteProduct = async (productId) => {
  try {
    const { data } = await axiosClient.delete(
      `/marketplace/worker/products/${productId}`
    );
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Product deletion failed");
  }
};
