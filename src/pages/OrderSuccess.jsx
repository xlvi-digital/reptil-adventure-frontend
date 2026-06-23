import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  Clock,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function OrderSuccess() {
  const navigate = useNavigate();

  // Membaca data parameter dari URL (invoice & status)
  const queryParams = new URLSearchParams(window.location.search);
  const invoiceNumber = queryParams.get("invoice") || "INV-XXXXXXXXX";
  const paymentStatus = queryParams.get("status") || "pending";

  return (
    <div className="min-h-screen bg-neutral-50/50 flex items-center justify-center p-4 selection:bg-neutral-900 selection:text-white font-sans">
      <div className="w-full max-w-md bg-white border border-neutral-200/60 rounded-2xl p-6 shadow-xl relative overflow-hidden text-center">
        {/* Dekorasi Efek Cahaya Halus Sesuai Tema Light Premium */}
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Lingkaran Ikon Status (Light Theme) */}
        <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-5 bg-neutral-50 border border-neutral-100">
          {paymentStatus === "paid" ? (
            <CheckCircle2
              className="text-emerald-600 animate-pulse"
              size={28}
            />
          ) : (
            <Clock className="text-amber-500 animate-pulse" size={28} />
          )}
        </div>

        {/* Judul & Pesan Utama */}
        <h2 className="text-lg font-black uppercase tracking-wider text-neutral-900 mb-2">
          {paymentStatus === "paid"
            ? "Pembayaran Dikonfirmasi!"
            : "Pesanan Berhasil Dicatat"}
        </h2>

        <p className="text-xs text-neutral-500 font-medium leading-relaxed px-2 mb-6">
          {paymentStatus === "paid"
            ? "Terima kasih! Pembayaran Anda telah kami terima secara otomatis. Tim Reptil Adventure akan segera mengemas dan mengirimkan produk pesanan Anda."
            : "Pesanan Anda berhasil dibuat dan telah dikunci oleh sistem. Produk akan segera diproses masuk antrean pengiriman setelah pembayaran Anda diselesaikan."}
        </p>

        {/* Detail Manifes Invoice (Manifes Minimalis Bersih) */}
        <div className="bg-neutral-50 border border-neutral-200/60 rounded-xl p-4 text-left space-y-3 mb-6">
          <div className="flex justify-between items-center text-xs">
            <span className="text-neutral-400 font-bold uppercase tracking-wider text-[10px]">
              Nomor Invoice
            </span>
            <span className="font-mono text-neutral-800 font-bold tracking-wider bg-neutral-200/60 px-2 py-0.5 rounded text-[11px]">
              {invoiceNumber}
            </span>
          </div>

          <div className="h-[1px] bg-neutral-200/60 w-full" />

          <div className="flex justify-between items-center text-xs">
            <span className="text-neutral-400 font-bold uppercase tracking-wider text-[10px]">
              Status Pengiriman
            </span>
            <span
              className={`font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5 ${paymentStatus === "paid" ? "text-emerald-600" : "text-amber-600"}`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${paymentStatus === "paid" ? "bg-emerald-500 animate-ping" : "bg-amber-500 animate-pulse"}`}
              />
              {paymentStatus === "paid"
                ? "Menunggu Pengemasan"
                : "Menunggu Pembayaran"}
            </span>
          </div>
        </div>

        {/* Tombol Navigasi Kembali (Gaya Minimalis Eiger) */}
        <div className="space-y-2">
          <button
            onClick={() => navigate("/")}
            className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs py-3 px-4 rounded-xl transition duration-200 flex items-center justify-center gap-1.5 group uppercase tracking-wider shadow-xs cursor-pointer"
          >
            Lanjut Belanja Lagi
            <ChevronRight
              size={14}
              className="group-hover:translate-x-0.5 transition-transform"
            />
          </button>

          <button
            onClick={() => navigate("/account")}
            className="w-full bg-transparent hover:bg-neutral-50 text-neutral-500 hover:text-neutral-900 font-bold text-xs py-2.5 px-4 rounded-xl transition duration-200 uppercase tracking-wider cursor-pointer"
          >
            Lihat Riwayat Pesanan Saya
          </button>
        </div>
      </div>
    </div>
  );
}
