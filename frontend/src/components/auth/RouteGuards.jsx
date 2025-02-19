import { useUser } from "@/hooks/useAuth";
import { Navigate, Outlet } from "react-router-dom";
import { LoadingSpinner } from "../common/LoadingSpinner";

export const AuthGuard = () => {
  const { data: user, isLoading } = useUser();

  if (isLoading) return <LoadingSpinner />;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export const PublicGuard = () => {
  const { data: user, isLoading } = useUser();

  if (isLoading) return <LoadingSpinner />;
  return !user ? <Outlet /> : <Navigate to="/" replace />;
};

export const RoleGuard = ({ allowedRoles }) => {
  const { data: user } = useUser();

  if (!allowedRoles.includes(user?.role)) {
    return <Navigate to="/not-found" replace />;
  }
  return <Outlet />;
};
