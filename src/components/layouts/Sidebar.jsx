import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Layers,
  Package,
  ShoppingBag,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import ConfirmModal from "../common/ComfirModal";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const menuItems = [
    {
      path: "/admin/dashboard",
      name: "Dashboard",
      icon: <LayoutDashboard size={18} />,
    },
    { path: "/admin/categories", name: "Kategori", icon: <Layers size={18} /> },
    { path: "/admin/products", name: "Produk", icon: <Package size={18} /> },
    { path: "/admin/orders", name: "Pesanan", icon: <ShoppingBag size={18} /> },
  ];

  const handleLogoutConfirm = () => {
    localStorage.removeItem("token");
    navigate("/admin/login");
  };

  return (
    <>
      <aside
        className={`relative min-h-screen bg-white border-r border-neutral-200 flex flex-col justify-between transition-all duration-300 z-40 ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        <div>
          <div className="h-16 flex items-center justify-between px-6 border-b border-neutral-200">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="px-2 py-1.5 bg-neutral-900 text-white rounded-md font-black text-[10px] tracking-[0.25em] flex-shrink-0">
                REPTIL
              </div>
              {!isCollapsed && (
                <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-neutral-700 truncate">
                  Admin Panel
                </span>
              )}
            </div>

            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden md:flex p-1.5 rounded-md border border-neutral-200 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50 transition-colors"
            >
              {isCollapsed ? (
                <ChevronRight size={14} />
              ) : (
                <ChevronLeft size={14} />
              )}
            </button>
          </div>

          <nav className="p-4 space-y-1.5">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-[0.2em] uppercase transition-all group ${
                    isActive
                      ? "bg-neutral-900 text-white shadow-sm"
                      : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
                  }`}
                >
                  <div
                    className={`flex-shrink-0 ${isActive ? "text-white" : "text-neutral-500 group-hover:text-neutral-900"}`}
                  >
                    {item.icon}
                  </div>
                  {!isCollapsed && (
                    <span className="truncate">{item.name}</span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-neutral-200">
          <button
            onClick={() => setIsLogoutModalOpen(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-[0.2em] uppercase text-red-500 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all"
          >
            <div className="flex-shrink-0">
              <LogOut size={18} />
            </div>
            {!isCollapsed && <span className="truncate">Keluar</span>}
          </button>
        </div>
      </aside>

      <ConfirmModal
        isOpen={isLogoutModalOpen}
        title="Keluar dari Panel Admin?"
        message="Anda harus masuk kembali untuk mengakses dashboard ini setelahnya."
        type="warning"
        confirmText="Keluar"
        onConfirm={handleLogoutConfirm}
        onClose={() => setIsLogoutModalOpen(false)}
      />
    </>
  );
}
