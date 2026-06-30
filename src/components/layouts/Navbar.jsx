import React from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Plus } from "lucide-react";

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8 pb-6 border-b border-neutral-200">
      <div>
        <h1 className="text-2xl font-black tracking-tight mb-1 text-neutral-900">
          Basecamp Pusat
        </h1>
        <p className="text-xs tracking-[0.2em] uppercase text-neutral-500">
          Panel manajemen produk, kategori, dan pesanan
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 border border-neutral-200 bg-white px-4 py-2.5 rounded-xl font-semibold text-xs tracking-[0.2em] uppercase text-neutral-700 shadow-sm hover:bg-neutral-50 transition"
        >
          <Eye size={14} />
          Lihat Toko
        </button>

        <button
          onClick={() => navigate("/admin/products")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs tracking-[0.2em] uppercase transition bg-neutral-900 text-white hover:bg-neutral-800 shadow-sm"
        >
          <Plus size={14} />
          Tambah Item
        </button>
      </div>
    </header>
  );
}
