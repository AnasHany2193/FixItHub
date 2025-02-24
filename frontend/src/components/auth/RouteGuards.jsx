import { Navigate, Outlet } from "react-router-dom";
import { LoadingSpinner } from "../common/LoadingSpinner";
import { useAuth } from "@/context/AuthContext";

export const AuthGuard = () => {
  const { isLoading, user } = useAuth();

  if (isLoading) return <LoadingSpinner size="lg" />;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export const PublicGuard = () => {
  const { isLoading, user } = useAuth();

  if (isLoading) return <LoadingSpinner size="lg" />;
  return !user ? <Outlet /> : <Navigate to="/" replace />;
};

export const RoleGuard = ({ allowedRoles }) => {
  const { user } = useAuth();

  if (!allowedRoles.includes(user?.role)) {
    return <Navigate to="/not-found" replace />;
  }
  return <Outlet />;
};
