import { createContext, useContext } from "react";
import { useLogout, useUser } from "@/hooks/useAuth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const userQuery = useUser();
  const logoutMutation = useLogout();

  // Prevent initial fetch when no token exists
  const value = {
    // User query state
    user: userQuery.data,
    isLoading: userQuery.isLoading,
    error: userQuery.error,
    isAuthenticated: !!userQuery.data,

    // Auth actions
    logout: async () => {
      await logoutMutation.mutateAsync();
      userQuery.remove(); // Clear user query cache
    },

    // Refresh user data
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
