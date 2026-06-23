import React, { useEffect, useState } from "react";
// 🌟 Cukup satu baris ini saja untuk meng-import semua kebutuhan routing Anda:
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
} from "react-router-dom";

import {
  ShoppingBag,
  Search,
  User,
  Plus,
  Minus,
  Play,
  ArrowLeft,
  ArrowRight,
  Star,
  Sparkles,
  Eye,
  Check,
  ArrowUpRight,
  ShoppingBagIcon,
  X,
  MessageSquare,
  Send,
  ShieldCheck,
  Flame,
  HelpCircle,
  Truck,
} from "lucide-react";
// 🌟 1. Impor Library AOS beserta CSS Bawaannya
import AOS from "aos";
import "aos/dist/aos.css";

import { HERO_SLIDES, PRODUCTS, TESTIMONIALS } from "./data";
// import { Product, CartItem } from './types';
import WatchIntroModal from "./components/WatchIntroModal";
import CartDrawer from "./components/CartDrawer";
import AiStylist from "./components/AiStylist";
// 🌟 Tinggal Panggil Komponen Terpisah yang Sudah Dibuat
import Navbar from "./components/Navbar.jsx"; // Pastikan path ini benar sesuai struktur folder Anda
import Footer from "./components/Footer";
import SearchModal from "./components/SearchModal"; // Jika sudah dipisah

import ProductDetail from "./pages/ProductDetail";
import AllProducts from "./pages/AllProducts";

import AdminLogin from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";
import CategoryManager from "./pages/admin/CategoryManager";
// 🚀 Pastikan ini tertulis CategoryManager, BUKAN Dashboard
import ProductManager from "./pages/admin/ProductManager";
import EventPage from "./pages/Event"; // Sesuaikan path jika berbeda folder
import AboutPage from "./pages/About"; // 🌟 Impor halaman About yang baru dibuat
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import UserAccount from "./pages/UserAccount";
// 🌟 Impor halaman Order Success yang baru dibuat
import AdminOrders from "./pages/admin/AdminOrders";
import API from "./api/axios";

