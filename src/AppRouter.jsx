import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Lazy loading halaman-halaman utama yang sudah ada
const Catalog = lazy(() => import("./pages/Catalog"));
const AllProducts = lazy(() => import("./pages/AllProducts"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Event = lazy(() => import("./pages/Event"));
const About = lazy(() => import("./pages/About"));
const OrderSuccess = lazy(() => import("./pages/OrderSuccess"));

// 🚀 Lazy loading untuk halaman Account, Login, dan Admin Dashboard
const Account = lazy(() => import("./pages/UserAccount"));
const Login = lazy(() => import("./pages/admin/Login"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const ProductManager = lazy(() => import("./pages/admin/ProductManager"));
const CategoryManager = lazy(() => import("./pages/admin/CategoryManager"));

// 🔒 KOMPONEN PROTEKSI (User Biasa)
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  // Jika belum login (tidak ada token), belokkan paksa ke halaman /login
  if (!token) {
    return <Navigate to="/login" replace={true} />;
  }

  // Jika sudah login, loloskan menuju halaman tujuan
  return children;
};

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const location = useLocation();

  // Ambil data user dari State Navigasi atau LocalStorage
  const stateUser = location.state?.authUser;
  const localUser = JSON.parse(localStorage.getItem("user_data") || "{}");
  const userData = stateUser || localUser;

  const userRole = userData?.role || "";
  const roleId = userData?.role_id || "";

  if (!token) {
    return <Navigate to="/login" replace={true} />;
  }

  // Evaluasi kecocokan dengan backend Go
  const isAdminAuthorized =
    ["admin", "owner", "developer"].includes(userRole) ||
    String(roleId) === "1";

  if (!isAdminAuthorized) {
    alert("Akses ditolak! Halaman ini hanya dapat diakses oleh Administrator.");
    return <Navigate to="/account" replace={true} />;
  }

  return children;
};
export default function AppRouter({
  products,
  categories,
  activeCategory,
  setActiveCategory,
  searchQuery,
  setSearchQuery,
  currentProducts,
  filteredProducts,
  totalPages,
  currentPage,
  setCurrentPage,
  handleAddToCart,
  formatRupiah,
  getProductImage,
  getCategoryName,
  setSelectedQuickViewProduct,
  HERO_SLIDES,
  PRODUCTS,
  TESTIMONIALS,
  clearCart,
  cart,
  globalSearchQuery,
  setGlobalSearchQuery,
  loading,
}) {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center bg-neutral-950 text-neutral-400 text-sm font-mono">
          <span>Memuat halaman...</span>
        </div>
      }
    >
      <Routes>
        {/* 🏠 Halaman Utama (Katalog Lengkap) */}
        <Route
          path="/"
          element={
            <Catalog
              products={products}
              categories={categories}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              currentProducts={currentProducts}
              filteredProducts={filteredProducts}
              totalPages={totalPages}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              handleAddToCart={handleAddToCart}
              formatRupiah={formatRupiah}
              getProductImage={getProductImage}
              getCategoryName={getCategoryName}
              setSelectedQuickViewProduct={setSelectedQuickViewProduct}
              HERO_SLIDES={HERO_SLIDES}
              PRODUCTS={PRODUCTS}
              TESTIMONIALS={TESTIMONIALS}
            />
          }
        />

        {/* 🛍️ Halaman Semua Produk */}
        <Route
          path="/products"
          element={
            <AllProducts
              handleAddToCart={handleAddToCart}
              formatRupiah={formatRupiah}
              globalSearchQuery={globalSearchQuery}
              setGlobalSearchQuery={setGlobalSearchQuery}
              products={products}
              categories={categories}
              loading={loading}
            />
          }
        />

        {/* 🔍 Halaman Detail Produk */}
        <Route
          path="/product/:id"
          element={
            <ProductDetail
              handleAddToCart={handleAddToCart}
              formatRupiah={formatRupiah}
              products={products}
            />
          }
        />

        {/* 🛒 Halaman Checkout */}
        <Route
          path="/checkout"
          element={
            <Checkout
              cart={cart}
              formatRupiah={formatRupiah}
              clearCart={clearCart}
            />
          }
        />

        {/* 🔑 Halaman Informasi & Autentikasi */}
        <Route path="/login" element={<Login />} />
        <Route path="/events" element={<Event />} />
        <Route path="/about" element={<About />} />
        <Route
          path="/order-success"
          element={<OrderSuccess clearCart={clearCart} />}
        />

        {/* 🔒 Halaman Account (Terproteksi User Biasa) */}
        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <Account />
            </ProtectedRoute>
          }
        />

        {/* 👑 Halaman Dashboard Admin (Terproteksi Middleware AdminRoute) */}
        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <Dashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/products"
          element={
            <AdminRoute>
              <ProductManager />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/categories"
          element={
            <AdminRoute>
              <CategoryManager />
            </AdminRoute>
          }
        />

        {/* 🔄 Fallback Catch-All Rute Otomatis jika URL Ngawur */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
