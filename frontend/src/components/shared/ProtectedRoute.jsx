import { Navigate, Outlet } from "react-router-dom";

export const ProtectedRoute = ({ allowedRoles = [] }) => {
  const user = false;

  // If no user data is available, the user is not authenticated.
  if (!user) {
    return <Navigate to="/login" />;
  }

  // If allowedRoles is specified and user role is not included, redirect (could be to an unauthorized page)
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" />;
  }

  // All checks passed – render the protected content.
  return <Outlet />;
};
