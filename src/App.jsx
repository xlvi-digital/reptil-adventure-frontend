import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, X, ShoppingBagIcon } from "lucide-react";

// Library & Assets Global
import AOS from "aos";
import "aos/dist/aos.css";
import { HERO_SLIDES, PRODUCTS, TESTIMONIALS } from "./data";
import API, { IMAGE_URL } from "./api/axios";

// Komponen Global Layar Utama
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import CartDrawer from "./components/CartDrawer.jsx";
import SearchModal from "./components/SearchModal.jsx";
import WatchIntroModal from "./components/WatchIntroModal.jsx";
import AiStylist from "./components/AiStylist.jsx";

// Hub Utama Rute
import AppRouter from "./AppRouter.jsx";

export default function App() {
  const navigate = useNavigate();

  // --- STATE CORE UTAMA ---
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [introOpen, setIntroOpen] = useState(false);
  const [selectedQuickViewProduct, setSelectedQuickViewProduct] =
    useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // --- STATE PRODUK & FILTER ---
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [globalSearchQuery, setGlobalSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Inisialisasi AOS Efek Scroll
  useEffect(() => {
    AOS.init({ duration: 1200, once: true, offset: 100 });

    const fetchDataDariDatabase = async () => {
      try {
        setLoading(true);

        // 🚀 2. Tarik data menggunakan AXIOS instance yang sudah kamu buat
        // Axios otomatis menambahkan '/api/v1' di depannya sehingga menjadi '/api/v1/products'
        const [resProducts, resCategories] = await Promise.all([
          API.get("/products"),
          API.get("/categories"),
        ]);

        // Axios menyimpan hasil respon data di dalam properti '.data'
        const dataProducts = resProducts.data;
        const dataCategories = resCategories.data;

        // Amankan jika struktur data dari server Go kamu dibungkus lagi dengan objek '.data' atau langsung array
        const finalProducts = dataProducts.data || dataProducts;
        const finalCategories = dataCategories.data || dataCategories;

        if (Array.isArray(finalProducts) && finalProducts.length > 0) {
          setProducts(finalProducts);
        } else {
          setProducts(PRODUCTS); // Fallback ke data lokal jika kosong
        }

        setCategories(finalCategories);
      } catch (error) {
        console.error("Error Database Fetching:", error);
        showToast("Server sedang bersiap. Menggunakan data cadangan.");

        // Fallback jika Hugging Face mati atau timeout
        setProducts(PRODUCTS);
      } finally {
        setLoading(false);
      }
    };

    fetchDataDariDatabase();
  }, []); // Kosongkan dependency agar hanya berjalan 1x saat aplikasi dimuat

  // Sinkronisasi Halaman Pagination
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, searchQuery]);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // --- LOGIKA ADD TO CART & OPERASI KERANJANG ---
  const handleAddToCart = (product, size, color, qty) => {
    const compositeId = `${product.id}_${size}_${color}`;
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) => item.id === compositeId,
      );
      if (existingIndex > -1) {
        const updatedCart = [...prevCart];
        updatedCart[existingIndex].quantity += qty;
        return updatedCart;
      }
      return [
        ...prevCart,
        {
          id: compositeId,
          productId: product.id,
          product,
          quantity: qty,
          size,
          color,
        },
      ];
    });
    showToast(`Added ${qty}x ${product.title || product.name} to cart`);
  };

  const updateQuantity = (id, amount) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + amount) }
          : item,
      ),
    );
  };

  const removeItem = (id) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
    showToast("Item removed from cart");
  };

  const clearCart = () => setCart([]);

  const handleGlobalSearchSubmit = (queryText) => {
    setSearchQuery(queryText);
    setSearchModalOpen(false);
    navigate("/products");
  };

  // --- LOGIKA FILTER DATA PRODUK ---
  const filteredProducts = products.filter((product) => {
    const pCategoryId =
      product.category_id || (product.category && product.category.id);
    const matchesCategory =
      activeCategory === "All" ||
      String(pCategoryId) === String(activeCategory);
    const productName = product.title || product.name || "";
    return (
      matchesCategory &&
      productName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const productPerPage = 12;
  const indexOfLastProduct = currentPage * productPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct,
  );
  const totalPages = Math.ceil(filteredProducts.length / productPerPage);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // --- 🚀 3. PERBARUI FUNGSI PEMBANTU GAMBAR AGAR MEMAKAI 'IMAGE_URL' DARI AXIOS KAMU ---
  const formatRupiah = (number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);
  const getCategoryName = (p) =>
    p?.category_name || p?.category?.name || p?.category || "";

  const getProductImage = (p) => {
    if (!p) return "https://via.placeholder.com/300";
    const rawImage = p.image || p.image_url;
    if (!rawImage) return "https://via.placeholder.com/300";
    if (typeof rawImage === "string" && rawImage.startsWith("http"))
      return rawImage;

    // Menggunakan IMAGE_URL ("https://xlvi-digital-reptil-adventure-api.hf.space") yang diexport dari file Axios kamu
    return `${IMAGE_URL}/${String(rawImage).replace(/^\//, "")}`;
  };

  return (
    <div className="min-h-screen bg-[#FDFDFB] text-[#111111] antialiased pt-16">
      {/* Toast HUD */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-[#2D3E35] text-[#EAE5D8] px-5 py-3 rounded-xl flex items-center gap-3 shadow-xl">
          <Sparkles className="h-4 w-4 animate-pulse" />
          <span className="text-xs font-mono">{toastMessage}</span>
        </div>
      )}

      {/* 🧭 NAVIGATION */}
      <Navbar
        cartCount={cartCount}
        onCartOpen={() => setCartOpen(true)}
        onSearchOpen={() => setSearchModalOpen(true)}
      />

      {/* 🌟 [LOGIKA LOADING] Tampilkan indikator memuat jika data database belum ditarik */}
      {loading ? (
        <div className="min-h-[70vh] flex flex-col items-center justify-center font-mono text-xs text-neutral-500 gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-900 border-t-transparent"></div>
          <span>Mengkoneksikan & memuat data dari database online...</span>
        </div>
      ) : (
        /* 🌍 ROUTER FLOW DIRECTORY */
        <AppRouter
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
          clearCart={clearCart}
          cart={cart}
          globalSearchQuery={globalSearchQuery}
          setGlobalSearchQuery={setGlobalSearchQuery}
          loading={loading}
        />
      )}

      <Footer />

      {/* Modals & Overlays */}
      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onSearchSubmit={handleGlobalSearchSubmit}
      />
      <AiStylist cartCount={cartCount} />
      <WatchIntroModal isOpen={introOpen} onClose={() => setIntroOpen(false)} />
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeItem}
        onCheckout={() => {
          setCartOpen(false);
          navigate("/checkout");
        }}
      />

      {/* Quick View Overlays */}
      {selectedQuickViewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl overflow-hidden w-full max-w-xl p-6 relative">
            <button
              onClick={() => setSelectedQuickViewProduct(null)}
              className="absolute top-4 right-4 text-neutral-500 font-bold"
            >
              ✕
            </button>
            <img
              src={getProductImage(selectedQuickViewProduct)}
              alt=""
              className="w-full h-64 object-cover rounded-xl"
            />
            <h3 className="text-lg font-bold mt-4">
              {selectedQuickViewProduct.name || selectedQuickViewProduct.title}
            </h3>
            <p className="text-xs text-neutral-500 mt-2">
              {selectedQuickViewProduct.description}
            </p>
            <div className="text-sm font-bold mt-3">
              {formatRupiah(selectedQuickViewProduct.price)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
