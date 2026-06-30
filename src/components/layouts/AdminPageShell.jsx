import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function AdminPageShell({ children, contentClassName = "" }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-50/60 text-neutral-800">
      <div className="flex flex-col md:flex-row min-h-screen">
        <div className={`${sidebarOpen ? "block" : "hidden"} md:block`}>
          <Sidebar />
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          <div className="border-b border-neutral-200/70 bg-white/90 backdrop-blur-sm">
            <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen((prev) => !prev)}
                className="inline-flex items-center justify-center rounded-xl border border-neutral-200 bg-white p-2 text-neutral-700 shadow-sm md:hidden"
              >
                {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
              </button>

              <div className="flex-1 min-w-0">
                <Navbar />
              </div>
            </div>
          </div>

          <main
            className={`flex-1 px-4 py-6 sm:px-6 lg:px-8 ${contentClassName}`}
          >
            {children}
          </main>

          <div className="px-4 sm:px-6 lg:px-8 pb-8">
            <Footer />
          </div>
        </div>
      </div>

      {sidebarOpen && (
        <button
          type="button"
          aria-label="Tutup sidebar"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/30 backdrop-blur-[1px] md:hidden"
        />
      )}
    </div>
  );
}
