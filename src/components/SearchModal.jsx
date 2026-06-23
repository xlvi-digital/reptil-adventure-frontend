import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // 🌟 Import agar fitur redirect URL aktif

export default function SearchModal({
  isOpen,
  onClose,
  searchQuery,
  onSearchSubmit,
}) {
  const [localInput, setLocalInput] = useState(searchQuery || "");
  const navigate = useNavigate();

  // Jika state isOpen false, modal tidak akan dirender
  if (!isOpen) return null;

  // 🌟 LOGIKA SUBMIT YANG DISATUKAN (Aman, Mengirim ke App.jsx sekaligus update URL)
  const handleSubmitAction = (e) => {
    if (e) e.preventDefault();

    if (localInput.trim() !== "") {
      // 1. Alirkan kata kunci ke fungsi submit bawaan di App.jsx (jika ada state global)
      if (typeof onSearchSubmit === "function") {
        onSearchSubmit(localInput.trim());
      }

      // 2. Dorong URL browser ke halaman produk membawa query string
      navigate(`/products?search=${encodeURIComponent(localInput.trim())}`);

      // 3. Tutup modal pencarian otomatis agar user langsung melihat hasilnya
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/40 backdrop-blur-sm transition-all duration-300">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Kotak Konten Modal */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-neutral-100 p-6 z-10 transform transition-all duration-300 animate-in fade-in zoom-in-95">
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-neutral-100 pb-4 mb-4">
          <h3 className="font-sans font-bold text-sm text-neutral-800 flex items-center gap-2">
            🔍 Cari Perlengkapan
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 font-sans text-sm font-bold p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Form Input Pencarian */}
        <form onSubmit={handleSubmitAction} className="relative">
          <input
            type="text"
            placeholder="Cari produk di sini..."
            value={localInput}
            onChange={(e) => setLocalInput(e.target.value)}
            autoFocus
            className="w-full pl-4 pr-12 py-3 bg-neutral-50 border border-neutral-200 rounded-xl font-sans text-sm font-medium text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 transition"
          />

          {localInput && (
            <button
              type="button"
              onClick={() => setLocalInput("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 font-sans text-xs font-bold cursor-pointer"
            >
              Bersihkan
            </button>
          )}

          <button type="submit" className="hidden">
            Cari
          </button>
        </form>

        {/* Mini Info / Preview Teks Status */}
        <div className="mt-4 flex items-center justify-between text-[11px] font-sans text-neutral-400 px-1">
          <span>
            {localInput
              ? `Tekan Enter untuk mencari "${localInput}"`
              : "Ketik kata kunci untuk menyaring isi katalog produk."}
          </span>

          {localInput && (
            <button
              type="button"
              onClick={handleSubmitAction}
              className="text-neutral-900 font-bold hover:underline cursor-pointer"
            >
              Lihat di Katalog ➔
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
