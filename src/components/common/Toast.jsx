import React, { useEffect } from "react";
import { CheckCircle, XCircle, AlertCircle, X } from "lucide-react";

export default function Toast({
  message,
  type = "success",
  onClose,
  duration = 3000,
}) {
  // Otomatis menutup toast sesuai durasi yang ditentukan
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  // Pengaturan warna berdasarkan tipe toast (Premium Minimalist Style)
  const styles = {
    success: {
      bg: "bg-[#0a0a0a] border-emerald-500/30 text-emerald-400",
      icon: <CheckCircle className="text-emerald-400" size={18} />,
    },
    error: {
      bg: "bg-[#0a0a0a] border-red-500/30 text-red-400",
      icon: <XCircle className="text-red-400" size={18} />,
    },
    warning: {
      bg: "bg-[#0a0a0a] border-amber-500/30 text-amber-400",
      icon: <AlertCircle className="text-amber-400" size={18} />,
    },
  };

  const currentStyle = styles[type] || styles.success;

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-fade-in-up">
      <div
        className={`flex items-center gap-3 px-5 py-3.5 rounded-lg border shadow-2xl backdrop-blur-md ${currentStyle.bg} min-w-[300px] transition-all duration-300`}
      >
        {/* Ikon Status */}
        <div className="flex-shrink-0">{currentStyle.icon}</div>

        {/* Pesan */}
        <p className="text-xs font-medium tracking-wide flex-1 text-neutral-200">
          {message}
        </p>

        {/* Tombol Tutup Manual */}
        <button
          onClick={onClose}
          className="text-neutral-500 hover:text-neutral-300 transition-colors p-0.5 rounded"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
