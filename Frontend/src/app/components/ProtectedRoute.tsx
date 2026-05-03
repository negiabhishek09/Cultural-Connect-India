import { Navigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

export const ProtectedRoute = ({ children, adminOnly = false }: any) => {
  const { user } = useApp();

  // 🔐 Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 👑 Only admin routes
  if (adminOnly && user.role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  return children;
};