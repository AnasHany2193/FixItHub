import { useToast } from "./useToast";
import { useNavigate } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addItemToCart,
  addToFavorites,
  clearCart,
  createPaymentSession,
  createProduct,
  deleteProduct,
  getCart,
  getFavorites,
  getMyProducts,
  getProductDetails,
  getProducts,
  removeCartItem,
  removeFromFavorites,
  updateCartItemQty,
  updateProduct,
} from "@/api/marketplace";

// Customer
export const useProducts = (filters) =>
  useQuery({
    queryKey: ["marketplace", "products", filters],
    queryFn: () => getProducts(filters),
    staleTime: 5 * 60 * 1000,
  });

export const useProductDetails = (productId) =>
  useQuery({
    queryKey: ["marketplace", "products", productId],
    queryFn: () => getProductDetails(productId),
    enabled: !!productId,
  });

// Favorite
export const useAddToFavorites = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: addToFavorites,
    onSuccess: (data) => {
      queryClient.invalidateQueries(["favorites"]);
      toast({
        variant: "success",
        title: "Success",
        description: data.message,
      });
    },
    onError: (error) => {
      toast({
        variant: "error",
        title: "Error",
        description: error.message,
      });
    },
  });
};

export const useRemoveFromFavorites = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: removeFromFavorites,
    onSuccess: (data) => {
      queryClient.invalidateQueries(["favorites"]);
      toast({
        variant: "success",
        title: "Success",
        description: data.message,
      });
    },
    onError: (error) => {
      toast({
        variant: "error",
        title: "Error",
        description: error.message,
      });
    },
  });
};

export const useFavorites = () => {
  return useQuery({
    queryKey: ["favorites"],
    queryFn: getFavorites,
  });
};

// Cart
export const useGetCart = () => {
  return useQuery({
    queryKey: ["cart"],
    queryFn: getCart,
  });
};

export const useAddToCart = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: addItemToCart,
    onSuccess: (data) => {
      queryClient.invalidateQueries(["cart"]);
      toast({
        variant: "success",
        title: "Success",
        description: data.message,
      });
    },
    onError: (error) => {
      toast({
        variant: "error",
        title: "Error",
        description: error.message,
      });
    },
  });
};

export const useUpdateCartItem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ productId, action }) => updateCartItemQty(productId, action),
    onSuccess: (data) => {
      queryClient.invalidateQueries(["cart"]);
      toast({
        variant: "success",
        title: "Success",
        description: data.message,
      });
    },
    onError: (error) => {
      toast({
        variant: "error",
        title: "Error",
        description: error.message,
      });
    },
  });
};

export const useRemoveCartItem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: removeCartItem,
    onSuccess: (data) => {
      queryClient.invalidateQueries(["cart"]);
      toast({
        variant: "success",
        title: "Success",
        description: data.message,
      });
    },
    onError: (error) => {
      toast({
        variant: "error",
        title: "Error",
        description: error.message,
      });
    },
  });
};

export const useClearCart = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: clearCart,
    onSuccess: (data) => {
      queryClient.invalidateQueries(["cart"]);
      toast({
        variant: "success",
        title: "Success",
        description: data.message,
      });
    },
    onError: (error) => {
      toast({
        variant: "error",
        title: "Error",
        description: error.message,
      });
    },
  });
};

// Payment
export const useCreatePaymentSession = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: createPaymentSession,
    onSuccess: (data) => {
      queryClient.invalidateQueries(["cart"]);
      queryClient.invalidateQueries(["orders"]);
      toast({
        variant: "success",
        title: "Success",
        description: data.message,
      });
      window.location.href = data.url; // Redirect to Stripe checkout
    },
    onError: (error) => {
      toast({
        variant: "error",
        title: "Payment Failed",
        description: error.message,
      });
    },
  });
};

// Worker
export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: createProduct,
    onSuccess: (data) => {
      queryClient.invalidateQueries(["marketplace", "my-products"]);
      toast({
        variant: "success",
        title: "Product Created",
        description: data.message,
      });
      navigate("/marketplace/my-products");
    },
    onError: (error) => {
      toast({
        variant: "error",
        title: "Creation Failed",
        description: error.message,
      });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: updateProduct,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries([
        "marketplace",
        "products",
        variables.productId,
      ]);
      queryClient.invalidateQueries(["marketplace", "my-products"]);
      toast({
        variant: "success",
        title: "Product Updated",
        description: data.message,
      });
      navigate("/marketplace/my-products");
    },
    onError: (error) => {
      toast({
        variant: "error",
        title: "Update Failed",
        description: error.message,
      });
    },
  });
};

export const useMyProducts = (filters) =>
  useQuery({
    queryKey: ["marketplace", "my-products", filters],
    queryFn: () => getMyProducts(filters),
  });

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { toast } = useToast();

  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: (data, productId) => {
      queryClient.invalidateQueries(["marketplace", "my-products"]);
      queryClient.removeQueries(["marketplace", "products", productId]);
      toast({
        variant: "success",
        title: "Product Deleted",
        description: data.message,
      });
      navigate("/marketplace/my-products");
    },
    onError: (error) => {
      toast({
        variant: "error",
        title: "Deletion Failed",
        description: error.message,
      });
    },
  });
};
