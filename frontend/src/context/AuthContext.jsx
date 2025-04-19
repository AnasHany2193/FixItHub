import { createContext, useContext, useEffect } from "react";
import { useLogout, useUser } from "@/hooks/useAuth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const userQuery = useUser();
  const { mutate: logout } = useLogout();

  // Centralized auth error handling
  useEffect(() => {
    const handleAuthError = (error) => {
      if (error?.response?.status === 401 && !window.location.pathname("login"))
        logout();
    };

    if (userQuery.error) handleAuthError(userQuery.error);
  }, [userQuery.error, logout]);

  const value = {
    user: userQuery.data?.data,
    isLoading: userQuery.isLoading,
    error: userQuery.error,
    isAuthenticated: !!userQuery.data,
    logout,
    refreshUser: userQuery.refetch,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
