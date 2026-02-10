import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function ProtectedRoute({ children, role }) {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login" replace />;
  // Case-insensitive role check
  if (role && user.role?.toUpperCase() !== role?.toUpperCase()) {
    return <Navigate to="/" replace />;
  }
  return children;
}
