import React, { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { Spinner } from "react-bootstrap";
import { motion } from "framer-motion";

const ProtectedRoute = ({ requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, loading } = useContext(AuthContext);

  // Show epic loading animation while checking authentication
  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center flex-column"
        style={{ height: "100vh" }}
      >
        <div className="epic-loader mb-3"></div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          className="mt-3 text-primary"
        >
          Loading your experience...
        </motion.p>
      </div>
    );
  }

  // Check if user is authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if admin access is required
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
