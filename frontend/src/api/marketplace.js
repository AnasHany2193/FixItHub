import axiosClient from "./client";

// Customer
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

// Favorite
export const addToFavorites = async (productId) => {
  try {
    const { data } = await axiosClient.post("/marketplace/favorites", {
      productId,
    });
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to add favorite");
  }
};

export const removeFromFavorites = async (productId) => {
  try {
    const { data } = await axiosClient.delete(
      `/marketplace/favorites/${productId}`
    );
    return data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to remove favorite"
    );
  }
};

export const getFavorites = async () => {
  try {
    const { data } = await axiosClient.get("/marketplace/favorites");
    return data.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch favorites"
    );
  }
};

// Cart
export const getCart = async () => {
  try {
    const { data } = await axiosClient.get("/marketplace/cart");
    return data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch cart");
  }
};

export const addItemToCart = async (productId) => {
  try {
    const { data } = await axiosClient.post("/marketplace/cart", { productId });
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to add to cart");
  }
};

export const updateCartItemQty = async (productId, action) => {
  try {
    const { data } = await axiosClient.put(`/marketplace/cart/${productId}`, {
      action,
    });
    return data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to update quantity"
    );
  }
};

export const removeCartItem = async (productId) => {
  try {
    const { data } = await axiosClient.delete(`/marketplace/cart/${productId}`);
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to remove item");
  }
};

export const clearCart = async () => {
  try {
    const { data } = await axiosClient.delete("/marketplace/cart");
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to clear cart");
  }
};

// Payment
export const createPaymentSession = async (orderId) => {
  try {
    const { data } = await axiosClient.post(
      "/marketplace/payment/create-checkout-session",
      orderId ? { orderId } : {}
    );
    return data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Payment session creation failed"
    );
  }
};

// Orders
export const getCustomerOrders = async (filters = {}) => {
  try {
    const { data } = await axiosClient.get("/marketplace/orders", {
      params: filters,
    });
    return data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch orders");
  }
};

export const getOrderDetails = async (orderId) => {
  try {
    const { data } = await axiosClient.get(`/marketplace/orders/${orderId}`);
    return data.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch order details"
    );
  }
};

// Review
export const addProductReview = async (productId, reviewData) => {
  try {
    const { data } = await axiosClient.post(
      `/marketplace/products/${productId}/reviews`,
      reviewData
    );
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to submit review");
  }
};

export const updateProductReview = async (reviewId, updateData) => {
  try {
    const { data } = await axiosClient.put(
      `/marketplace/reviews/${reviewId}`,
      updateData
    );
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to update review");
  }
};

export const deleteProductReview = async (reviewId) => {
  try {
    const { data } = await axiosClient.delete(
      `/marketplace/reviews/${reviewId}`
    );
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to delete review");
  }
};

export const getProductReviews = async (productId, page = 1, limit = 5) => {
  try {
    const { data } = await axiosClient.get(
      `/marketplace/products/${productId}/reviews`,
      {
        params: { page, limit },
      }
    );
    return data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch reviews");
  }
};

// Worker
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
