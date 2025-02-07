import { Navigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";

const RoleProtectedRoute = ({ requiredRole, children }) => {
  const { user } = useUser();

  // If no user or the user's role doesn't match the requiredRole, redirect to home
  if (!user || user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }
  return children;
};

export default RoleProtectedRoute;
