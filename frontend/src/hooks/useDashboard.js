import { useQuery, useMutation, QueryClient } from "@tanstack/react-query";
import {
  getDashboardSummary,
  getProfile,
  getWorkerDashboard,
  updateProfile,
} from "../api/dashboard";

// Dashboard Summary
export const useDashboardSummary = () =>
  useQuery({
    queryKey: ["dashboard", "summary"],
    queryFn: getDashboardSummary,
  });

// hooks/useDashboard.js
export const useWorkerDashboard = () =>
  useQuery({
    queryKey: ["dashboard", "worker"],
    queryFn: getWorkerDashboard,
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
