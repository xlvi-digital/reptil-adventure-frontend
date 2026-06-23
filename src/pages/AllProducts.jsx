import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ShoppingBagIcon, Search, ArrowUpDown, Layers } from "lucide-react";

const BASE_URL = "http://localhost:8080";

export default function AllProducts({
  handleAddToCart,
  formatRupiah,
  products = [],
  categories = [],
  loading = false,
  globalSearchQuery = "", // Menerima data pencarian murni dari App.jsx
}) {
  // STATE FILTER, SEARCH, & SORTIR LOKAL
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [selectedQuickViewProduct, setSelectedQuickViewProduct] =
    useState(null);

  // 💡 BARIS "const [globalSearchQuery, setGlobalSearchQuery] = useState('');" YANG DUPLIKAT SUDAH DIHAPUS DARI SINI

  const getProductImage = (product) => {
    const defaultPlaceholder =
      "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=500&q=80";
    if (!product) return defaultPlaceholder;

    let rawImage = product.image || product.image_url;
    if (!rawImage) return defaultPlaceholder;

    const combineUrl = (base, path) => {
      if (!path) return defaultPlaceholder;
      if (path.startsWith("http")) return path;
      const cleanBase = base.endsWith("/") ? base.slice(0, -1) : base;
      const cleanPath = path.startsWith("/") ? path : `/${path}`;
      return `${cleanBase}${cleanPath}`;
    };

    if (typeof rawImage === "object" && rawImage !== null) {
      if (rawImage.primary) return combineUrl(BASE_URL, rawImage.primary);
    }

    if (typeof rawImage === "string") {
      const trimmed = rawImage.trim();
      if (trimmed.startsWith("{")) {
        try {
          const parsed = JSON.parse(trimmed);
          if (parsed && parsed.primary)
            return combineUrl(BASE_URL, parsed.primary);
        } catch (error) {
          console.error(
            "Gagal melakukan JSON.parse pada gambar produk:",
            error,
          );
        }
      }
      if (trimmed.startsWith("http")) return trimmed;
      return combineUrl(BASE_URL, trimmed);
    }

    return defaultPlaceholder;
  };

  const getCategoryName = (product) => {
    const match = categories.find(
      (c) =>
        String(c.id) === String(product.category_id) ||
        String(c.id) === String(product.category),
    );
    return match ? match.name : "Reptil";
  };

  const location = useLocation();

  // 🌟 2. BACA URL (?search=...) BEGITU HALAMAN DIKUNJUNGI / BERUBAH
  useEffect(() => {
    // Ambil query parameter dari URL (misal: ?search=tas)
    const params = new URLSearchParams(location.search);
    const searchParam = params.get("search");

    if (searchParam) {
      // Masukkan kata kunci dari navbar tadi ke dalam kotak pencarian halaman produk
      setSearchQuery(searchParam);
    }
  }, [location.search]); // Akan berjalan ulang setiap kali URL berubah

  // 🌟 LOGIKA UTAMA: GABUNGKAN SEARCH GLOBAL & LOKAL
  const finalSearchKeyword = searchQuery || globalSearchQuery;

  const filteredAndSortedProducts = products
    .filter((p) => {
      // 1. FILTER KATEGORI
      const matchesCategory =
        activeCategory === "All" ||
        String(p.category_id) === String(activeCategory) ||
        String(p.category) === String(activeCategory);

      // 2. FILTER PENCARIAN
      const productName = p.name || p.title || "";
      const productDesc = p.description || "";

      return (
        matchesCategory &&
        (productName.toLowerCase().includes(finalSearchKeyword.toLowerCase()) ||
          productDesc.toLowerCase().includes(finalSearchKeyword.toLowerCase()))
      );
    })
    .sort((a, b) => {
      // 3. LOGIKA SORTIR
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      return b.id - a.id;
    });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-neutral-400 font-sans text-xs uppercase tracking-widest bg-white">
        Memuat Produk Dari Database...
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* SEKSI HEADER & TAMPILAN KATEGORI */}
      <div className="bg-neutral-50 rounded-2xl p-6 border border-neutral-100 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 font-sans">
            Katalog Perlengkapan
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            Temukan produk reptile adventure terbaik dan teruji.
          </p>
        </div>

        {/* Filter Kategori */}
        <div className="space-y-2">
          <label className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-neutral-400">
            <Layers className="h-3 w-3" /> Filter Kategori
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCategory("All")}
              className={`px-4 py-2 rounded-xl font-sans text-xs font-medium tracking-wide transition cursor-pointer border ${
                activeCategory === "All"
                  ? "bg-neutral-900 text-white border-neutral-900 shadow-sm font-semibold"
                  : "bg-white text-neutral-600 hover:bg-neutral-100 border-neutral-200"
              }`}
            >
              Semua Produk
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-xl font-sans text-xs font-medium tracking-wide transition cursor-pointer border ${
                  activeCategory === cat.id
                    ? "bg-neutral-900 text-white border-neutral-900 shadow-sm font-semibold"
                    : "bg-white text-neutral-600 hover:bg-neutral-100 border-neutral-200"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* BAR PENCARIAN INTERNAL & DROPDOWN SORTIR */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-neutral-200/60">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Cari produk reptil di sini..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs font-sans text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400 focus:border-neutral-400 transition"
            />
          </div>

          <div className="relative min-w-[180px]">
            <ArrowUpDown className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full pl-10 pr-8 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs font-sans text-neutral-700 font-medium focus:outline-none focus:ring-1 focus:ring-neutral-400 cursor-pointer appearance-none"
            >
              <option value="latest">Produk Terbaru</option>
              <option value="price-asc">Harga: Rendah ke Tinggi</option>
              <option value="price-desc">Harga: Tinggi ke Rendah</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid Produk (4 Kolom di Desktop) */}
      <div className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredAndSortedProducts.map((p, index) => {
            // 🌟 Diubah ke 4 agar delay animasi AOS sesuai dengan grid baru Anda
            const columnsCount = 4;
            const autoDelay = (index % columnsCount) * 100;

            return (
              <div
                key={p.id}
                data-aos="zoom-in-up"
                data-aos-delay={autoDelay}
                className="group bg-white rounded-2xl border border-neutral-200/70 p-3 sm:p-4 transition-all duration-300 hover:shadow-xl hover:border-neutral-300/90 flex flex-col justify-between"
              >
                {/* Visual Image Layer */}
                <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-neutral-50 border border-neutral-100">
                  <Link
                    to={`/product/${p.id}`}
                    className="relative block aspect-square w-full rounded-xl overflow-hidden cursor-pointer group/img"
                  >
                    <img
                      src={getProductImage(p)}
                      alt={p.name || p.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      onError={(e) => {
                        e.target.src =
                          "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=500&q=80";
                      }}
                    />
                    <div className="hidden md:flex absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition duration-200 flex flex-col items-center justify-center p-4">
                      <span className="w-full max-w-[80%] text-center bg-white text-neutral-800 text-[11px] font-bold py-2.5 px-4 rounded-xl shadow transition transform translate-y-2 group-hover/img:translate-y-0 duration-300">
                        Lihat Detail
                      </span>
                    </div>
                  </Link>
                </div>

                {/* Content Metadata */}
                <div className="pt-4 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-wider text-neutral-400">
                      {getCategoryName(p)}
                    </p>
                    <Link to={`/product/${p.id}`} className="block">
                      <h3 className="font-sans font-semibold text-[#111111] text-sm group-hover:text-neutral-700 transition line-clamp-1 mt-0.5">
                        {p.name || p.title || "Unnamed Product"}
                      </h3>
                    </Link>
                  </div>

                  {/* Harga */}
                  <div className="flex items-baseline gap-2 pt-1">
                    <span className="font-sans font-bold text-sm text-neutral-950">
                      Rp.{" "}
                      {formatRupiah
                        ? formatRupiah(p.price).replace("Rp", "").trim()
                        : p.price}
                    </span>
                  </div>

                  {/* Footer Tombol Aksi */}
                  <div className="pt-3 border-t border-neutral-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
                    <button
                      type="button"
                      onClick={() => setSelectedQuickViewProduct(p)}
                      className="text-[10px] font-mono text-neutral-400 hover:text-neutral-800 hover:underline transition text-center sm:text-left py-1 sm:py-0 shrink-0 uppercase tracking-wider"
                    >
                      SPEC DETAILS
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const activeSz =
                          p.sizes && p.sizes.length > 0
                            ? p.sizes[0]
                            : "Standard";
                        const activeClr =
                          p.colors && p.colors.length > 0
                            ? p.colors[0]
                            : "Default";
                        handleAddToCart(p, activeSz, activeClr, 1);
                      }}
                      className="w-full sm:w-auto bg-neutral-900 text-white font-sans font-bold hover:bg-neutral-800 text-center text-[10px] sm:text-[11px] uppercase tracking-widest py-2.5 px-3.5 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition shadow-md active:scale-95"
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

        {/* Kondisi Jika Hasil Pencarian / Filter Kosong */}
        {filteredAndSortedProducts.length === 0 && (
          <div className="text-center py-16 bg-neutral-50 rounded-2xl border border-dashed border-neutral-200">
            <p className="text-neutral-500 font-sans font-semibold text-sm">
              Produk tidak ditemukan
            </p>
            <p className="text-neutral-400 font-sans text-xs mt-1 max-w-xs mx-auto">
              Tidak ada produk yang cocok dengan kata kunci atau filter kategori
              saat ini.
            </p>
            <button
              onClick={() => {
                setActiveCategory("All");
                setSearchQuery("");
                setSortBy("latest");
              }}
              className="mt-4 px-4 py-2 bg-neutral-900 text-white rounded-lg font-sans text-xs font-semibold hover:bg-neutral-800 transition cursor-pointer shadow-sm"
            >
              Reset Filter & Pencarian
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
