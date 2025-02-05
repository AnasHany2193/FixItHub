import { useUser } from "@/contexts/UserContext";
import { Navigate, Outlet } from "react-router-dom";

export const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { user } = useUser(); // Get the logged-in user
  console.log("user", user);

  // If no user data is available, the user is not authenticated.
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If allowedRoles is specified and user role is not included, redirect (could be to an unauthorized page)
  // If user role does not match allowed roles, redirect to their dashboard
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    switch (user.role) {
      case "admin":
        return <Navigate to="/admin/dashboard" replace />;
      case "customer":
        return <Navigate to="/customer/dashboard" replace />;
      case "worker":
        return <Navigate to="/worker/dashboard" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  // All checks passed – render the protected content.
  return <Outlet />;
};
