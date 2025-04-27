import { useToast } from "./useToast";
import { useNavigate } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addToFavorites,
  createProduct,
  deleteProduct,
  getFavorites,
  getMyProducts,
  getProductDetails,
  getProducts,
  removeFromFavorites,
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

export const useAddToFavorites = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addToFavorites,
    onSuccess: () => {
      queryClient.invalidateQueries(["favorites"]);
    },
  });
};

export const useRemoveFromFavorites = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removeFromFavorites,
    onSuccess: () => {
      queryClient.invalidateQueries(["favorites"]);
    },
  });
};

export const useFavorites = () => {
  return useQuery({
    queryKey: ["favorites"],
    queryFn: getFavorites,
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
