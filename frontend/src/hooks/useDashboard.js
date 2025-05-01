import { useQuery, useMutation, QueryClient } from "@tanstack/react-query";
import {
  getDashboardSummary,
  getRepairHistory,
  getActiveRepairs,
  getMarketplaceActivity,
  getFavoriteProducts,
  getProfile,
  updateProfile,
} from "../api/dashboardApi";

// Dashboard Summary
export const useDashboardSummary = () =>
  useQuery({
    queryKey: ["dashboard", "summary"],
    queryFn: getDashboardSummary,
  });

// Repair History
export const useRepairHistory = (page, limit) =>
  useQuery({
    queryKey: ["dashboard", "repairs", "history", page, limit],
    queryFn: () => getRepairHistory(page, limit),
    keepPreviousData: true,
  });

// Active Repairs
export const useActiveRepairs = () =>
  useQuery({
    queryKey: ["dashboard", "repairs", "active"],
    queryFn: getActiveRepairs,
  });

// Marketplace Activity
export const useMarketplaceActivity = (page, limit) =>
  useQuery({
    queryKey: ["dashboard", "marketplace", "activity", page, limit],
    queryFn: () => getMarketplaceActivity(page, limit),
  });

// Favorite Products
export const useFavoriteProducts = () =>
  useQuery({
    queryKey: ["dashboard", "marketplace", "favorites"],
    queryFn: getFavoriteProducts,
  });

// User Profile
export const useProfile = () =>
  useQuery({
    queryKey: ["dashboard", "profile"],
    queryFn: getProfile,
  });

export const useUpdateProfile = () =>
  useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      QueryClient.invalidateQueries(["dashboard", "profile"]);
    },
  });
