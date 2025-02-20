import { createContext, useContext } from "react";
import { useUser } from "@/hooks/useAuth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const userQuery = useUser();

  // Prevent initial fetch when no token exists
  const value =
    userQuery.isLoading && !localStorage.getItem("accessToken")
      ? { ...userQuery, isLoading: false }
      : userQuery;

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
