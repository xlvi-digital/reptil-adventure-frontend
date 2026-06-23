import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingBag,
  Layers,
  Plus,
  Trash2,
  X,
} from "lucide-react";

import API from "../../api/axios";
import Sidebar from "../../components/layouts/Sidebar";
import Navbar from "../../components/layouts/Navbar";
import Footer from "../../components/layouts/Footer";

export default function Dashboard() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({ totalProducts: 0, totalCategories: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category_id: "",
    image: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/admin/login");
      return;
    }
    fetchDashboardData();
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      const prodResponse = await API.get("/products");
      const fetchedProducts = prodResponse.data || [];
      setProducts(fetchedProducts);

      const catResponse = await API.get("/categories");
      const fetchedCategories = catResponse.data || [];
      setCategories(fetchedCategories);

      if (fetchedCategories.length > 0 && !formData.category_id) {
        setFormData((prev) => ({
          ...prev,
          category_id: fetchedCategories[0].id,
        }));
      }

      setStats({
        totalProducts: fetchedProducts.length,
        totalCategories: fetchedCategories.length,
      });
    } catch (error) {
      console.error("Gagal mengambil data dashboard", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/admin/login");
      }
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        price: parseInt(formData.price),
        category_id: parseInt(formData.category_id),
        image: formData.image
          ? [formData.image]
          : ["https://images.unsplash.com/photo-1548883354-7622d03aca27"],
      };

      const token = localStorage.getItem("token");
      await API.post("/products", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setFormData({
        title: "",
        description: "",
        price: "",
        category_id: categories[0]?.id || "",
        image: "",
      });
      setIsModalOpen(false);
      fetchDashboardData();
      alert("Produk baru berhasil ditambahkan ke database!");
    } catch (error) {
      console.error("Gagal membuat produk:", error);
      alert(
        error.response?.data?.error ||
          "Terjadi kesalahan unmarshal/validasi field backend.",
      );
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/admin/login");
  };

  return (
    <div className="flex min-h-screen font-sans antialiased bg-white text-neutral-800">
      {/* SIDEBAR */}
      <Sidebar darkMode={false} handleLogout={handleLogout} />

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full min-h-screen bg-white">
        {/* NAVBAR */}
        <Navbar darkMode={false} />

        {/* HEADER BRANDING */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-neutral-100 mb-6">
          <div>
            <h1 className="text-xl font-black uppercase tracking-wider text-neutral-900 flex items-center gap-2">
              <LayoutDashboard size={22} /> Ringkasan Inventori
            </h1>
            <p className="text-xs text-neutral-400 font-medium mt-1">
              Kelola katalog produk, harga jual, beserta sinkronisasi kategori
              utama toko.
            </p>
          </div>
          <div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus size={14} /> Tambah Item
            </button>
          </div>
        </div>

        {/* KARTU STATISTIK SINKRON */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="border border-neutral-200/60 p-6 rounded-xl flex items-center justify-between bg-white">
            <div>
              <p className="text-[10px] uppercase tracking-wider font-bold text-neutral-400 mb-1">
                Total Produk Aktif
              </p>
              <h3 className="text-3xl font-black text-neutral-900 font-mono">
                {stats.totalProducts}{" "}
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wide">
                  Items
                </span>
              </h3>
            </div>
            <div className="p-3.5 bg-neutral-50 border border-neutral-100 rounded-xl text-neutral-600">
              <ShoppingBag size={18} />
            </div>
          </div>

          <div className="border border-neutral-200/60 p-6 rounded-xl flex items-center justify-between bg-white">
            <div>
              <p className="text-[10px] uppercase tracking-wider font-bold text-neutral-400 mb-1">
                Kategori Utama
              </p>
              <h3 className="text-3xl font-black text-neutral-900 font-mono">
                {stats.totalCategories}{" "}
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wide">
                  Grup
                </span>
              </h3>
            </div>
            <div className="p-3.5 bg-neutral-50 border border-neutral-100 rounded-xl text-neutral-600">
              <Layers size={18} />
            </div>
          </div>
        </div>

        {/* TABEL DATA INVENTORI CLEAN LUXURY */}
        <div className="border border-neutral-200/60 rounded-xl overflow-hidden bg-white">
          <div className="px-6 py-4 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
            <h2 className="font-black text-xs uppercase tracking-wider text-neutral-900">
              Daftar Inventori Live
            </h2>
            <span className="text-[10px] border border-neutral-200 bg-white px-2.5 py-1 font-bold uppercase tracking-wider text-neutral-400 rounded-full font-mono">
              PostgreSQL Active
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50 text-[10px] font-black uppercase tracking-wider text-neutral-400 border-b border-neutral-200">
                  <th className="px-6 py-4">Detail Produk</th>
                  <th className="px-6 py-4">Harga Jual</th>
                  <th className="px-6 py-4 text-right">Opsi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-xs font-medium">
                {products.length === 0 ? (
                  <tr>
                    <td
                      colSpan="3"
                      className="text-center py-12 text-neutral-400 font-medium"
                    >
                      Belum ada item terdata di database.
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr
                      key={product.id}
                      className="hover:bg-neutral-50/50 transition"
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-neutral-900 text-sm tracking-wide">
                            {product.title}
                          </span>
                          <span className="text-[11px] text-neutral-400 font-medium mt-0.5 max-w-xl truncate leading-relaxed">
                            {product.description}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-neutral-900 font-mono">
                        Rp {product.price?.toLocaleString("id-ID")}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="px-2.5 py-1.5 border border-neutral-200 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 hover:border-red-100 transition cursor-pointer">
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* FOOTER */}
        <Footer darkMode={false} />
      </main>

      {/* POP-UP MODAL FORM CLEAN LIGHT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-xl bg-white rounded-2xl p-6 border border-neutral-100 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b border-neutral-100 mb-4">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-neutral-900">
                  Tambah Item Baru
                </h3>
                <p className="text-[11px] text-neutral-400 font-medium mt-0.5">
                  Masukkan detail spesifikasi produk ke dalam katalog digital.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-xs font-bold text-neutral-400 hover:text-black cursor-pointer"
              >
                [X]
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Nama Produk
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: REPTIL Jaket Waterproof Stormbreaker"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-white border border-neutral-200 text-xs rounded-lg outline-none focus:border-neutral-900 font-medium transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    Harga Jual (Rp)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="425000"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white border border-neutral-200 text-xs rounded-lg outline-none focus:border-neutral-900 font-mono font-bold transition"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    Kategori
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) =>
                      setFormData({ ...formData, category_id: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white border border-neutral-200 text-xs rounded-lg outline-none focus:border-neutral-900 font-semibold text-neutral-600 transition"
                  >
                    {categories.length === 0 ? (
                      <option disabled>Memuat kategori...</option>
                    ) : (
                      categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  URL Gambar Produk
                </label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={formData.image}
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-white border border-neutral-200 text-xs rounded-lg outline-none focus:border-neutral-900 font-mono transition"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Deskripsi Produk
                </label>
                <textarea
                  rows="3"
                  placeholder="Masukkan spesifikasi lengkap produk di sini..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-white border border-neutral-200 text-xs rounded-lg outline-none focus:border-neutral-900 font-medium leading-relaxed transition"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-neutral-200 text-neutral-500 font-bold uppercase rounded-lg text-[10px] tracking-wider hover:bg-neutral-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-neutral-900 text-white font-bold uppercase rounded-lg text-[10px] tracking-wider hover:bg-neutral-800 transition shadow-xs"
                >
                  Simpan ke Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
