import React from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const PrivateRoute = ({ children }) => {
  const token = sessionStorage.getItem("token");

  if (!token) return <Navigate to="/login" replace />;

  try {
    const decoded = jwtDecode(token);
    const now = Date.now() / 1000; // seconds

    if (decoded.exp && decoded.exp < now) {
      sessionStorage.clear();
      return <Navigate to="/login" replace />;
    }

  } catch (err) {
    sessionStorage.clear();
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;