// Komponen Proteksi Route (Mencegah akses halaman akun jika belum login)
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem("token") !== null;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function Catalog() {
  // Hero slide state
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const activeHero = HERO_SLIDES[currentSlideIndex];

  const BASE_URL = "http://localhost:8080";

  // 🌟 TAMBAHKAN LOGIKA TIMEOUT 1 MENIT INI:
  useEffect(() => {
    const autoplayTimer = setInterval(() => {
      // Otomatis pindah ke slide berikutnya, jika sudah di slide terakhir balik ke 0
      setCurrentSlideIndex((prevIndex) => (prevIndex + 1) % HERO_SLIDES.length);

      // Reset state pilihan lokal ke default setiap kali slide berganti otomatis
      setSelectedColorIndex(0);
      setSelectedSize("M");
      setQuantity(1);
    }, 60000); // 60000 ms = 1 Menit

    return () => clearInterval(autoplayTimer); // Bersihkan timer saat komponen di-unmount
  }, [HERO_SLIDES.length]);

  // 🌟 2. Jalankan Inisialisasi AOS Saat Website Pertama Kali Dimuat
  useEffect(() => {
    AOS.init({
      duration: 1200, // Durasi animasi (1200ms = 1.2 detik agar gerakannya halus & premium)
      once: true, // Animasi hanya berjalan 1 kali saat di-scroll ke bawah (tidak berulang saat di-scroll ke atas)
      easing: "cubic-bezier(0.16, 1, 0.3, 1)", // Menyamakan feel kurva melambatnya dengan Hero Slider kita
      offset: 100, // Animasi baru akan terpicu jika elemen sudah berjarak 100px dari bawah layar
    });
  }, []);

  // Custom picker state for Hero Product
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState("M");
  const [quantity, setQuantity] = useState(1);

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]); // 🌟 Tambahkan baris ini
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [globalSearchQuery, setGlobalSearchQuery] = useState("");

  // State untuk membuka/menutup Modal Search
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  // 🌟 2. Inisialisasi fungsi navigate
  const navigate = useNavigate();

  // 🌟 3. Buat fungsi submit pencarian global
  const handleGlobalSearchSubmit = (queryText) => {
    setSearchQuery(queryText); // Simpan kata kunci ke state global
    setSearchModalOpen(false); // Tutup modal search setelah submit

    // Alihkan halaman ke /products secara otomatis
    navigate("/products");
  };

  // 1. STATE PAGINATION
  const [currentPage, setCurrentPage] = useState(1);

  // State untuk menyimpan kata kunci pencarian
  const [searchQuery, setSearchQuery] = useState("");

  // Cart state
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const clearCart = () => {
    setCart([]); // Mengosongkan keranjang kembali menjadi array kosong
  };

  // Modal state
  const [introOpen, setIntroOpen] = useState(false);

  // Quick View Modal
  const [selectedQuickViewProduct, setSelectedQuickViewProduct] =
    useState(null);

  // UI Toast Feedback
  const [toastMessage, setToastMessage] = useState(null);

  // Newsletter & Interactive Contact
  const [emailInput, setEmailInput] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [chatReplies, setChatReplies] = useState([
    {
      sender: "system",
      text: "Hey there! Drop your email or message us directly here.",
    },
  ]);

  // 🔄 Ubah useEffect yang lama menjadi seperti ini:
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Mengambil data kategori dan produk secara paralel dari backend Go
        const [categoriesResponse, productsResponse] = await Promise.all([
          API.get("/categories"),
          API.get("/products"), // 🌟 Menarik data dari table product database
        ]);

        setCategories(categoriesResponse.data);
        setProducts(productsResponse.data); // 🌟 Simpan ke state produk
      } catch (error) {
        console.error("Gagal memuat data dari database:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 2. RESET PAGE EFFECT
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory]);

  // Mengatur agar halaman kembali ke nomor 1 jika kategori ATAU kata kunci pencarian berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, searchQuery]);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Next/Prev active Hero
  const nextSlide = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    setSelectedColorIndex(0);
    setSelectedSize("M");
    setQuantity(1);
  };

  const prevSlide = () => {
    setCurrentSlideIndex(
      (prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length,
    );
    setSelectedColorIndex(0);
    setSelectedSize("M");
    setQuantity(1);
  };

  // Add Item to Cart
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
      } else {
        return [
          ...prevCart,
          {
            id: compositeId,
            productId: product.id,
            product: product,
            quantity: qty,
            size: size,
            color: color,
          },
        ];
      }
    });

    showToast(`Added ${qty}x ${product.name} (${size} / ${color}) to cart`);
  };

  // Cart operations
  const updateQuantity = (id, amount) => {
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.id === id) {
          const newQty = item.quantity + amount;
          return { ...item, quantity: newQty < 1 ? 1 : newQty };
        }
        return item;
      }),
    );
  };

  const removeItem = (id) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
    showToast("Item removed from shopping cart");
  };

  const handleCheckout = () => {
    showToast("Secure checkout initialized! Thank you for your purchase.");
    setCart([]);
    setCartOpen(false);
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!emailInput) return;
    showToast(
      `Successfully subscribed ${emailInput} to our newsletter roster!`,
    );
    setEmailInput("");
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!contactMessage) return;
    setChatReplies((prev) => [
      ...prev,
      { sender: "user", text: contactMessage },
      {
        sender: "system",
        text: "Thanks for dropping a line! Our streetwear crew will reply shortly.",
      },
    ]);
    setContactMessage("");
  };

  // Filter products by selected sidebar tab
  // Logika Filter: Menyaring berdasarkan Kategori DAN Kata Kunci Pencarian sekaligus
  // 🔄 Ubah filteredProducts menjadi seperti ini:
  const filteredProducts = products.filter((product) => {
    // Mencocokkan ID Kategori dari database
    const pCategoryId =
      product.category_id || (product.category && product.category.id);
    const matchesCategory =
      activeCategory === "All" ||
      String(pCategoryId) === String(activeCategory);

    const productName = product.title || product.name || "";
    const matchesSearch = productName
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
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

  // Format Rupiah
  const formatRupiah = (number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0, // Menghilangkan ,00 di belakang harga
      maximumFractionDigits: 0,
    }).format(number);
  };

  // 🌟 Tambahkan fungsi ini tepat di atas "return ("
  const getCategoryName = (product) => {
    if (!product) return "";
    if (product.category_name) return product.category_name;
    if (typeof product.category === "object" && product.category !== null) {
      return product.category.name || "";
    }
    return product.category || "";
  };

  const getProductImage = (product) => {
    if (!product) return "https://via.placeholder.com/300";

    // Ambil data gambar mentah dari produk
    const rawImage = product.image || product.image_url;

    if (!rawImage) return "https://via.placeholder.com/300";

    try {
      // Jika datanya berupa string JSON (karena dari database seringkali datang sebagai string)
      if (typeof rawImage === "string" && rawImage.startsWith("{")) {
        const parsed = JSON.parse(rawImage);
        if (parsed.primary) {
          return `${BASE_URL}${parsed.primary}`;
        }
      }
      // Jika datanya sudah otomatis menjadi Object di JavaScript
      else if (typeof rawImage === "object" && rawImage.primary) {
        return `${BASE_URL}${rawImage.primary}`;
      }

      // Jika ternyata datanya string biasa (bukan JSON objek)
      if (typeof rawImage === "string") {
        if (rawImage.startsWith("http")) return rawImage;
        return `${BASE_URL}${rawImage}`;
      }
    } catch (error) {
      console.error("Gagal memparsing gambar:", error);
    }

    return "https://via.placeholder.com/300"; // Gambar cadangan jika gagal
  };

  // Tulis ini tepat di atas baris "return (" pada komponen Catalog:
  if (!activeHero) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xs text-neutral-500">
        Memuat halaman katalog...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFB] text-[#111111] font-sans antialiased selection:bg-[#2D3E35] selection:text-white pt-16 overflow-x-hidden">
      {/* Toast Notification HUD */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-[#2D3E35] text-[#EAE5D8] px-5 py-3.5 rounded-xl shadow-2xl border border-white/10 font-mono text-xs tracking-wider flex items-center gap-3 animate-bounce">
          <Sparkles className="h-4 w-4 text-[#EAE5D8] animate-pulse shrink-0" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 hover:text-white text-neutral-400 font-bold"
          >
            ×
          </button>
        </div>
      )}

      <Navbar
        cartCount={cartCount}
        onCartOpen={() => setCartOpen(true)}
        onSearchOpen={() => setSearchModalOpen(true)}
      />

      {/* Main Container */}
      <Routes>
        <Route
          path="/"
          element={
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
              {/* SECTION 1: Dynamic Hero Interactive Showcase (Top Area) */}
              <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative overflow-hidden min-h-[650px] lg:min-h-[550px]">
                {/* =========================================================================
                    HERO LEFT SPEC CONFIGURATION FORM (5 COLS) 
                    ========================================================================= */}
                {/* 🌟 Diberi key={currentSlideIndex} agar React me-render ulang animasi teks setiap slide berganti */}
                <div
                  key={`left-${currentSlideIndex}`}
                  className="lg:col-span-5 space-y-8 pr-2 transition-all duration-700 ease-out animate-fade-in-up"
                  style={{
                    animation:
                      "fadeInUp 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards",
                  }}
                >
                  <div className="space-y-2">
                    <p className="font-mono text-xs uppercase tracking-widest text-neutral-400">
                      {activeHero.subtitle}
                    </p>
                    <h2 className="font-display font-black text-6xl md:text-[4.5rem] tracking-tighter text-neutral-900 leading-none">
                      {activeHero.title}
                    </h2>
                  </div>

                  <p className="text-sm text-neutral-500 leading-relaxed max-w-lg">
                    {activeHero.description}
                  </p>

                  <p className="text-xs uppercase tracking-wider text-[#2D3E35] font-bold">
                    Dikirim dari Bandung, Indonesia
                  </p>

                  <span className="block font-mono text-[10px] uppercase tracking-widest text-[#111111]">
                    Color:{" "}
                    <strong className="text-neutral-900">
                      {activeHero?.colors?.[selectedColorIndex]?.name ||
                        "Standard"}
                    </strong>
                  </span>

                  <div className="flex items-center gap-3">
                    {activeHero.colors?.map((color, index) => (
                      <button
                        key={color.name}
                        onClick={() => setSelectedColorIndex(index)}
                        className={`h-6 w-6 rounded-full border-2 transition-all duration-200 cursor-pointer hover:scale-110 active:scale-90 ${
                          selectedColorIndex === index
                            ? "border-neutral-900 scale-110 shadow-md ring-2 ring-neutral-300 ring-offset-2"
                            : "border-transparent shadow-xs"
                        }`}
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                      />
                    ))}
                  </div>

                  {/* Sizes Select (Interactive) */}
                  <div className="space-y-3">
                    <span className="block font-mono text-[10px] uppercase tracking-widest text-[#111111]">
                      Size Selection
                    </span>
                    <div className="flex flex-wrap gap-2.5">
                      {activeHero.sizes?.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`font-mono text-xs px-3.5 py-2.5 rounded-lg border transition duration-150 cursor-pointer min-w-[42px] font-semibold ${
                            selectedSize === size
                              ? "bg-neutral-900 text-white border-neutral-900 shadow-md"
                              : "bg-white hover:bg-neutral-50 text-neutral-700 border-neutral-200"
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Qty & Add Actions Row */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                    {/* Selector Qty */}
                    <div className="flex items-center justify-between border border-neutral-200 rounded-xl bg-white p-1 sm:w-32 shadow-xs">
                      <button
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="p-2 text-neutral-500 hover:text-black hover:bg-neutral-50 rounded-lg transition"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="font-mono text-sm font-bold text-neutral-900 px-2 select-none">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity((q) => q + 1)}
                        className="p-2 text-neutral-500 hover:text-black hover:bg-neutral-50 rounded-lg transition"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Action: Add to Cart */}
                    <button
                      onClick={() => {
                        const syntheticProductObj = {
                          id: activeHero.id,
                          title: `${activeHero.name} ${activeHero.subtitle}`,
                          price: activeHero.price,
                          image: activeHero.image,
                          category: "Pakaian",
                          description: activeHero.description,
                        };
                        handleAddToCart(
                          syntheticProductObj,
                          selectedSize,
                          activeHero.colors[selectedColorIndex]?.name ||
                            "Standard",
                          quantity,
                        );
                      }}
                      className="flex-1 bg-neutral-900 text-white text-xs font-semibold uppercase tracking-wider px-6 py-4 rounded-xl hover:bg-neutral-800 transition duration-300 shadow-lg active:scale-95 text-center cursor-pointer"
                    >
                      {`Add To Cart — Rp. ${formatRupiah(
                        activeHero.price * quantity,
                      )
                        .replace("Rp", "")
                        .trim()}`}
                    </button>
                  </div>

                  {/* Watch Film Button */}
                  <div className="pt-2 flex items-center gap-4">
                    <button
                      onClick={() => setIntroOpen(true)}
                      className="flex items-center gap-2.5 px-5 py-3 border border-neutral-200 hover:border-neutral-900 bg-white rounded-xl shadow-xs hover:shadow-md transition duration-300 text-xs font-semibold text-neutral-700 hover:text-black cursor-pointer group"
                    >
                      <Play className="h-4 w-4 text-[#2D3E35] group-hover:scale-110 transition duration-200" />
                      <span>Watch Brand Intro Video</span>
                    </button>
                  </div>
                </div>

                {/* =========================================================================
      CENTER VISUAL MODEL CANVAS (4 COLS) - ANIMASI FOTO PRODUCT
      ========================================================================= */}
                <div className="lg:col-span-4 relative group">
                  {/* Paint stroke background effect behind the model */}
                  <div className="absolute inset-x-0 -top-8 bottom-12 bg-neutral-100 rounded-3xl -z-10 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] border border-neutral-200/40" />

                  {/* 🌟 Wrapper Foto diberi key agar memicu transisi masuk yang halus saat index berubah */}
                  <div
                    key={`image-${currentSlideIndex}`}
                    className="relative aspect-[3/4] w-full max-w-sm mx-auto overflow-hidden rounded-2xl shadow-xl border border-neutral-200 bg-white transition duration-500 group-hover:shadow-2xl"
                    style={{
                      animation:
                        "scaleFadeIn 1.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
                    }}
                  >
                    <img
                      src={
                        activeHero?.image || "https://via.placeholder.com/300"
                      }
                      alt={activeHero?.title || "Product"}
                      className="h-full w-full object-contain p-4 select-none"
                    />

                    {/* Minimal brand logo detail on mockup */}
                    <div className="absolute bottom-4 left-4 right-4 bg-white/75 backdrop-blur-md rounded-xl p-3 border border-white/40 flex items-center justify-between">
                      <div>
                        <p className="font-mono text-[9px] uppercase tracking-wider text-neutral-400">
                          Authentic Spec
                        </p>
                        <p className="font-sans text-xs font-bold text-neutral-800">
                          450GSM Organic Blend
                        </p>
                      </div>
                      <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                  </div>
                </div>

                {/* =========================================================================
      RIGHT ACCESSORIES BLOCK PANEL (3 COLS)
      ========================================================================= */}
                <div className="lg:col-span-3 space-y-6 flex flex-col justify-between self-stretch">
                  {/* Header Mini Indicators & Nav Arrows */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 font-mono text-[10px] font-bold text-neutral-400">
                      {HERO_SLIDES.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setCurrentSlideIndex(index);
                            setSelectedColorIndex(0);
                            setSelectedSize("M");
                            setQuantity(1);
                          }}
                          className={`transition duration-200 px-1 py-0.5 hover:text-neutral-900 font-mono cursor-pointer ${
                            currentSlideIndex === index
                              ? "text-black text-sm border-b-2 border-neutral-900 font-black"
                              : ""
                          }`}
                        >
                          0{index + 1}
                        </button>
                      ))}
                    </div>

                    {/* Nav arrows */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={prevSlide}
                        className="p-2 rounded-full border border-neutral-200 bg-white hover:bg-neutral-50 active:scale-90 shadow-sm transition duration-150 cursor-pointer"
                        aria-label="Previous layout"
                      >
                        <ArrowLeft className="h-4 w-4 text-neutral-700" />
                      </button>
                      <button
                        onClick={nextSlide}
                        className="p-2 rounded-full border border-neutral-200 bg-white hover:bg-neutral-50 active:scale-90 shadow-sm transition duration-150 cursor-pointer"
                        aria-label="Next layout"
                      >
                        <ArrowRight className="h-4 w-4 text-neutral-700" />
                      </button>
                    </div>
                  </div>

                  {/* Prominent dark mini card featuring Accessories block */}
                  <div className="relative rounded-2xl bg-[#1C1C1C] text-[#EAE5D8] p-6 shadow-xl border border-neutral-800 space-y-6 flex-1 flex flex-col justify-between mt-4">
                    <div className="space-y-3">
                      <span className="font-mono text-[9px] uppercase tracking-widest text-[#2D3E35] font-bold bg-[#EAE5D8]/90 px-2 py-0.5 rounded">
                        ACCESSORIES FEATURE
                      </span>
                      <h3 className="font-display font-bold text-2xl tracking-tight text-white leading-tight">
                        Accessories Line
                      </h3>
                      <p className="text-xs text-neutral-400 leading-relaxed font-sans">
                        This collection includes all essential items. Tactical
                        bags feature adjustable webbing straps with metal
                        tension sliders to calibrate absolute comfort.
                      </p>
                    </div>

                    {/* Accessories image overlay inside card */}
                    <div className="relative aspect-video rounded-xl overflow-hidden border border-neutral-800 mt-2">
                      <img
                        src="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=400&auto=format&fit=crop"
                        alt="Accessories line"
                        className="h-full w-full object-cover opacity-85 hover:scale-105 transition duration-300"
                      />
                      <div className="absolute inset-0 bg-neutral-950/20" />
                      <div className="absolute bottom-2 right-2 bg-neutral-900/90 text-[9px] font-mono text-white px-2 py-1 rounded border border-neutral-700">
                        SECURE SYSTEM
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      <span className="font-mono text-xs font-semibold text-neutral-300">
                        $55.20
                      </span>
                      <button
                        onClick={() => {
                          const bagProduct = PRODUCTS.find(
                            (p) => p.id === "RA-TAS-001",
                          );
                          if (bagProduct) {
                            handleAddToCart(
                              bagProduct,
                              "One Size",
                              "Matte Black",
                              1,
                            );
                          } else {
                            showToast("Accessories quick added");
                          }
                        }}
                        className="text-xs font-mono tracking-wider font-bold text-[#EAE5D8] hover:text-white underline flex items-center gap-1.5 cursor-pointer"
                      >
                        QUICK ADD <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* SECTION 2: Grid Banner Triplet Block (New Arrivals, Access, Streetwear) */}
              <section
                id="shop"
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
              >
                {/* arrivals block */}
                <div
                  className="relative rounded-2xl overflow-hidden aspect-video md:aspect-auto md:min-h-[220px] bg-neutral-900 border border-neutral-800 flex flex-col justify-end p-6 text-white group cursor-pointer shadow-md hover:shadow-lg transition"
                  data-aos="fade-up"
                >
                  <img
                    src="https://images.unsplash.com/photo-1517462964-21fdcec3f25b?q=80&w=600"
                    alt="Model look"
                    className="absolute inset-0 h-full w-full object-cover opacity-40 group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-85" />

                  <div className="relative z-10 space-y-1">
                    <h3 className="font-display font-bold text-xl tracking-tight text-white leading-tight">
                      New Arrivals
                    </h3>
                    <p className="text-[10px] text-neutral-300 leading-normal max-w-xs font-sans">
                      Koleksi terbaru gear outdoor untuk petualangan dan
                      perjalanan aktif, selalu hadir dengan performa fungsional.
                    </p>
                    <div className="pt-2 flex items-center gap-1.5 text-[9px] font-mono font-bold tracking-widest text-emerald-400">
                      EXPLORE STYLES <ArrowUpRight className="h-3 w-3" />
                    </div>
                  </div>
                </div>

                {/* accessories block */}
                <div
                  onClick={() => setActiveCategory("Tas & Carrier")}
                  className="relative rounded-2xl overflow-hidden aspect-video md:aspect-auto md:min-h-[220px] bg-neutral-950 border border-neutral-800 flex flex-col justify-end p-6 text-white group cursor-pointer shadow-md hover:shadow-lg transition"
                  data-aos="fade-up"
                  data-aos-delay="150"
                >
                  <img
                    src="https://images.unsplash.com/photo-1544022613-e87ca75a784a?q=80&w=600"
                    alt="Accessories overview"
                    className="absolute inset-0 h-full w-full object-cover opacity-40 group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-85" />

                  <div className="relative z-10 space-y-1">
                    <h3 className="font-display font-bold text-xl tracking-tight text-white leading-tight">
                      Expedition Ready
                    </h3>
                    <p className="text-[10px] text-neutral-300 leading-normal max-w-xs font-sans">
                      Persiapan pendakian yang solid: sistem strap andal, bahan
                      tahan cuaca, dan solusi penyimpanan yang rapi.
                    </p>
                    <div className="pt-2 flex items-center gap-1.5 text-[9px] font-mono font-bold tracking-widest text-[#EAE5D8]">
                      CATALOG EXPAND <ArrowUpRight className="h-3 w-3" />
                    </div>
                  </div>
                </div>

                {/* streetwear block */}
                <div
                  className="bg-neutral-50 rounded-2xl p-6 border border-neutral-200 flex flex-col justify-between shadow-xs"
                  data-aos="fade-up"
                  data-aos-delay="300"
                >
                  <div className="space-y-3">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-400 font-bold block">
                      ABOUT THE BRAND
                    </span>
                    <h3 className="font-display font-bold text-lg text-neutral-900 leading-tight">
                      Outdoor Lifestyle
                    </h3>
                    <p className="text-xs text-neutral-500 leading-relaxed font-sans">
                      Gaya hidup alam bebas yang menempatkan fungsi di depan.
                      Perlengkapan kami mendukung aktifitas lapangan tanpa
                      mengurangi tampilan yang clean dan percaya diri.
                    </p>
                  </div>

                  <div className="pt-4 border-t border-neutral-200/60 flex items-center justify-between text-[10px] font-mono text-neutral-400">
                    <span>EST. 2023 | BANDUNG</span>
                    <span>REPTIL ADVENTURE</span>
                  </div>
                </div>
              </section>

              {/* SECTION 3: Main Dynamic Product Store Catalog (With sidebar Category filters) */}
              <section id="shoes" className="space-y-8 pt-6">
                <div
                  className="border-b border-neutral-100 pb-5"
                  data-aos="fade-right"
                >
                  <h2 className="font-display font-black text-4xl tracking-tight text-neutral-900">
                    Koleksi Gear Reptil Adventure
                  </h2>
                  <p className="text-xs text-neutral-500 mt-1 max-w-xl font-sans">
                    Pilihan perlengkapan outdoor praktis dan tahan lama untuk
                    hiking, traveling, serta aktifitas lapangan Anda.
                  </p>

                  {/* ================= KOLOM PENCARIAN (SEARCH BAR) ================= */}
                  <div className="mt-6 max-w-md relative">
                    <input
                      type="text"
                      placeholder="Cari perlengkapan outdoor Anda... (misal: Carrier, Tenda)"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-4 pr-10 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-sans text-xs font-medium text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 transition"
                    />
                    {searchQuery ? (
                      // Tombol X untuk menghapus pencarian secara instan jika ada teks
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 font-sans text-xs font-bold cursor-pointer"
                      >
                        ✕
                      </button>
                    ) : (
                      // Ikon pencarian bawaan (Gunakan kaca pembesar atau teks biasa jika belum ada ikon)
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 font-sans text-xs pointer-events-none">
                        <search className="h-3 w-3" />
                      </span>
                    )}
                  </div>
                  {/* =============================================================== */}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                  {/* Sidebar Categories Filtering List (3 cols) */}
                  <div className="md:col-span-3 space-y-2 sticky top-[100px]">
                    <span className="block font-mono text-[10px] uppercase tracking-widest text-neutral-400 pl-4 mb-3">
                      Kategori
                    </span>

                    <div className="flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible pb-3 md:pb-0 gap-1.5">
                      {/* 1. TOMBOL LIHAT SEMUA (Tetap hardcoded karena bersifat global) */}
                      <button
                        onClick={() => setActiveCategory("All")}
                        data-aos="fade-right"
                        data-aos-delay="0"
                        className={`px-4 py-3 text-left rounded-xl font-sans text-xs font-semibold tracking-wide transition duration-150 cursor-pointer whitespace-nowrap md:w-full flex items-center justify-between ${
                          activeCategory === "All"
                            ? "bg-neutral-900 text-white shadow-md font-bold"
                            : "bg-white text-neutral-600 hover:bg-neutral-100 hover:text-black border border-neutral-200/60"
                        }`}
                      >
                        <span>Lihat Semua</span>
                        {activeCategory === "All" && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 hidden md:inline-block" />
                        )}
                      </button>

                      {/* 2. LOOPING DATA KATEGORI ASLI DARI DATABASE POSTGRESQL */}
                      {categories.map((categoryItem, index) => {
                        /* 🌟 LOGIKA AUTO-DELAY: Efek animasi berurutan dari atas ke bawah (+1 untuk mengimbangi tombol pertama) */
                        const autoDelay = (index + 1) * 75;

                        // Di database, filter dicari menggunakan ID (misal: 1, 2, 3)
                        const isSelected = activeCategory === categoryItem.id;

                        return (
                          <button
                            key={categoryItem.id}
                            onClick={() => setActiveCategory(categoryItem.id)} // Menyimpan ID kategori yang diklik ke state
                            data-aos="fade-right"
                            data-aos-delay={autoDelay}
                            className={`px-4 py-3 text-left rounded-xl font-sans text-xs font-semibold tracking-wide transition duration-150 cursor-pointer whitespace-nowrap md:w-full flex items-center justify-between ${
                              isSelected
                                ? "bg-neutral-900 text-white shadow-md font-bold"
                                : "bg-white text-neutral-600 hover:bg-neutral-100 hover:text-black border border-neutral-200/60"
                            }`}
                          >
                            <span>{categoryItem.name}</span>
                            {isSelected && (
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 hidden md:inline-block" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Sidebar Quick Fact details */}
                    <div
                      className="hidden md:block bg-[#2D3E35]/5 rounded-2xl p-5 border border-[#2D3E35]/13 mt-6"
                      data-aos="fade-right"
                      data-aos-delay="300"
                    >
                      <div className="flex items-center gap-2 mb-2 text-neutral-800">
                        <Truck className="h-4 w-4" />
                        <span className="font-sans font-bold text-xs">
                          Standard Free Ship
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500 leading-normal font-sans">
                        Pengiriman cepat dari Bandung untuk pemesanan tertentu;
                        cek ketentuan gratis ongkir di halaman checkout.
                      </p>
                    </div>
                  </div>

                  {/* Product Dynamic Grid of Cards (9 cols) */}
                  <div className="md:col-span-9 space-y-6">
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                      {currentProducts.map((p, index) => {
                        const columnsCount = 3;
                        const autoDelay = (index % columnsCount) * 100;

                        return (
                          <div
                            key={p.id}
                            data-aos="zoom-in-up"
                            data-aos-delay={autoDelay}
                            className="group bg-white rounded-xl sm:rounded-2xl border border-neutral-200/70 p-2.5 sm:p-4 transition-all duration-300 hover:shadow-xl hover:border-neutral-300/90 flex flex-col justify-between"
                          >
                            {/* Visual Layer */}
                            <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-neutral-50 border border-neutral-100">
                              <Link
                                to={`/product/${p.id}`}
                                className="relative block aspect-square w-full rounded-xl overflow-hidden bg-neutral-50 border border-neutral-100 cursor-pointer group/img"
                              >
                                <img
                                  src={getProductImage(p)} // 🌟 Panggil fungsi pembantu di sini
                                  alt={p.title || p.name}
                                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                />

                                {p.originalPrice && (
                                  <span className="absolute top-2 left-2 bg-[#2D3E35] text-[#EAE5D8] px-2 py-0.5 rounded font-mono text-[9px] uppercase tracking-wider font-bold shadow">
                                    SALE %
                                  </span>
                                )}

                                <div className="hidden md:flex absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition duration-200 flex flex-col items-center justify-center p-4">
                                  <span className="w-full max-w-[80%] text-center bg-white text-neutral-800 text-[11px] font-bold py-2.5 px-4 rounded-xl shadow transition transform translate-y-2 group-hover/img:translate-y-0 duration-300">
                                    Lihat Detail
                                  </span>
                                </div>
                              </Link>
                            </div>

                            {/* Metadata Content Layer */}
                            <div className="pt-4 space-y-2 flex-1 flex flex-col justify-between">
                              <div>
                                <p className="font-mono text-[9px] uppercase tracking-wider text-neutral-400">
                                  {getCategoryName(p)}
                                </p>
                                <h3 className="font-sans font-semibold text-[#111111] text-sm group-hover:text-neutral-700 transition line-clamp-1 mt-0.5">
                                  {p.name || p.title || "Unnamed Product"}
                                </h3>
                              </div>

                              {/* Pricing Tag */}
                              <div className="flex items-baseline gap-2 pt-1">
                                <span className="font-sans font-bold text-sm text-neutral-950">
                                  Rp.{" "}
                                  {formatRupiah(p.price)
                                    .replace("Rp", "")
                                    .trim()}
                                </span>
                                {p.originalPrice && (
                                  <span className="font-sans line-through text-neutral-400 text-xs text-semibold">
                                    Rp.{" "}
                                    {formatRupiah(p.originalPrice)
                                      .replace("Rp", "")
                                      .trim()}
                                  </span>
                                )}
                              </div>

                              {/* Operational Quick Add Footer */}
                              {/* Container Bawah Kartu Produk - Dioptimalkan untuk Mobile & Desktop */}
                              <div className="pt-3 border-t border-neutral-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
                                {/* Tombol Spec Details: Lebar penuh di mobile, otomatis di desktop */}
                                <button
                                  type="button"
                                  onClick={() => setSelectedQuickViewProduct(p)}
                                  className="text-[10px] font-mono text-neutral-400 hover:text-red-500 hover:underline transition text-center sm:text-left py-1 sm:py-0 shrink-0 uppercase tracking-wider"
                                >
                                  SPEC DETAILS
                                </button>

                                {/* Tombol Add to Cart: Menggunakan padding dan ukuran font yang seimbang */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const activeSz =
                                      p.sizes && p.sizes.length > 0
                                        ? p.sizes[0]
                                        : "Standard";
                                    let activeClr = "Default";
                                    if (p.colors && p.colors.length > 0) {
                                      const firstColor = p.colors[0];
                                      activeClr =
                                        typeof firstColor === "object"
                                          ? firstColor.name
                                          : firstColor;
                                    }
                                    handleAddToCart(p, activeSz, activeClr, 1);
                                  }}
                                  className="w-full sm:w-auto bg-red-600 text-white font-sans font-bold hover:bg-red-500 text-center text-[10px] sm:text-[11px] uppercase tracking-widest sm:tracking-wider py-2.5 px-3.5 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition shadow-md active:scale-95"
                                >
                                  <ShoppingBagIcon className="h-3.5 w-3.5 shrink-0" />
                                  <span>Add to Cart</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Grid Empty Fallback */}
                    {filteredProducts.length === 0 && (
                      <div className="text-center py-16 bg-neutral-50 rounded-2xl border border-dashed border-neutral-200">
                        <p className="text-neutral-500 font-sans font-semibold text-sm">
                          Perlengkapan tidak ditemukan
                        </p>
                        <p className="text-neutral-400 font-sans text-xs mt-1 max-w-xs mx-auto">
                          Tidak ada produk yang cocok dengan "{searchQuery}" di
                          kategori ini. Coba periksa kembali ejaan Anda atau
                          reset filter.
                        </p>
                        <button
                          onClick={() => {
                            setActiveCategory("All");
                            setSearchQuery("");
                          }}
                          className="mt-4 px-4 py-2 bg-neutral-900 text-white rounded-lg font-sans text-xs font-semibold hover:bg-neutral-800 transition cursor-pointer shadow-sm"
                        >
                          Reset Pencarian & Kategori
                        </button>
                      </div>
                    )}

                    {/* ================= BARIS TOMBOL PAGINATION ================= */}
                    {totalPages > 1 && (
                      <div className="flex justify-center items-center gap-1 sm:gap-2 mt-12 mb-8 select-none w-full px-2">
                        {/* Tombol Halaman Sebelumnya */}
                        <button
                          onClick={() =>
                            setCurrentPage((prev) => Math.max(prev - 1, 1))
                          }
                          disabled={currentPage === 1}
                          className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold border transition duration-150 shrink-0 ${
                            currentPage === 1
                              ? "bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed"
                              : "bg-white text-neutral-800 border-neutral-300 hover:bg-neutral-50 cursor-pointer"
                          }`}
                        >
                          Prev
                        </button>

                        {/* Deretan Angka Nomor Halaman */}
                        <div className="flex gap-1 shrink-0">
                          {Array.from({ length: totalPages }, (_, index) => {
                            const pageNumber = index + 1;
                            return (
                              <button
                                key={pageNumber}
                                onClick={() => setCurrentPage(pageNumber)}
                                className={`w-7 h-7 sm:w-10 sm:h-10 rounded-lg text-xs sm:text-sm font-bold transition duration-150 cursor-pointer shrink-0 ${
                                  currentPage === pageNumber
                                    ? "bg-neutral-900 text-white shadow-md scale-105"
                                    : "bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50"
                                }`}
                              >
                                {pageNumber}
                              </button>
                            );
                          })}
                        </div>

                        {/* Tombol Halaman Selanjutnya */}
                        <button
                          onClick={() =>
                            setCurrentPage((prev) =>
                              Math.min(prev + 1, totalPages),
                            )
                          }
                          disabled={currentPage === totalPages}
                          className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold border transition duration-150 shrink-0 ${
                            currentPage === totalPages
                              ? "bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed"
                              : "bg-white text-neutral-800 border-neutral-300 hover:bg-neutral-50 cursor-pointer"
                          }`}
                        >
                          Next
                        </button>
                      </div>
                    )}
                    {/* =========================================================== */}
                  </div>
                </div>
              </section>

              {/* SECTION 4: Durability Bento Grid Block layout */}
              <section
                id="bags"
                className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4"
              >
                {/* Left card: Durability details (5 cols) */}
                <div
                  className="lg:col-span-4 bg-white rounded-2xl p-8 border border-neutral-200 flex flex-col justify-between self-stretch shadow-xs relative overflow-hidden group"
                  data-aos="fade-right"
                >
                  {/* Visual background element */}
                  <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-48 h-48 bg-neutral-100/50 rounded-full -z-10 group-hover:scale-110 transition duration-300" />

                  <div className="space-y-4">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-[#2D3E35] bg-[#2D3E35]/10 px-2 py-0.5 rounded font-bold inline-block">
                      MATERIAL ASSURANCES
                    </span>
                    <h3 className="font-display font-black text-3xl text-neutral-900 leading-tight">
                      Built For Rugged Durability
                    </h3>
                    <p className="text-xs text-neutral-500 leading-relaxed font-sans">
                      Produk Reptil Adventure dibuat dari bahan berkualitas
                      tinggi yang tahan cuaca dan gesekan. Konstruksi jahitan
                      ganda serta material fungsional menjaga kestabilan saat
                      bergerak di berbagai kondisi.
                    </p>
                  </div>

                  <div className="pt-6 space-y-3 border-t border-neutral-100">
                    <div className="flex items-center gap-2.5 text-xs font-semibold text-neutral-800">
                      <ShieldCheck className="h-4.5 w-4.5 text-[#2D3E35]" />
                      <span>Tahan cuaca ekstrem dan kelembapan</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs font-semibold text-neutral-800">
                      <Flame className="h-4.5 w-4.5 text-[#2D3E35]" />
                      <span>
                        Material premium untuk penggunaan jangka panjang
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right card design element: Large Fall Winter graphic banner (8 cols) */}
                <div
                  className="lg:col-span-8 relative rounded-3xl overflow-hidden aspect-video md:aspect-[21/9] lg:aspect-auto self-stretch bg-neutral-950 flex flex-col justify-end p-8 text-neutral-100 group shadow-md hover:shadow-lg transition"
                  data-aos="fade-left"
                  data-aos-delay="150"
                >
                  {/* Ambient image setup */}
                  <img
                    src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200"
                    alt="Model posing on stool in dark hoodie"
                    className="absolute inset-0 h-full w-full object-cover opacity-50 group-hover:scale-105 transition duration-500"
                  />

                  {/* dark overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent" />

                  <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4 items-end justify-between">
                    <div className="space-y-2">
                      <span className="font-mono text-[9px] uppercase tracking-widest text-emerald-400 font-bold block">
                        LIMITED RELEASE - FALL WINTER ISSUE
                      </span>
                      <h3 className="font-display font-black text-4xl text-white leading-tight">
                        Limited Edition
                      </h3>
                      <p className="text-xs text-neutral-300 font-sans max-w-sm">
                        Koleksi edisi terbatas untuk petualang yang mencari gear
                        unik dan fungsional. Stok tetap terbatas, jadi segera
                        cek detailnya.
                      </p>
                    </div>

                    <div className="flex justify-start md:justify-end">
                      <button
                        onClick={() => {
                          const findHoodie = PRODUCTS.find(
                            (p) => p.id === "RA-TEN-001",
                          );
                          if (findHoodie) {
                            setSelectedQuickViewProduct(findHoodie);
                          }
                        }}
                        className="bg-white text-neutral-900 border border-transparent hover:bg-neutral-100 p-4 rounded-xl shadow-lg transition duration-200 cursor-pointer text-xs font-bold tracking-wider uppercase flex items-center gap-2"
                      >
                        GET LIMITED SPEC <ArrowUpRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* SECTION 5: Testimonials Review Block */}
              <section className="bg-white rounded-3xl p-8 border border-neutral-200 shadow-xs space-y-8">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-neutral-100 pb-5">
                  <div data-aos="fade-right">
                    <h2 className="font-display font-black text-3xl text-neutral-900">
                      Customer Testimonials
                    </h2>
                    <p className="text-xs text-neutral-500 font-mono mt-1 uppercase tracking-wide">
                      AUTHENTIC PRODUCT FEEDBACK ROSTER
                    </p>
                  </div>
                  <div
                    data-aos="fade-left"
                    className="flex items-center gap-1 text-[#2D3E35] mt-2 md:mt-0"
                  >
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="h-4.5 w-4.5 fill-current" />
                    ))}
                    <span className="font-mono text-xs font-bold text-neutral-800 ml-2">
                      5.0 Brand Score
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {TESTIMONIALS.map((t) => (
                    <div
                      key={t.id}
                      className="bg-[#FDFDFD] p-6 rounded-2xl border border-neutral-200/80 hover:border-neutral-300 transition duration-300 flex flex-col justify-between space-y-4 shadow-xs"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center gap-0.5 text-[#2D3E35]">
                          {Array.from({ length: t.rating }).map((_, i) => (
                            <Star
                              key={i}
                              className="h-3.5 w-3.5 fill-current"
                            />
                          ))}
                        </div>
                        <p className="text-xs text-neutral-600 leading-relaxed font-sans italic">
                          "{t.review}"
                        </p>
                      </div>

                      <div className="flex items-center gap-3 pt-3 border-t border-neutral-100/60">
                        <img
                          src={t.avatar}
                          alt={t.name}
                          className="h-10 w-10 rounded-full object-cover border border-neutral-200"
                        />
                        <div>
                          <h4 className="font-sans font-bold text-xs text-neutral-900 leading-tight">
                            {t.name}
                          </h4>
                          <p className="text-[10px] text-neutral-400 font-mono tracking-wider">
                            {t.role}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* SECTION 6: Elegant Newsletter & Inline chat Footer card */}
              <section
                id="accessories"
                className="rounded-3xl bg-[#2D3E35] text-white p-8 md:p-12 overflow-hidden relative shadow-2xl border border-neutral-800"
                data-aos="fade-up"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#EAE5D8]/5 rounded-full blur-2xl" />

                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  {/* Left newsletter inputs (7 cols) */}
                  <div className="lg:col-span-6 space-y-6">
                    <div className="space-y-2">
                      <span className="font-mono text-[9px] uppercase tracking-widest text-[#EAE5D8] font-bold block">
                        NEWSLETTER ROSTER
                      </span>
                      <h3 className="font-display font-black text-3xl md:text-5xl tracking-tight text-[#EAE5D8] leading-tight">
                        Subscribe our newsletter
                      </h3>
                      <p className="text-xs text-neutral-300 font-sans max-w-md">
                        Dapatkan update produk outdoor terbaru, promo ongkir
                        Bandung, dan tips pendakian langsung dari tim Reptil
                        Adventure.
                      </p>
                    </div>

                    {/* Newsletter form with validation support */}
                    <form
                      onSubmit={handleNewsletterSubmit}
                      className="flex gap-2 max-w-sm"
                    >
                      <input
                        type="email"
                        required
                        placeholder="Enter Your Mail..."
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        className="flex-grow bg-white/10 text-xs border border-white/20 hover:border-white/30 rounded-xl px-4 py-3 placeholder-neutral-300 text-white focus:outline-none focus:ring-1 focus:ring-white transition"
                      />
                      <button
                        type="submit"
                        className="bg-neutral-950 hover:bg-black uppercase font-mono font-bold tracking-wider text-[10px] px-5 py-3 rounded-xl transition text-[#EAE5D8]"
                      >
                        Join
                      </button>
                    </form>
                  </div>

                  {/* Right Interactive mini communication terminal layout (6 cols) */}
                  <div className="lg:col-span-6">
                    <div className="bg-neutral-950/70 border border-white/10 rounded-2xl p-5 space-y-4 text-neutral-200">
                      <div className="flex items-center justify-between border-b border-white/5 pb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="font-mono text-[10px] uppercase tracking-widest text-[#EAE5D8] font-bold">
                            Direct Messaging Terminal
                          </span>
                        </div>
                        <span className="font-mono text-[9px] text-neutral-500">
                          SSL ENCRYPTED
                        </span>
                      </div>

                      {/* Simulated conversations container */}
                      <div className="h-32 overflow-y-auto space-y-2.5 text-xs font-sans pr-1">
                        {chatReplies.map((chat, idx) => (
                          <div
                            key={idx}
                            className={`flex max-w-[85%] ${chat.sender === "user" ? "ml-auto justify-end" : ""}`}
                          >
                            <div
                              className={`p-3 rounded-xl text-xs leading-normal ${
                                chat.sender === "user"
                                  ? "bg-[#2D3E35] text-white border border-[#2D3E35]/15"
                                  : "bg-neutral-900 text-neutral-300 border border-neutral-800"
                              }`}
                            >
                              {chat.text}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Instant submit widget */}
                      <form
                        onSubmit={handleContactSubmit}
                        className="flex gap-2"
                      >
                        <input
                          type="text"
                          required
                          placeholder="Wrlte messege..."
                          value={contactMessage}
                          onChange={(e) => setContactMessage(e.target.value)}
                          className="flex-grow bg-[#111111] border border-white/15 hover:border-white/20 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none placeholder-neutral-500 font-sans"
                        />
                        <button
                          type="submit"
                          className="bg-[#2D3E35] border border-neutral-800 text-white p-2.5 rounded-xl hover:bg-emerald-800 transition cursor-pointer flex items-center justify-center"
                          title="Send Terminal Message"
                        >
                          <Send className="h-3.5 w-3.5" />
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </section>
            </main>
          }
        />
        {/* // 🔄 Sesuaikan bagian Route ini: */}
        {/* 🔄 KODE BARU (Tambahkan products={products}): */}
        <Route
          path="/products"
          element={
            <AllProducts
              handleAddToCart={handleAddToCart}
              formatRupiah={formatRupiah}
              globalSearchQuery={globalSearchQuery}
              setGlobalSearchQuery={setGlobalSearchQuery}
              // 🌟 KIRIMKAN STATE DARI APP.JSX KE SINI
              products={products}
              categories={categories}
              loading={loading}
            />
          }
        />

        <Route
          path="/product/:id"
          element={
            <ProductDetail
              handleAddToCart={handleAddToCart}
              formatRupiah={formatRupiah}
              products={products} // 🌟 Tambahkan baris ini
            />
          }
        />

        <Route
          path="/checkout"
          element={
            <Checkout
              cart={cart}
              formatRupiah={formatRupiah}
              clearCart={clearCart} // Pastikan fungsi pengosongan cart setelah bayar dialirkan
            />
          }
        />
      </Routes>
      {/* Modern minimal footer branding */}
      <Footer />

      {/* ================= MODAL SEARCH OVERLAY ================= */}
      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onSearchSubmit={handleGlobalSearchSubmit}
      />
      {/* ======================================================== */}

      {/* Floating AI Cyber Stylist Chat Overlay Widget Component */}
      <AiStylist cartCount={cartCount} />

      {/* Brand Teaser Watch Intro Film Modal Component */}
      <WatchIntroModal isOpen={introOpen} onClose={() => setIntroOpen(false)} />

      {/* Secure Slide-over Shopping Cart Menu Drawer Component */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeItem}
        onCheckout={() => {
          setCartOpen(false); // Tutup drawer terlebih dahulu
          navigate("/checkout"); // Lemparkan user ke halaman checkout
        }}
      />

      {/* Interactive Products Detail Quick View Overlay Panel Component */}
      {selectedQuickViewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-neutral-950/70 backdrop-blur-xs transition-opacity"
            onClick={() => setSelectedQuickViewProduct(null)}
          />

          <div className="relative bg-[#F9F9F7] text-neutral-900 rounded-3xl border border-neutral-200 shadow-2xl overflow-hidden w-full max-w-2xl max-h-[90vh] flex flex-col md:flex-row">
            {/* Left Image aspect */}
            <div className="md:w-1/2 relative bg-neutral-50 min-h-[250px] md:min-h-0">
              {/* // 🔄 Cari tag <img> di dalam modal Quick View dan ubah menjadi: */}
              <img
                src={getProductImage(selectedQuickViewProduct)} // 🌟 Panggil fungsi pembantu di sini
                alt={
                  selectedQuickViewProduct.title ||
                  selectedQuickViewProduct.name
                }
                className="h-full w-full object-cover"
              />
              <button
                onClick={() => setSelectedQuickViewProduct(null)}
                className="absolute top-4 left-4 bg-white/90 hover:bg-white rounded-full p-1.5 shadow"
              >
                <X className="h-4 w-4 text-neutral-700 hover:text-black" />
              </button>
            </div>

            {/* Right Information detail breakdown */}
            <div className="md:w-1/2 p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded font-bold">
                      {typeof selectedQuickViewProduct.category === "object" &&
                      selectedQuickViewProduct.category !== null
                        ? selectedQuickViewProduct.category.name
                        : selectedQuickViewProduct.category || "No Category"}
                    </span>
                    <h3 className="font-sans font-bold text-xl text-neutral-900 tracking-tight mt-1">
                      {selectedQuickViewProduct.name ||
                        selectedQuickViewProduct.title ||
                        "Unnamed Product"}
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedQuickViewProduct(null)}
                    className="hidden md:block text-neutral-400 hover:text-black transition"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex items-baseline gap-2 pt-1">
                  <span className="font-sans font-black text-lg text-neutral-950">
                    Rp.{" "}
                    {formatRupiah(selectedQuickViewProduct.price)
                      .replace("Rp", "")
                      .trim()}
                  </span>
                  {selectedQuickViewProduct.originalPrice && (
                    <span className="font-sans line-through text-neutral-400 text-xs text-semibold">
                      Rp.{" "}
                      {formatRupiah(selectedQuickViewProduct.originalPrice)
                        .replace("Rp", "")
                        .trim()}
                    </span>
                  )}
                </div>

                <p className="text-xs text-neutral-600 leading-relaxed font-sans pt-1">
                  {selectedQuickViewProduct.description}
                </p>

                {/* Features Roster list if exists */}
                {selectedQuickViewProduct.features && (
                  <div className="space-y-1.5 pt-2">
                    <span className="block font-mono text-[9px] uppercase tracking-widest text-[#2D3E35] font-bold">
                      PRODUCT HIGHLIGHT DESIGN:
                    </span>
                    <ul className="text-neutral-600 text-[11px] list-disc list-inside space-y-1">
                      {selectedQuickViewProduct.features.map((feat, i) => (
                        <li key={i}>{feat}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Add actions widget inside Quick View */}
              <div className="pt-4 border-t border-neutral-200">
                <button
                  onClick={() => {
                    const activeSz = selectedQuickViewProduct.sizes
                      ? selectedQuickViewProduct.sizes[0]
                      : "One Size";
                    const activeClr = selectedQuickViewProduct.colors
                      ? selectedQuickViewProduct.colors[0].name
                      : "Default";
                    handleAddToCart(
                      selectedQuickViewProduct,
                      activeSz,
                      activeClr,
                      1,
                    );
                    setSelectedQuickViewProduct(null);
                  }}
                  className="w-full bg-neutral-900 text-white font-sans font-bold hover:bg-neutral-800 text-center text-xs uppercase tracking-wider py-3 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition shadow"
                >
                  <ShoppingBagIcon className="h-4 w-4" /> Add Item To Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
// 🔑 JADIKAN INI SEBAGAI EXPORT DEFAULT DI PALING BAWAH FILE
export default function AppRouter() {
  return (
    // <Router>
    <Routes>
      {/* 🗺️ Saat akses http://localhost:3000/ maka fungsi Catalog() di atas yang akan muncul */}
      <Route path="/*" element={<Catalog />} /> {/* 🌟 Ubah / menjadi /* */}
      <Route path="/events" element={<EventPage />} />
      <Route path="/about" element={<AboutPage />} />
      // Contoh pendaftaran route baru jika menggunakan react-router-dom:
      <Route path="/order-success" element={<OrderSuccess />} />
      {/* 🔑 Saat akses http://localhost:3000/admin/login */}
      <Route path="/login" element={<AdminLogin />} />
      {/* 🔒 Saat akses http://localhost:3000/admin/dashboard */}
      {/* 🔒 Jalur Dashboard Admin yang Asli */}
      <Route path="/admin/dashboard" element={<Dashboard />} />
      <Route path="/admin/categories" element={<CategoryManager />} />
      <Route path="/admin/products" element={<ProductManager />} />
      <Route path="/admin/products/import" element={<ProductManager />} />
      <Route path="/admin/orders" element={<AdminOrders />} />
      {/* Route Terproteksi (Hanya untuk user yang sudah login) */}
      <Route
        path="/account"
        element={
          <ProtectedRoute>
            <UserAccount />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
