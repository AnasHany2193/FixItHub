import { createContext, useContext, useState, useEffect } from "react";
import { useCurrentUserQuery } from "@/hooks/useAuth";

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  // Load initial user data from localStorage, if any.
  const [user, setUser] = useState(
    () => JSON.parse(localStorage.getItem("user")) || null
  );

  // Use React Query to fetch current user data from the API.
  const { data, isSuccess, error } = useCurrentUserQuery();

  // If React Query successfully returns user data, update both state and localStorage.
  useEffect(() => {
    if (isSuccess && data) {
      setUser(data.data);
      localStorage.setItem("user", JSON.stringify(data.data));
    }
  }, [isSuccess, data]);

  const updateUser = (newUser) => {
    setUser(newUser);
    localStorage.setItem("user", JSON.stringify(newUser));
  };

  // Might also want to handle errors, e.g., if the token is expired.
  // For simplicity, this example does not include a full error handling mechanism.

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken"); // Add this
  };

  return (
    <UserContext.Provider value={{ user, updateUser, logout, error }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (selector) => {
  const context = useContext(UserContext);

  return selector ? selector(context) : context;
};
