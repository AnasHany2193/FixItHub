import { Navigate, Outlet } from "react-router-dom";

import DashboardLayout from "@/layout/DashboardLayout";
import { useUser } from "@/contexts/UserContext";

export const ProtectedRoute = ({ allowedRoles }) => {
  const { user } = useUser();

  // If no user data is available, the user is not authenticated.
  if (!user) return <Navigate to="/login" replace />;

  // If user role is not in allowedRoles, redirect to home "/"
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // If authorized, render the DashboardLayout and nested routes
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
};
