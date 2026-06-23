import React from "react";
import { useNavigate } from "react-router-dom";
import { Sun, Moon, Eye, Plus } from "lucide-react";

export default function Navbar({ darkMode, setDarkMode }) {
  const navigate = useNavigate();

  return (
    <header
      className={`flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-12 pb-6 border-b transition-colors duration-300 ${
        darkMode ? "border-[#222222]" : "border-neutral-200"
      }`}
    >
      <div>
        <h1
          className={`text-3xl font-bold tracking-tight mb-1 ${darkMode ? "text-white" : "text-neutral-900"}`}
        >
          Basecamp Pusat
        </h1>
        <p
          className={`text-xs tracking-wide uppercase ${darkMode ? "text-[#888888]" : "text-neutral-400"}`}
        >
          Panel Manajemen Produk & Inventori
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Toggle Dark Mode */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`p-2.5 rounded-md border ${darkMode ? "bg-[#161616] border-[#333333] text-yellow-400" : "bg-white border-neutral-200 text-neutral-700 shadow-sm"}`}
        >
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Lihat Live Web */}
        <button
          onClick={() => navigate("/")}
          className={`flex items-center gap-2 border px-5 py-2.5 rounded-md font-medium text-xs tracking-wider uppercase ${
            darkMode
              ? "bg-transparent border-[#333333] text-white"
              : "bg-white border-neutral-300 text-neutral-700 shadow-sm"
          }`}
        >
          <Eye size={14} />
          Lihat Live Web
        </button>

        {/* Tambah Item Baru (Navigasi ke Halaman Terpisah) */}
        <button
          onClick={() => navigate("/admin/products/add")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-md font-bold text-xs tracking-wider uppercase transition-all ${
            darkMode
              ? "bg-white text-black hover:bg-[#e5e5e5]"
              : "bg-neutral-900 text-white hover:bg-neutral-800"
          }`}
        >
          <Plus size={14} />
          Tambah Item
        </button>
      </div>
    </header>
  );
}
