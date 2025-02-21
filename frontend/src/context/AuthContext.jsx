import { createContext, useContext, useEffect } from "react";
import { useLogout, useUser } from "@/hooks/useAuth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const userQuery = useUser();
  const logoutMutation = useLogout();

  // Prevent infinite retries on unauthorized errors
  useEffect(() => {
    if (userQuery.error?.response?.status === 401) {
      userQuery.remove(); // Remove cached user data
      window.location.href = "/";
    }
  }, [userQuery, userQuery.error]); // ✅ Only run when error changes

  const value = {
    user: userQuery.data?.data,
    isLoading: userQuery.isLoading,
    error: userQuery.error,
    isAuthenticated: !!userQuery.data,
    logout: () => logoutMutation.mutate(),
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
