import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// 📦 CODE SPLITTING: Memuat halaman secara dinamis (Lazy Loading)
// Menghindari browser men-download semua halaman di awal
// const Catalog = lazy(() => import("./pages/Catalog"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const AllProducts = lazy(() => import("./pages/AllProducts"));
const EventPage = lazy(() => import("./pages/Event"));
const AboutPage = lazy(() => import("./pages/About"));
const OrderSuccess = lazy(() => import("./pages/OrderSuccess"));
const UserAccount = lazy(() => import("./pages/UserAccount"));
const Checkout = lazy(() => import("./pages/Checkout"));

// Halaman Admin
const AdminLogin = lazy(() => import("./pages/admin/Login"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const CategoryManager = lazy(() => import("./pages/admin/CategoryManager"));
const ProductManager = lazy(() => import("./pages/admin/ProductManager")); // Pastikan file ada di pages/admin/ProductManager
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));

// 🌀 Komponen Loading Placeholder saat proses perpindahan halaman
const PageLoading = () => (
  <div className="flex h-screen w-full items-center justify-center bg-neutral-950 text-neutral-400 font-mono text-sm">
    <div className="flex flex-col items-center gap-2">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
      <span>Memuat halaman...</span>
    </div>
  </div>
);

// 🔒 Komponen Proteksi Rute Customer Account
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem("token") !== null;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// 🔑 EXPORT UTAMA YANG DIPANGGIL OLEH APP.JSX
export default function AppRouter({ cart, addToCart, clearCart }) {
  return (
    <Suspense fallback={<PageLoading />}>
      <Routes>
        {/* 🔓 RUTE PUBLIK UTAMA */}
        <Route path="/" element={<Catalog addToCart={addToCart} />} />
        <Route
          path="/products"
          element={<AllProducts addToCart={addToCart} />}
        />
        <Route
          path="/product/:id"
          element={<ProductDetail addToCart={addToCart} />}
        />
        <Route path="/events" element={<EventPage />} />
        <Route path="/about" element={<AboutPage />} />

        {/* 🛒 PROSES CHECKOUT (Oper State Cart & ClearCart dari App.jsx) */}
        <Route
          path="/checkout"
          element={<Checkout cart={cart} clearCart={clearCart} />}
        />
        <Route path="/order-success" element={<OrderSuccess />} />

        {/* 🔐 RUTE CUSTOMER TERPROTEKSI */}
        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <UserAccount />
            </ProtectedRoute>
          }
        />

        {/* 🔐 RUTE MANAGEMENT ADMIN */}
        <Route path="/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/categories" element={<CategoryManager />} />
        <Route path="/admin/products" element={<ProductManager />} />
        <Route path="/admin/products/import" element={<ProductManager />} />
        <Route path="/admin/orders" element={<AdminOrders />} />

        {/* 🛡️ CATCH-ALL (Jika URL Ngasal, Lempar ke Catalog) */}
        <Route path="/*" element={<Catalog addToCart={addToCart} />} />
      </Routes>
    </Suspense>
  );
}
