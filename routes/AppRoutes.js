import React from "react";
import { Routes, Route } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import LoginPage from "../pages/LoginPage";
import menuPages from "../pages/menuPages";
import DashboardLayout from "../layouts/DashboardLayout";
import ResetPasswordPage from "../pages/ResetPasswordPage";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Wrap all menu pages inside DashboardLayout */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <DashboardLayout />
          </PrivateRoute>
        }
      >
        {/* Default dashboard */}
        <Route index element={menuPages["/dashboard"]()} />
        
        {/* Dynamic menu pages */}
        {Object.entries(menuPages)
          .filter(([path]) => path !== "/dashboard")
          .map(([path, Component]) => (
            <Route key={path} path={path.replace("/", "")} element={<Component />} />
          ))}
      </Route>

      <Route path="*" element={<LoginPage />} />
    </Routes>
  );
};

export default AppRoutes;
