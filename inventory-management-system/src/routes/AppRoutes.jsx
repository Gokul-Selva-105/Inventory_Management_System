import React, { lazy } from "react";
import { Routes, Route } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import ProductList from "../pages/ProductList";
import ProductEdit from "../pages/ProductEdit";
import CategoryList from "../pages/CategoryList";
import NotFound from "../pages/NotFound";
import Login from "../pages/Login";
import Register from "../pages/Register";
import AdminRegister from "../pages/AdminRegister";
import UserManagement from "../pages/UserManagement";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import QrScanner from "../pages/QrScanner";
import Schedule from "../pages/Schedule";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/admin-register" element={<AdminRegister />} />
        <Route path="/user-management" element={<UserManagement />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/product/:id/edit" element={<ProductEdit />} />
        <Route path="/product/new" element={<ProductEdit />} />
        <Route path="/categories" element={<CategoryList />} />
        <Route path="/qr-scanner" element={<QrScanner />} />
        <Route path="/schedule" element={<Schedule />} />
      </Route>

      {/* Admin Only Routes */}
      <Route element={<ProtectedRoute requireAdmin={true} />}>
        {/* You can keep any routes that should truly be admin-only here */}
      </Route>

      {/* 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
