import { Navigate, useLocation } from "react-router";

export const CheckAuth = ({ user }) => {
  const location = useLocation();

  console.log("location.pathname", location.pathname);
  if (location.pathname === "/dashboard") {
    if (!user) return <Navigate to="/login" replace />;
  }
};
