import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { ShoppingBag, Search, Menu, X, User, ArrowRight } from "lucide-react";
import Logo from "../../assets/images/logo.png";

export default function Navbar({ cartCount, onCartOpen, onSearchOpen }) {
  // State lokal untuk membuka/menutup Hamburger Menu di mobile
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigate = useNavigate();

  // Cek status login secara real-time dari localStorage
  const isAuthenticated = localStorage.getItem("token") !== null;

  // Handler klik tombol akun (berlaku untuk Desktop & Mobile)
  const handleAccountClick = () => {
    setMobileMenuOpen(false); // Pastikan drawer tertutup jika diklik dari mobile
    if (isAuthenticated) {
      navigate("/account"); // Jika sudah login, bawa ke halaman akun & tracking
    } else {
      navigate("/login"); // Jika belum login, paksa ke halaman login
    }
  };

  return (
    <>
      <nav className="fixed top-0 inset-x-0 h-16 bg-white/80 backdrop-blur-md border-b border-neutral-100 z-40 px-4 md:px-8 flex items-center justify-between select-none">
        {/* LEFT: Brand Logo */}
        <div className="font-display font-black text-lg tracking-tight text-neutral-900">
          <img src={Logo} alt="Logo" className="h-15 w-auto" />
        </div>

        {/* CENTER: Desktop Navigation Links (Hanya muncul di desktop) */}
        <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-neutral-600">
          <Link
            to="/"
            className="hover:text-neutral-600 transition font-medium text-sm"
          >
            HOME
          </Link>
          <Link
            to="/products"
            className="hover:text-neutral-600 transition font-medium text-sm"
          >
            KATALOG GEAR
          </Link>
          <Link
            to="/events"
            className="hover:text-neutral-600 transition font-medium text-sm"
          >
            EVENT
          </Link>
          <Link
            to="/about"
            className="hover:text-neutral-600 transition font-medium text-sm"
          >
            TENTANG KAMI
          </Link>
        </div>

        {/* RIGHT: Action Icons */}
        <div className="flex items-center gap-1 md:gap-2">
          {/* 1. Tombol Search (Muncul di semua device) */}
          <button
            onClick={onSearchOpen}
            className="p-2 text-neutral-700 hover:text-black transition cursor-pointer"
            title="Cari Produk"
          >
            <Search className="h-5 w-5" />
          </button>

          {/* 2. Tombol User Profile (Hanya muncul di DESKTOP - Terintegrasi dengan Alur Auth) */}
          <button
            onClick={handleAccountClick}
            className="hidden md:block p-2 text-neutral-600 hover:text-black hover:bg-neutral-50 rounded-full transition cursor-pointer"
            title={isAuthenticated ? "Akun Saya" : "Masuk / Registrasi"}
          >
            <User className="h-5 w-5" />
          </button>

          {/* 3. Tombol Cart (Muncul di semua device) */}
          <button
            onClick={onCartOpen}
            className="p-2 text-neutral-600 hover:text-black hover:bg-neutral-50 rounded-full transition relative cursor-pointer"
            title="Keranjang Belanja"
          >
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 bg-neutral-900 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>

          {/* 4. Tombol Hamburger Menu (Hanya muncul di MOBILE) */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="block md:hidden p-2 text-neutral-600 hover:text-black hover:bg-neutral-50 rounded-full transition cursor-pointer"
            title="Buka Menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </nav>

      {/* ================= MOBILE MENU DRAWER OVERLAY ================= */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex justify-end">
          {/* Backdrop gelap transparan di luar menu */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Panel Menu Samping */}
          <div className="relative w-72 h-full bg-white shadow-2xl flex flex-col p-6 z-10 animate-in slide-in-from-right duration-300">
            {/* Header Drawer */}
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4 mb-6">
              <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">
                reptil adventure
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 text-neutral-500 hover:text-black rounded-lg bg-neutral-50 hover:bg-neutral-100 transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Menu Navigasi Link Lainnya */}
            <div className="flex-1 flex flex-col gap-1.5">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 text-neutral-700 font-sans font-semibold text-sm rounded-xl hover:bg-neutral-50 hover:text-black transition flex items-center justify-between"
              >
                <span className="uppercase">Home</span>
                <ArrowRight className="h-3.5 w-3.5 text-neutral-300" />
              </Link>
              <Link
                to="/products"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 text-neutral-700 font-sans font-semibold text-sm rounded-xl hover:bg-neutral-50 hover:text-black transition flex items-center justify-between"
              >
                <span className="uppercase">Katalog Gear</span>
                <ArrowRight className="h-3.5 w-3.5 text-neutral-300" />
              </Link>
              <Link
                to="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 text-neutral-700 font-sans font-semibold text-sm rounded-xl hover:bg-neutral-50 hover:text-black transition flex items-center justify-between"
              >
                <span className="uppercase">Tentang Kami</span>
                <ArrowRight className="h-3.5 w-3.5 text-neutral-300" />
              </Link>

              {/* 🌟 USER MENU (Tampilan Mobile - Sekarang Terintegrasi dengan Fungsi handleAccountClick) */}
              <div className="border-t border-neutral-100 mt-4 pt-4">
                <button
                  onClick={handleAccountClick}
                  className="w-full px-4 py-3 bg-neutral-50 text-neutral-800 font-sans font-bold text-xs rounded-xl hover:bg-neutral-900 hover:text-white transition flex items-center gap-3 cursor-pointer"
                >
                  <User className="h-4 w-4" />
                  <span>
                    {isAuthenticated ? "Akun Profil Saya" : "Masuk ke Akun"}
                  </span>
                </button>
              </div>
            </div>

            {/* Footer Mini di dalam Drawer */}
            <div className="text-[10px] text-neutral-400 font-mono tracking-wider pt-4 border-t border-neutral-50 text-center">
              XLVI-DIGITAL MOBILE CORE
            </div>
          </div>
        </div>
      )}
    </>
  );
}
