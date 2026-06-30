import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layers, Plus, Edit2, Trash2, Check, X } from "lucide-react";
import API from "../../api/axios";

// IMPORT CORE LAYOUTS
import Sidebar from "../../components/layouts/Sidebar";
import Navbar from "../../components/layouts/Navbar";
import Footer from "../../components/layouts/Footer";

// 🚀 IMPOR TOAST KUSTOM YANG BARU KITA BUAT
import Toast from "../../components/common/Toast";
import ConfirmModal from "../../components/common/ComfirModal";

export default function CategoryManager() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [darkMode] = useState(false);

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  // 🚀 STATE UNTUK MODAL KONFIRMASI
  const [confirmData, setConfirmData] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "danger",
    confirmText: "",
    onConfirm: () => {},
  });

  // Fungsi pembantu untuk memicu modal konfirmasi
  const triggerConfirm = (options) => {
    setConfirmData({
      isOpen: true,
      ...options,
    });
  };

  // State untuk Tambah Kategori
  const [newCategory, setNewCategory] = useState("");

  // State untuk Mode Edit (Inline)
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");

  // Fungsi pembantu untuk memicu pemunculan toast
  const showNotification = (message, type = "success") => {
    setToast({ show: true, message, type });
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/admin/login");
      return;
    }
    fetchCategories();
  }, [navigate]);

  // 📥 READ: Mengambil seluruh data kategori dari database
  const fetchCategories = async () => {
    try {
      const response = await API.get("/categories");
      const fetchedData = response.data || [];

      // 🚀 URUTKAN BERDASARKAN ID TERBESAR (Terbaru) DI FRONTEND
      const sortedData = fetchedData.sort((a, b) => b.id - a.id);

      setCategories(sortedData);
    } catch (error) {
      console.error("Gagal memuat data", error);
    }
  };

  // 🚀 CREATE: Menambahkan kategori baru ke database
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    try {
      const token = localStorage.getItem("token");
      await API.post(
        "/categories",
        { name: newCategory },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setNewCategory("");
      fetchCategories(); // Refresh data tabel
      showNotification(
        "Kategori baru berhasil disimpan ke database!",
        "success",
      );
    } catch (error) {
      console.error("Gagal membuat kategori:", error);
      showNotification(
        error.response?.data?.error || "Gagal membuat kategori.",
        "error",
      );
    }
  };

  // 🔄 UPDATE: Menyimpan perubahan nama kategori
  const handleUpdateCategory = async (id) => {
    if (!editingName.trim()) return;

    try {
      const token = localStorage.getItem("token");
      await API.put(
        `/categories/${id}`,
        { name: editingName },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setEditingId(null);
      setEditingName("");
      fetchCategories(); // Refresh data tabel
      showNotification("Kategori berhasil diperbarui!", "success");
    } catch (error) {
      console.error("Gagal memperbarui kategori:", error);
      showNotification(
        error.response?.data?.error || "Gagal memperbarui kategori.",
        "error",
      );
    }
  };

  // ❌ DELETE: Menghapus kategori dari database
  const handleDeleteCategory = async (id, name) => {
    triggerConfirm({
      title: "Hapus Kategori?",
      message: `Apakah Anda yakin ingin menghapus kategori "${name}" dari database? Tindakan ini permanen.`,
      type: "danger",
      confirmText: "Hapus",
      onConfirm: async () => {
        try {
          const token = localStorage.getItem("token");
          await API.delete(`/categories/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          fetchCategories(); // Refresh data
          showNotification("Kategori berhasil dihapus!", "success"); // Panggil Toast kustom Anda
        } catch (error) {
          showNotification("Gagal menghapus kategori", "error");
        }
      },
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/admin/login");
  };

  // Mengaktifkan mode pengeditan baris tabel
  const startEditing = (id, currentName) => {
    setEditingId(id);
    setEditingName(currentName);
  };

  return (
    <div
      className={`flex min-h-screen font-sans antialiased transition-colors duration-300 ${
        darkMode ? "bg-[#121212] text-[#e5e5e5]" : "bg-[#f9f9f9] text-[#1a1a1a]"
      }`}
    >
      {/* SIDEBAR CORE */}
      <Sidebar darkMode={darkMode} handleLogout={handleLogout} />

      {/* WORKSPACE */}
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto flex flex-col justify-between">
        <div>
          {/* NAVBAR CORE */}
          <Navbar />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* COLUMN 1: FORM TAMBAH KATEGORI */}
            <div
              className={`border p-8 rounded-xl shadow-xl ${darkMode ? "bg-[#0a0a0a] border-[#222222]" : "bg-white border-neutral-200"}`}
            >
              <h3 className="text-base font-bold text-white tracking-wide mb-1">
                Buat Kategori Baru
              </h3>
              <p
                className={`text-xs mb-6 ${darkMode ? "text-[#666666]" : "text-neutral-400"}`}
              >
                Grup untuk memilah jenis produk di e-commerce.
              </p>

              <form onSubmit={handleCreateCategory} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#888888] mb-1.5">
                    Nama Kategori
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Jaket Gunung"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-md text-sm border focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                      darkMode
                        ? "bg-[#121212] border-[#222222] text-white"
                        : "bg-neutral-50 border-neutral-200 text-black"
                    }`}
                  />
                </div>
                <button
                  type="submit"
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-md font-bold text-xs tracking-wider uppercase transition-all ${
                    darkMode
                      ? "bg-white text-black hover:bg-[#e5e5e5]"
                      : "bg-neutral-900 text-white hover:bg-neutral-800"
                  }`}
                >
                  <Plus size={14} />
                  Simpan Kategori
                </button>
              </form>
            </div>

            {/* COLUMN 2 & 3: TABEL DAFTAR KATEGORI LIVE */}
            <div
              className={`border rounded-xl overflow-hidden shadow-2xl lg:col-span-2 ${darkMode ? "bg-[#0a0a0a] border-[#222222]" : "bg-white border-neutral-200"}`}
            >
              <div
                className={`px-8 py-6 border-b flex justify-between items-center ${darkMode ? "bg-[#0d0d0d] border-[#222222]" : "bg-neutral-50/70 border-neutral-200"}`}
              >
                <h2
                  className={`font-bold text-base tracking-wide ${darkMode ? "text-white" : "text-neutral-800"}`}
                >
                  Grup Kategori Database
                </h2>
                <span
                  className={`text-xs border px-3 py-1 rounded-full ${darkMode ? "bg-[#1a1a1a] border-[#333333] text-[#888888]" : "bg-white border-neutral-200 text-neutral-500"}`}
                >
                  {categories.length} Total
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr
                      className={`border-b text-xs uppercase tracking-wider ${darkMode ? "border-[#222222] text-[#666666] bg-[#0d0d0d]" : "border-neutral-200 text-neutral-400 bg-neutral-50/40"}`}
                    >
                      <th className="px-8 py-4 font-semibold w-16">ID</th>
                      <th className="px-8 py-4 font-semibold">Nama Kategori</th>
                      <th className="px-8 py-4 font-semibold text-right">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody
                    className={`divide-y text-sm ${darkMode ? "divide-[#1e1e1e]" : "divide-neutral-100"}`}
                  >
                    {categories.length === 0 ? (
                      <tr>
                        <td
                          colSpan="3"
                          className="px-8 py-12 text-center text-neutral-500 font-medium"
                        >
                          Belum ada kategori terdaftar.
                        </td>
                      </tr>
                    ) : (
                      categories.map((cat, index) => (
                        <tr
                          key={cat.id}
                          className={`transition-colors ${darkMode ? "hover:bg-[#121212]" : "hover:bg-neutral-50/60"}`}
                        >
                          <td className="px-8 py-4 font-mono text-xs text-neutral-500">
                            {index + 1}
                          </td>
                          <td className="px-8 py-4">
                            {editingId === cat.id ? (
                              // Tampilan kolom saat dalam mode EDITING
                              <input
                                type="text"
                                value={editingName}
                                onChange={(e) => setEditingName(e.target.value)}
                                className={`px-3 py-1.5 rounded text-sm border focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                                  darkMode
                                    ? "bg-[#161616] border-[#333333] text-white"
                                    : "bg-white border-neutral-300"
                                }`}
                              />
                            ) : (
                              // Tampilan kolom NORMAL
                              <span
                                className={`font-medium tracking-wide ${darkMode ? "text-white" : "text-neutral-800"}`}
                              >
                                {cat.name}
                              </span>
                            )}
                          </td>
                          <td className="px-8 py-4 text-right">
                            {editingId === cat.id ? (
                              // Tombol kontrol saat mode EDITING aktif
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleUpdateCategory(cat.id)}
                                  className="p-1.5 border border-transparent rounded bg-emerald-950/40 text-emerald-400 hover:bg-emerald-900/50 transition-all"
                                  title="Simpan Perubahan"
                                >
                                  <Check
                                    size={14}
                                    className="text-emerald-400"
                                  />
                                </button>
                                <button
                                  onClick={() => setEditingId(null)}
                                  className="p-1.5 border border-transparent rounded bg-neutral-900 text-neutral-400 hover:bg-neutral-800 transition-all"
                                  title="Batal"
                                >
                                  <X size={14} className="text-neutral-400" />
                                </button>
                              </div>
                            ) : (
                              // Tombol kontrol NORMAL (Edit & Delete)
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => startEditing(cat.id, cat.name)}
                                  className={`p-2 border border-transparent rounded-md ${darkMode ? "text-[#666666] hover:text-white hover:bg-[#161616]" : "text-neutral-400 hover:text-black hover:bg-neutral-100"}`}
                                  title="Ubah Nama"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeleteCategory(cat.id, cat.name)
                                  }
                                  className={`p-2 border border-transparent rounded-md ${darkMode ? "text-[#666666] hover:text-red-400 hover:bg-red-950/20" : "text-neutral-400 hover:text-red-600 hover:bg-red-50"}`}
                                  title="Hapus Kategori"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <Footer darkMode={darkMode} />
      </main>

      {/* 🚀 MODAL KONFIRMASI KUSTOM */}
      <ConfirmModal
        isOpen={confirmData.isOpen}
        title={confirmData.title}
        message={confirmData.message}
        type={confirmData.type}
        confirmText={confirmData.confirmText}
        onConfirm={confirmData.onConfirm}
        onClose={() => setConfirmData({ ...confirmData, isOpen: false })}
      />

      {/* /* TOAST KUSTOM */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
    </div>
  );
}
