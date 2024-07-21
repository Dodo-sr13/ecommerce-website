// src/components/ProtectedRoute.js
import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";

const ProtectedRoute = ({ element, allowedRoles, ...rest }) => {
  const decodeToken = () => {
    const token = localStorage.getItem("token");
    if (token) {
      return jwtDecode(token);
    }
    return null;
  };

  const decodedUser = decodeToken();
  const isAuthenticated = !!decodedUser;
  const isAdmin = isAuthenticated ? !decodedUser.isCustomer : false;
  const isCustomer = isAuthenticated ? decodedUser.isCustomer : false;

  useEffect(() => {
    // Check for access permissions
    if (allowedRoles.includes("admin") && !isAdmin) {
      toast.error("Unauthorized access", { autoClose: 2000 });
      setTimeout(() => {
        <Navigate to="/" />;
      }, 2000); // Delay redirection to allow toast message to be seen
    } else if (allowedRoles.includes("customer") && !isCustomer) {
      toast.error("Unauthorized access", { autoClose: 2000 });
      setTimeout(() => {
        <Navigate to="/" />;
      }, 2000); // Delay redirection to allow toast message to be seen
    }
  }, [allowedRoles, isAdmin, isCustomer]);

  if (allowedRoles.includes("admin") && !isAdmin) {
    return <Navigate to="/" />;; // No element rendered, user will be redirected
  }

  if (allowedRoles.includes("customer") && !isCustomer) {
    return <Navigate to="/" />;; // No element rendered, user will be redirected
  }

  return element;
};

export default ProtectedRoute;