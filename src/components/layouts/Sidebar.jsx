import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Layers,
  Package,
  ShoppingBag, // 🆕 Import ikon untuk menu pesanan
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import ConfirmModal from "../common/ComfirModal";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // State khusus untuk mengontrol Modal Konfirmasi Logout
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // Daftar menu navigasi admin
  const menuItems = [
    {
      path: "/admin/dashboard",
      name: "Dashboard",
      icon: <LayoutDashboard size={18} />,
    },
    {
      path: "/admin/categories",
      name: "Kategori",
      icon: <Layers size={18} />,
    },
    {
      path: "/admin/products",
      name: "Produk",
      icon: <Package size={18} />,
    },
    {
      path: "/admin/orders", // 🆕 Path rute halaman manajemen pesanan
      name: "Pesanan",
      icon: <ShoppingBag size={18} />, // 🆕 Ikon pesanan masuk
    },
  ];

  // Eksekusi ketika konfirmasi logout disetujui
  const handleLogoutConfirm = () => {
    localStorage.removeItem("token"); // Hapus token autentikasi
    navigate("/admin/login"); // Tendang kembali ke halaman login
  };

  return (
    <>
      <aside
        className={`relative min-h-screen bg-[#0a0a0a] border-r border-[#1a1a1a] flex flex-col justify-between transition-all duration-300 z-40
          ${isCollapsed ? "w-20" : "w-64"}`}
      >
        {/* --- BAGIAN ATAS: LOGO BRAND --- */}
        <div>
          <div className="h-16 flex items-center justify-between px-6 border-b border-[#1a1a1a]">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="p-1.5 bg-white text-black rounded font-black text-xs tracking-wider flex-shrink-0">
                REPTIL
              </div>
              {!isCollapsed && (
                <span className="text-xs font-bold tracking-widest uppercase text-white font-mono truncate">
                  Admin Panel
                </span>
              )}
            </div>

            {/* Tombol Collapse (Sembunyikan/Munculkan Sidebar) */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden md:flex p-1 rounded-md border border-[#222222] text-neutral-400 hover:text-white hover:bg-[#111111] transition-colors"
            >
              {isCollapsed ? (
                <ChevronRight size={14} />
              ) : (
                <ChevronLeft size={14} />
              )}
            </button>
          </div>

          {/* --- BAGIAN TENGAH: MENU NAVIGASI --- */}
          <nav className="p-4 space-y-1.5">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-semibold tracking-wider uppercase transition-all group
                    ${
                      isActive
                        ? "bg-white text-black font-bold shadow-xl shadow-white/5"
                        : "text-neutral-400 hover:text-white hover:bg-[#111111]"
                    }`}
                >
                  <div
                    className={`flex-shrink-0 ${isActive ? "text-black" : "text-neutral-400 group-hover:text-white"}`}
                  >
                    {item.icon}
                  </div>
                  {!isCollapsed && (
                    <span className="transition-opacity duration-200 truncate">
                      {item.name}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* --- BAGIAN BAWAH: TOMBOL LOGOUT --- */}
        <div className="p-4 border-t border-[#1a1a1a]">
          <button
            onClick={() => setIsLogoutModalOpen(true)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-semibold tracking-wider uppercase text-red-400 hover:text-red-300 hover:bg-red-950/20 border border-transparent hover:border-red-900/30 transition-all group`}
          >
            <div className="flex-shrink-0 text-red-400 group-hover:text-red-300">
              <LogOut size={18} />
            </div>
            {!isCollapsed && <span className="truncate">Keluar Sesi</span>}
          </button>
        </div>
      </aside>

      {/* --- MODAL KONFIRMASI LOGOUT GLOBAL --- */}
      <ConfirmModal
        isOpen={isLogoutModalOpen}
        title="Keluar dari Panel Admin?"
        message="Anda harus memasukkan kembali email dan password untuk mengakses dashboard ini di kemudian hari."
        type="warning"
        confirmText="Keluar"
        onConfirm={handleLogoutConfirm}
        onClose={() => setIsLogoutModalOpen(false)}
      />
    </>
  );
}
