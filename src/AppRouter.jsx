import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Lazy loading halaman-halaman utama
const Catalog = lazy(() => import("./pages/Catalog"));
const AllProducts = lazy(() => import("./pages/AllProducts"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Checkout = lazy(() => import("./pages/Checkout"));

const PageLoading = () => (
  <div className="flex h-screen w-full items-center justify-center bg-neutral-950 text-neutral-400 text-sm font-mono">
    <span>Memuat halaman...</span>
  </div>
);

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
    <Suspense fallback={<PageLoading />}>
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
      </Routes>
    </Suspense>
  );
}
