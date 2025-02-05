import { Navigate, Outlet } from "react-router-dom";

export const AuthRoute = () => {
  const user = false;

  if (user) {
    // Redirect based on user role
    switch (user.role) {
      case "admin":
        return <Navigate to="/admin/dashboard" />;
      case "worker":
        return <Navigate to="/worker/dashboard" />;
      case "customer":
        return <Navigate to="/customer/dashboard" />;
      default:
        return <Navigate to="/" />;
    }
  }

  // If not authenticated, allow access to auth pages
  return <Outlet />;
};
