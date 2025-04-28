import { Navigate, Outlet } from "react-router-dom";
import { LoadingSpinner } from "../common/LoadingSpinner";
import { useAuth } from "@/context/AuthContext";

export const AuthGuard = () => {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) return <LoadingSpinner size="lg" />;
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export const PublicGuard = () => {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) return <LoadingSpinner size="lg" hScreen={true} />;
  return !isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
};

export const RoleGuard = ({ allowedRoles }) => {
  const { user } = useAuth();

  if (!allowedRoles.includes(user?.role)) {
    return <Navigate to="/not-found" replace />;
  }
  return <Outlet />;
};
