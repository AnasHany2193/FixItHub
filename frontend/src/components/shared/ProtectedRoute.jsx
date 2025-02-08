import { useUser } from "@/contexts/UserContext";
import { Navigate, Outlet } from "react-router-dom";

export const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { user } = useUser(); // Get the logged-in user

  if (!user) return <Navigate to="/" replace />; // Redirect if not logged in

  if (!allowedRoles.includes(user.role)) return <Navigate to="/" replace />; // Redirect if role is unauthorized

  return <Outlet />; // Render child routes
};
