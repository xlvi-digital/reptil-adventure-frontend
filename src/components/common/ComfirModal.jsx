import React from "react";
import { AlertTriangle, LogOut, Trash2, X } from "lucide-react";

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Apakah Anda yakin?",
  message = "Tindakan ini tidak dapat dibatalkan.",
  type = "danger", // 'danger' untuk hapus, 'warning' untuk logout
  confirmText = "Konfirmasi",
}) {
  if (!isOpen) return null;

  // Konfigurasi ikon dan warna tombol berdasarkan tipe aksi
  const config = {
    danger: {
      icon: <Trash2 className="text-red-400" size={22} />,
      bgIcon: "bg-red-950/30 border-red-500/20",
      btnConfirm: "bg-red-600 hover:bg-red-700 text-white",
    },
    warning: {
      icon: <LogOut className="text-amber-400" size={22} />,
      bgIcon: "bg-amber-950/30 border-amber-500/20",
      btnConfirm: "bg-amber-600 hover:bg-amber-700 text-white",
    },
  };

  const currentConfig = config[type] || config.danger;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md rounded-xl border bg-[#0a0a0a] border-[#222222] p-6 shadow-2xl text-left">
        {/* Header & Ikon */}
        <div className="flex items-start gap-4">
          <div
            className={`p-3 border rounded-lg flex-shrink-0 ${currentConfig.bgIcon}`}
          >
            {currentConfig.icon}
          </div>

          <div className="flex-1">
            <h3 className="text-base font-bold tracking-wide text-white">
              {title}
            </h3>
            <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">
              {message}
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-300 p-1 rounded-md border border-transparent hover:border-[#222222] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[#1a1a1a]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md font-medium text-xs tracking-wider uppercase border border-[#333333] text-white hover:border-[#555555] bg-transparent transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 rounded-md font-bold text-xs tracking-wider uppercase transition-colors ${currentConfig.btnConfirm}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
