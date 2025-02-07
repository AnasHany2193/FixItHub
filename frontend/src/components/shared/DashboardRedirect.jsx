import { useUser } from "@/contexts/UserContext";
import { Navigate } from "react-router-dom";

const DashboardRedirect = () => {
  const { user } = useUser();

  // If user is missing or role is unexpected, redirect to home
  if (!user) {
    return <Navigate to="/" replace />;
  }

  switch (user.role) {
    case "admin":
      return <Navigate to="/dashboard/admin" replace />;
    case "worker":
      return <Navigate to="/dashboard/worker" replace />;
    case "customer":
      return <Navigate to="/dashboard/customer" replace />;
    default:
      return <Navigate to="/" replace />;
  }
};

export default DashboardRedirect;
