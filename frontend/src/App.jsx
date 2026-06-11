import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Lazy load pages for Code Splitting & Performance
const Home = lazy(() => import('./pages/Home'));
const Shop = lazy(() => import('./pages/Shop'));
const ProductDetails = lazy(() => import('./pages/ProductDetails'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Payment = lazy(() => import('./pages/Payment'));
const OrderTracking = lazy(() => import('./pages/OrderTracking'));
const Dashboard = lazy(() => import('./pages/Dashboard'));

// Admin pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));

// Loading fallback spinner
const LoadingFallback = () => (
  <div className="min-h-[70vh] w-full flex items-center justify-center">
    <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
  </div>
);

function App() {
  return (
    <Layout>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/cart" element={<Cart />} />

          {/* Customer Protected Routes */}
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment"
            element={
              <ProtectedRoute>
                <Payment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/track/:id"
            element={
              <ProtectedRoute>
                <OrderTracking />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Admin Protected Routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <Navigate to="/admin/dashboard" replace />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/products"
            element={
              <AdminRoute>
                <AdminProducts />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/categories"
            element={
              <AdminRoute>
                <AdminCategories />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <AdminRoute>
                <AdminOrders />
              </AdminRoute>
            }
          />

          {/* 404 Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}

export default App;
