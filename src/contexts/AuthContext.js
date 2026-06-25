import React, { createContext, useState, useEffect, useContext } from "react";

// Create context
export const AuthContext = createContext();

// Provider
export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(sessionStorage.getItem("token") || null);
  const [userId, setUserId] = useState(sessionStorage.getItem("userId") || null);

  // Save token/userId to sessionStorage and update state
  const login = (newToken, newUserId) => {
    setToken(newToken);
    setUserId(newUserId);
    sessionStorage.setItem("token", newToken);
    sessionStorage.setItem("userId", newUserId);
  };

  // Logout clears token/userId from both state and sessionStorage
  const logout = () => {
    setToken(null);
    setUserId(null);
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("userId");
  };

  // Sync state across multiple tabs
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === "token" || event.key === "userId") {
        setToken(sessionStorage.getItem("token"));
        setUserId(sessionStorage.getItem("userId"));
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <AuthContext.Provider value={{ token, userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Helper hook for easy access
export const useAuth = () => useContext(AuthContext);
