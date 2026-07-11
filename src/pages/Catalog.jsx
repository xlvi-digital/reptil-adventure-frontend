import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Play,
  Minus,
  Plus,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Search,
  Truck,
  ShoppingBagIcon,
  Star,
  ShieldCheck,
  Flame,
  Send,
} from "lucide-react";

export default function Catalog({
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
}) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const activeHero = HERO_SLIDES[currentSlideIndex];

  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState("M");
  const [quantity, setQuantity] = useState(1);

  const [emailInput, setEmailInput] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [chatReplies, setChatReplies] = useState([
    {
      sender: "system",
      text: "Hey there! Drop your email or message us directly here.",
    },
  ]);

  useEffect(() => {
    const autoplayTimer = setInterval(() => {
      setCurrentSlideIndex((prevIndex) => (prevIndex + 1) % HERO_SLIDES.length);
      setSelectedColorIndex(0);
      setSelectedSize("M");
      setQuantity(1);
    }, 60000);
    return () => clearInterval(autoplayTimer);
  }, [HERO_SLIDES.length]);

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

  if (!activeHero) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xs text-neutral-500">
        Memuat halaman katalog...
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
      {/* SECTION 1: Dynamic Hero Interactive Showcase */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative overflow-hidden min-h-[650px] lg:min-h-[550px]">
        <div className="lg:col-span-5 space-y-8 pr-2 transition-all duration-700 ease-out animate-fade-in-up">
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
              {activeHero?.colors?.[selectedColorIndex]?.name || "Standard"}
            </strong>
          </span>
          <div className="flex items-center gap-3">
            {activeHero.colors?.map((color, index) => (
              <button
                key={color.name}
                onClick={() => setSelectedColorIndex(index)}
                className={`h-6 w-6 rounded-full border-2 transition-all duration-200 cursor-pointer ${selectedColorIndex === index ? "border-neutral-900 scale-110 shadow-md ring-2 ring-neutral-300 ring-offset-2" : "border-transparent shadow-xs"}`}
                style={{ backgroundColor: color.hex }}
                title={color.name}
              />
            ))}
          </div>
          <div className="space-y-3">
            <span className="block font-mono text-[10px] uppercase tracking-widest text-[#111111]">
              Size Selection
            </span>
            <div className="flex flex-wrap gap-2.5">
              {activeHero.sizes?.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`font-mono text-xs px-3.5 py-2.5 rounded-lg border transition duration-150 cursor-pointer min-w-[42px] font-semibold ${selectedSize === size ? "bg-neutral-900 text-white border-neutral-900 shadow-md" : "bg-white hover:bg-neutral-50 text-neutral-700 border-neutral-200"}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
            <div className="flex items-center justify-between border border-neutral-200 rounded-xl bg-white p-1 sm:w-32 shadow-xs">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="p-2 text-neutral-500 hover:text-black rounded-lg"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="font-mono text-sm font-bold text-neutral-900 px-2">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="p-2 text-neutral-500 hover:text-black rounded-lg"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <button
              onClick={() =>
                handleAddToCart(
                  {
                    id: activeHero.id,
                    title: `${activeHero.name} ${activeHero.subtitle}`,
                    price: activeHero.price,
                    image: activeHero.image,
                    category: "Pakaian",
                    description: activeHero.description,
                  },
                  selectedSize,
                  activeHero.colors[selectedColorIndex]?.name || "Standard",
                  quantity,
                )
              }
              className="flex-1 bg-neutral-900 text-white text-xs font-semibold uppercase tracking-wider px-6 py-4 rounded-xl hover:bg-neutral-800 transition shadow-lg text-center cursor-pointer"
            >
              Add To Cart — Rp.{" "}
              {formatRupiah(activeHero.price * quantity)
                .replace("Rp", "")
                .trim()}
            </button>
          </div>
        </div>
        <div className="lg:col-span-4 relative group">
          <div className="absolute inset-x-0 -top-8 bottom-12 bg-neutral-100 rounded-3xl -z-10 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] border border-neutral-200/40" />
          <div className="relative aspect-[3/4] w-full max-w-sm mx-auto overflow-hidden rounded-2xl shadow-xl border border-neutral-200 bg-white">
            <img
              src={activeHero?.image || "https://via.placeholder.com/300"}
              alt={activeHero?.title || "Product"}
              className="h-full w-full object-contain p-4 select-none"
            />
          </div>
        </div>
        <div className="lg:col-span-3 space-y-6 flex flex-col justify-between self-stretch">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 font-mono text-[10px] font-bold text-neutral-400">
              {HERO_SLIDES.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlideIndex(index)}
                  className={`transition px-1 py-0.5 ${currentSlideIndex === index ? "text-black text-sm border-b-2 border-neutral-900 font-black" : ""}`}
                >
                  0{index + 1}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={prevSlide}
                className="p-2 rounded-full border border-neutral-200 bg-white"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <button
                onClick={nextSlide}
                className="p-2 rounded-full border border-neutral-200 bg-white"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="relative rounded-2xl bg-[#1C1C1C] text-[#EAE5D8] p-6 shadow-xl space-y-6 flex-1 flex flex-col justify-between mt-4">
            <div className="space-y-3">
              <span className="font-mono text-[9px] uppercase tracking-widest text-[#2D3E35] font-bold bg-[#EAE5D8]/90 px-2 py-0.5 rounded">
                ACCESSORIES FEATURE
              </span>
              <h3 className="font-display font-bold text-2xl text-white leading-tight">
                Accessories Line
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                This collection includes all essential items.
              </p>
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
                  if (bagProduct)
                    handleAddToCart(bagProduct, "One Size", "Matte Black", 1);
                }}
                className="text-xs font-mono font-bold text-[#EAE5D8] underline flex items-center gap-1.5"
              >
                QUICK ADD <Plus className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: Grid Banner Triplet Block */}
      <section id="shop" className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          className="relative rounded-2xl overflow-hidden min-h-[220px] bg-neutral-900 p-6 text-white group flex flex-col justify-end"
          data-aos="fade-up"
        >
          <img
            src="https://images.unsplash.com/photo-1517462964-21fdcec3f25b?q=80&w=600"
            className="absolute inset-0 h-full w-full object-cover opacity-40"
            alt=""
          />
          <div className="relative z-10 space-y-1">
            <h3 className="text-xl font-bold">New Arrivals</h3>
            <div className="text-[9px] font-mono font-bold text-emerald-400 flex items-center gap-1">
              EXPLORE STYLES <ArrowUpRight className="h-3 w-3" />
            </div>
          </div>
        </div>
        <div
          onClick={() => setActiveCategory("Tas & Carrier")}
          className="relative rounded-2xl overflow-hidden min-h-[220px] bg-neutral-950 p-6 text-white group flex flex-col justify-end cursor-pointer"
          data-aos="fade-up"
          data-aos-delay="150"
        >
          <img
            src="https://images.unsplash.com/photo-1544022613-e87ca75a784a?q=80&w=600"
            className="absolute inset-0 h-full w-full object-cover opacity-40"
            alt=""
          />
          <div className="relative z-10 space-y-1">
            <h3 className="text-xl font-bold">Expedition Ready</h3>
            <div className="text-[9px] font-mono font-bold text-[#EAE5D8] flex items-center gap-1">
              CATALOG EXPAND <ArrowUpRight className="h-3 w-3" />
            </div>
          </div>
        </div>
        <div
          className="bg-neutral-50 rounded-2xl p-6 border flex flex-col justify-between"
          data-aos="fade-up"
          data-aos-delay="300"
        >
          <div className="space-y-3">
            <span className="font-mono text-[9px] text-neutral-400 font-bold block">
              ABOUT THE BRAND
            </span>
            <h3 className="text-lg font-bold text-neutral-900">
              Outdoor Lifestyle
            </h3>
            <p className="text-xs text-neutral-500">
              Gaya hidup alam bebas yang menempatkan fungsi di depan.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 3: Main Dynamic Product Store Catalog */}
      <section id="shoes" className="space-y-8 pt-6">
        <div className="border-b pb-5" data-aos="fade-right">
          <h2 className="text-4xl font-black text-neutral-900">
            Koleksi Gear Reptil Adventure
          </h2>
          <div className="mt-6 max-w-md relative">
            <input
              type="text"
              placeholder="Cari perlengkapan outdoor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-10 py-2.5 bg-neutral-50 border rounded-xl text-xs focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          <div className="md:col-span-3 space-y-2 sticky top-[100px]">
            <span className="block font-mono text-[10px] text-neutral-400 pl-4 mb-3">
              Kategori
            </span>
            <div className="flex flex-row md:flex-col overflow-x-auto gap-1.5">
              <button
                onClick={() => setActiveCategory("All")}
                className={`px-4 py-3 text-left rounded-xl text-xs font-semibold md:w-full flex items-center justify-between ${activeCategory === "All" ? "bg-neutral-900 text-white shadow-md" : "bg-white text-neutral-600 border"}`}
              >
                <span>Lihat Semua</span>
              </button>
              {categories.map((cat, idx) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-3 text-left rounded-xl text-xs font-semibold md:w-full flex items-center justify-between ${activeCategory === cat.id ? "bg-neutral-900 text-white shadow-md" : "bg-white text-neutral-600 border"}`}
                >
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-9 space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
              {currentProducts.map((p) => (
                <div
                  key={p.id}
                  data-aos="zoom-in-up"
                  className="group bg-white rounded-2xl border p-4 flex flex-col justify-between shadow-xs"
                >
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-neutral-50 border">
                    <Link
                      to={`/product/${p.id}`}
                      className="block h-full w-full"
                    >
                      <img
                        src={getProductImage(p)}
                        alt={p.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    </Link>
                  </div>
                  <div className="pt-4 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="font-mono text-[9px] text-neutral-400">
                        {getCategoryName(p)}
                      </p>
                      <h3 className="font-bold text-[#111111] text-sm line-clamp-1">
                        {p.name || p.title}
                      </h3>
                    </div>
                    <div className="font-bold text-sm text-neutral-950">
                      Rp. {formatRupiah(p.price).replace("Rp", "").trim()}
                    </div>
                    <div className="pt-3 border-t flex items-center justify-between gap-2">
                      <button
                        onClick={() => setSelectedQuickViewProduct(p)}
                        className="text-[10px] font-mono text-neutral-400 hover:underline"
                      >
                        SPEC DETAILS
                      </button>
                      <button
                        onClick={() =>
                          handleAddToCart(p, "Standard", "Default", 1)
                        }
                        className="bg-red-600 text-white text-[10px] py-2 px-3 rounded-lg flex items-center gap-1.5 font-bold"
                      >
                        <ShoppingBagIcon className="h-3 w-3" /> Add
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-16 bg-neutral-50 rounded-2xl border border-dashed">
                <p className="text-neutral-500 text-sm font-semibold">
                  Perlengkapan tidak ditemukan
                </p>
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg text-xs border bg-white"
                >
                  Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold ${currentPage === i + 1 ? "bg-neutral-900 text-white" : "bg-white border"}`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg text-xs border bg-white"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 4: Bento Grid & Section 5: Testimonials dst (Disederhanakan untuk efisiensi ruang) */}
      <section className="bg-white rounded-3xl p-8 border space-y-4">
        <h3 className="text-xl font-bold">What Our Customers Say</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {TESTIMONIALS.map((t) => (
            <div key={t.id} className="p-4 border rounded-xl bg-neutral-50">
              <p className="text-xs italic text-neutral-600">"{t.review}"</p>
              <h4 className="text-xs font-bold mt-2">- {t.name}</h4>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
