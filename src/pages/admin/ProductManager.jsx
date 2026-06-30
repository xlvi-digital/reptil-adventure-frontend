import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  X,
  ImagePlus,
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import API from "../../api/axios";

// IMPORT CORE LAYOUTS
import Sidebar from "../../components/layouts/Sidebar";
import Navbar from "../../components/layouts/Navbar";
import Footer from "../../components/layouts/Footer";

// COMPONENT GLOBAL COMMON
import Toast from "../../components/common/Toast";
import ConfirmModal from "../../components/common/ComfirModal";

export default function ProductManager() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [darkMode] = useState(false);
  // 🚀 STATE BARU: UNTUK LOADING & SUMMARY IMPORT EXCEL
  const [isImporting, setIsImporting] = useState(false);
  const [importSummary, setImportSummary] = useState(null); // Menyimpan objek { total, success, failed }

  // 🚀 STATE TAMBAHAN UNTUK INTERAKSI (SEARCH, FILTER, PAGINATION, MODAL DETAIL)
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProductDetail, setSelectedProductDetail] = useState(null); // Untuk Modal Popup Detail
  const itemsPerPage = 10; // Batasi 10 item per halaman

  // 🚀 STATE UNTUK KONTROL MODAL FORM INPUT (TAMBAH/EDIT)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [hasColors, setHasColors] = useState(false);
  const [hasSizes, setHasSizes] = useState(false);

  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [colorInput, setColorInput] = useState("");
  const [sizeInput, setSizeInput] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category_id: "",
    image_url: "",
    colors: [],
    sizes: [],
  });

  const [imagePreviews, setImagePreviews] = useState({
    primary: null,
    support1: null,
    support2: null,
    support3: null,
  });

  const [primaryFile, setPrimaryFile] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });
  const [confirmData, setConfirmData] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "danger",
    confirmText: "",
    onConfirm: () => {},
  });

  const triggerConfirm = (options) =>
    setConfirmData({ isOpen: true, ...options });
  const showNotification = (message, type = "success") =>
    setToast({ show: true, message, type });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/admin/login");
      return;
    }
    fetchProducts();
    fetchCategories();
  }, [navigate]);

  const fetchProducts = async () => {
    try {
      const response = await API.get("/products");
      const fetchedData = response.data || [];
      const sortedData = fetchedData.sort((a, b) => b.id - a.id);
      setProducts(sortedData);
    } catch (error) {
      console.error("Gagal memuat data produk", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await API.get("/categories");
      setCategories(response.data || []);
    } catch (error) {
      console.error("Gagal memuat data kategori", error);
    }
  };

  // 🚀 LOGIC FILTER & SEARCH (Client-Side)
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = selectedCategory
        ? String(product.category_id) === String(selectedCategory)
        : true;

      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  // 🚀 LOGIC PAGINATION (Client-Side)
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProducts, currentPage]);

  // Reset page ke halaman 1 saat filter diubah
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleCategoryFilterChange = (e) => {
    setSelectedCategory(e.target.value);
    setCurrentPage(1);
  };

  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    const dataToSend = new FormData();
    dataToSend.append("name", formData.name);
    dataToSend.append("price", formData.price);
    dataToSend.append("stock", formData.stock);
    dataToSend.append("category_id", formData.category_id);
    dataToSend.append("description", formData.description);
    dataToSend.append("colors", JSON.stringify(colors));
    dataToSend.append("sizes", JSON.stringify(sizes));

    if (primaryFile) {
      dataToSend.append("image", primaryFile);
    }

    const filesToUpload = [];
    if (galleryFiles.support1) filesToUpload.push(galleryFiles.support1);
    if (galleryFiles.support2) filesToUpload.push(galleryFiles.support2);
    if (galleryFiles.support3) filesToUpload.push(galleryFiles.support3);

    filesToUpload.forEach((file) => {
      dataToSend.append("gallery", file);
    });

    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      };

      if (editingId) {
        await API.put(`/admin/products/${editingId}`, dataToSend, config);
        showNotification("Produk berhasil diperbarui!", "success");
      } else {
        await API.post("/admin/products", dataToSend, config);
        showNotification("Produk baru berhasil ditambahkan!", "success");
      }

      fetchProducts();
      closeFormModal();
    } catch (error) {
      console.error("Proses CRUD Gagal:", error);
      showNotification(
        error.response?.data?.error || "Terjadi kesalahan pada server",
        "error",
      );
    }
  };

  const handleImportExcel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileExtension = file.name.split(".").pop().toLowerCase();
    if (fileExtension !== "xlsx" && fileExtension !== "xls") {
      showNotification("Format file wajib .xlsx atau .xls!", "error");
      return;
    }

    const dataToSend = new FormData();
    dataToSend.append("excel_file", file);

    // Aktifkan loading & reset summary sebelumnya
    setIsImporting(true);
    setImportSummary(null);

    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await API.post(
        "/admin/products/import",
        dataToSend,
        config,
      );

      // Ambil data statistik dari response backend
      // Backend Go biasanya mengembalikan struktur: total_rows/total, success_count/success
      const total = response.data?.total || response.data?.total_rows || 0;
      const success =
        response.data?.success || response.data?.success_count || 0;
      const failed = total - success;

      // Set hasil ke state untuk ditampilkan di popup alert/modal
      setImportSummary({ total, success, failed });
      showNotification(`Proses Impor Selesai!`, "success");

      fetchProducts();
      e.target.value = null;
    } catch (error) {
      console.error("Gagal melakukan import Excel:", error);
      showNotification(
        error.response?.data?.error ||
          "Terjadi kesalahan saat memproses file Excel",
        "error",
      );
      e.target.value = null;
    } finally {
      // Matikan loading apa pun hasil akhirnya (sukses/gagal)
      setIsImporting(false);
    }
  };

  const handleDeleteProduct = (id, name) => {
    triggerConfirm({
      title: "Hapus Produk?",
      message: `Apakah Anda yakin ingin menghapus "${name}" dari database? Tindakan ini permanen.`,
      type: "danger",
      confirmText: "Hapus",
      onConfirm: async () => {
        try {
          const token = localStorage.getItem("token");
          await API.delete(`/admin/products/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          fetchProducts();
          showNotification("Produk berhasil dihapus!", "success");
        } catch (error) {
          showNotification("Gagal menghapus produk", "error");
        }
      },
    });
  };

  const handleAddColor = (e) => {
    e.preventDefault();
    if (colorInput.trim() !== "" && !colors.includes(colorInput.trim())) {
      setColors([...colors, colorInput.trim()]);
      setColorInput("");
    }
  };

  const handleRemoveColor = (indexToRemove) => {
    setColors(colors.filter((_, index) => index !== indexToRemove));
  };

  const handleAddSize = (e) => {
    e.preventDefault();
    if (sizeInput.trim() !== "" && !sizes.includes(sizeInput.trim())) {
      setSizes([...sizes, sizeInput.trim()]);
      setSizeInput("");
    }
  };

  const handleRemoveSize = (indexToRemove) => {
    setSizes(sizes.filter((_, index) => index !== indexToRemove));
  };

  const openEditModal = (product) => {
    setEditingId(product.id);
    let imageData = { primary: "", support: [] };
    try {
      if (product.image) {
        imageData =
          typeof product.image === "string"
            ? JSON.parse(product.image)
            : product.image;
      }
    } catch (e) {
      console.error("Gagal parse data gambar saat edit", e);
    }

    const BASE_URL = "http://localhost:8080";

    setImagePreviews({
      primary: imageData?.primary ? `${BASE_URL}${imageData.primary}` : null,
      support1: imageData?.support?.[0]
        ? `${BASE_URL}${imageData.support[0]}`
        : null,
      support2: imageData?.support?.[1]
        ? `${BASE_URL}${imageData.support[1]}`
        : null,
      support3: imageData?.support?.[2]
        ? `${BASE_URL}${imageData.support[2]}`
        : null,
    });

    const existingColors = product.colors || [];
    const existingSizes = product.sizes || [];
    setColors(existingColors);
    setHasColors(existingColors.length > 0);
    setSizes(existingSizes);
    setHasSizes(existingSizes.length > 0);

    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price,
      stock: product.stock || "",
      category_id: product.category_id,
    });

    setIsFormModalOpen(true);
  };

  const closeFormModal = () => {
    setIsFormModalOpen(false);
    setEditingId(null);
    setFormData({
      name: "",
      description: "",
      price: "",
      stock: "",
      category_id: "",
    });
    setImagePreviews({
      primary: null,
      support1: null,
      support2: null,
      support3: null,
    });
    setColors([]);
    setSizes([]);
    setHasColors(false);
    setHasSizes(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/admin/login");
  };

  return (
    <div
      className={`flex min-h-screen font-sans antialiased transition-colors duration-300 ${
        darkMode ? "bg-[#121212] text-[#e5e5e5]" : "bg-[#f9f9f9] text-[#1a1a1a]"
      }`}
    >
      <Sidebar darkMode={darkMode} handleLogout={handleLogout} />

      <main className="flex-1 p-8 lg:p-12 overflow-y-auto flex flex-col justify-between">
        <div>
          <Navbar />

          <div className="grid grid-cols-1 gap-8 items-start">
            <div
              className={`border rounded-xl overflow-hidden shadow-2xl ${
                darkMode
                  ? "bg-[#0a0a0a] border-[#222222]"
                  : "bg-white border-neutral-200"
              }`}
            >
              {/* HEADER ATAS TABEL CONTROLS */}
              <div
                className={`px-8 py-6 border-b flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                  darkMode
                    ? "bg-[#0d0d0d] border-[#222222]"
                    : "bg-neutral-50/70 border-neutral-200"
                }`}
              >
                <div>
                  <h2
                    className={`font-bold text-base tracking-wide ${darkMode ? "text-white" : "text-neutral-800"}`}
                  >
                    Manajemen Katalog Produk
                  </h2>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Menampilkan {filteredProducts.length} dari {products.length}{" "}
                    item terdaftar
                  </p>
                </div>

                {/* 🚀 BARU: SEARCH & FILTER GROUP BAR */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Input Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
                    <input
                      type="text"
                      placeholder="Cari produk..."
                      value={searchTerm}
                      onChange={handleSearchChange}
                      className={`pl-9 pr-4 py-2 text-xs rounded-lg border focus:outline-none focus:ring-1 focus:ring-emerald-500 w-full sm:w-48 transition-all ${
                        darkMode
                          ? "bg-[#121212] border-[#222222] text-white"
                          : "bg-white border-neutral-200 text-black"
                      }`}
                    />
                  </div>

                  {/* Dropdown Filter Kategori */}
                  <div className="relative flex items-center">
                    <select
                      value={selectedCategory}
                      onChange={handleCategoryFilterChange}
                      className={`pl-4 pr-8 py-2 text-xs rounded-lg border focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer appearance-none ${
                        darkMode
                          ? "bg-[#121212] border-[#222222] text-neutral-300"
                          : "bg-white border-neutral-200 text-neutral-700"
                      }`}
                    >
                      <option value="">Semua Kategori</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <Filter
                      size={12}
                      className="absolute right-2.5 text-neutral-500 pointer-events-none"
                    />
                  </div>
                </div>

                {/* ACTION BUTTONS (IMPORT & ADD) */}
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 border border-[#222222] text-neutral-300 text-xs font-semibold uppercase tracking-wider rounded-lg shadow-md transition-all cursor-pointer">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-emerald-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Import Excel
                    <input
                      type="file"
                      accept=".xlsx, .xls"
                      className="hidden"
                      onChange={handleImportExcel}
                    />
                  </label>

                  <button
                    onClick={() => setIsFormModalOpen(true)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold text-xs tracking-wider uppercase transition-all ${
                      darkMode
                        ? "bg-white text-black hover:bg-[#e5e5e5]"
                        : "bg-neutral-900 text-white hover:bg-neutral-800"
                    }`}
                  >
                    <Plus size={14} />
                    Tambah Produk
                  </button>
                </div>
              </div>

              {/* 🚀 FIX: WRAPPER OVERFLOW UNTUK TABEL RESPONSIVE */}
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead>
                    <tr
                      className={`border-b text-xs uppercase tracking-wider ${
                        darkMode
                          ? "border-[#222222] text-[#666666] bg-[#0d0d0d]"
                          : "border-neutral-200 text-neutral-400 bg-neutral-50/40"
                      }`}
                    >
                      <th className="px-6 py-4 font-semibold w-16 text-center">
                        No
                      </th>
                      <th className="px-6 py-4 font-semibold w-20">Preview</th>
                      <th className="px-6 py-4 font-semibold max-w-xs">
                        Nama Produk
                      </th>
                      <th className="px-6 py-4 font-semibold">Kategori</th>
                      <th className="px-6 py-4 font-semibold">Harga Jual</th>
                      <th className="px-6 py-4 font-semibold">Stok</th>
                      <th className="px-6 py-4 font-semibold text-center w-36">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody
                    className={`divide-y text-sm ${darkMode ? "divide-[#1e1e1e]" : "divide-neutral-100"}`}
                  >
                    {paginatedProducts.length === 0 ? (
                      <tr>
                        <td
                          colSpan="7"
                          className="px-8 py-16 text-center text-neutral-500 font-medium"
                        >
                          Tidak ada data produk yang cocok dengan pencarian
                          Anda.
                        </td>
                      </tr>
                    ) : (
                      paginatedProducts.map((product, index) => {
                        let imageData = { primary: "", support: [] };
                        try {
                          if (product.image) {
                            imageData =
                              typeof product.image === "string"
                                ? JSON.parse(product.image)
                                : product.image;
                          }
                        } catch (e) {}

                        const finalImageSrc = imageData?.primary
                          ? `http://localhost:8080${imageData.primary}`
                          : "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=100";

                        return (
                          <tr
                            key={product.id}
                            className={`transition-colors ${darkMode ? "hover:bg-[#121212]" : "hover:bg-neutral-50/60"}`}
                          >
                            <td className="px-6 py-4 font-mono text-xs text-neutral-500 text-center">
                              {(currentPage - 1) * itemsPerPage + index + 1}
                            </td>

                            <td className="px-6 py-4">
                              <img
                                src={finalImageSrc}
                                alt={product.name || "Gambar"}
                                className="w-11 h-11 object-cover rounded-lg border border-[#222222] bg-neutral-900 shadow-sm"
                                onError={(e) => {
                                  e.target.src =
                                    "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=100";
                                }}
                              />
                            </td>

                            {/* 🚀 FIX: truncate nama agar tidak merusak lebar row */}
                            <td className="px-6 py-4">
                              <div
                                className={`font-bold text-sm max-w-[200px] truncate ${darkMode ? "text-white" : "text-neutral-800"}`}
                              >
                                {product.name}
                              </div>
                            </td>

                            <td className="px-6 py-4">
                              <span className="px-2.5 py-0.5 bg-[#161616] border border-[#262626] rounded-full text-xs text-neutral-300 font-medium">
                                {product.category?.name || "Uncategorized"}
                              </span>
                            </td>

                            <td className="px-6 py-4 font-mono font-semibold text-emerald-400">
                              Rp {(product.price || 0).toLocaleString("id-ID")}
                            </td>

                            <td className="px-6 py-4 text-neutral-300 font-medium">
                              {product.stock}{" "}
                              <span className="text-xs text-neutral-500">
                                Pcs
                              </span>
                            </td>

                            <td className="px-3 py-2 text-center">
                              <div className="flex justify-center gap-1">
                                {/* 🚀 BARU: ICON DETAIL VIEW */}
                                <button
                                  onClick={() =>
                                    setSelectedProductDetail(product)
                                  }
                                  className={`p-2 border border-transparent rounded-lg ${
                                    darkMode
                                      ? "text-blue-400 hover:bg-blue-950/30"
                                      : "text-blue-600 hover:bg-blue-50"
                                  }`}
                                  title="Lihat Detail Lengkap"
                                >
                                  <Eye size={14} />
                                </button>

                                <button
                                  onClick={() => openEditModal(product)}
                                  className={`p-2 border border-transparent rounded-lg ${
                                    darkMode
                                      ? "text-neutral-400 hover:text-white hover:bg-[#161616]"
                                      : "text-neutral-400 hover:text-black hover:bg-neutral-100"
                                  }`}
                                  title="Edit Detail"
                                >
                                  <Edit2 size={14} />
                                </button>

                                <button
                                  onClick={() =>
                                    handleDeleteProduct(
                                      product.id,
                                      product.name,
                                    )
                                  }
                                  className={`p-2 border border-transparent rounded-lg ${
                                    darkMode
                                      ? "text-neutral-400 hover:text-red-400 hover:bg-red-950/20"
                                      : "text-neutral-400 hover:text-red-600 hover:bg-red-50"
                                  }`}
                                  title="Hapus Permanen"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* 🚀 BARU: COMPONENT FOOTER CONTROLS PAGINATION */}
              {totalPages > 1 && (
                <div
                  className={`px-8 py-4 border-t flex items-center justify-between ${
                    darkMode
                      ? "bg-[#0d0d0d] border-[#222222]"
                      : "bg-neutral-50/70 border-neutral-200"
                  }`}
                >
                  <span className="text-xs text-neutral-500">
                    Halaman{" "}
                    <span
                      className={
                        darkMode ? "text-neutral-300" : "text-neutral-700"
                      }
                    >
                      {currentPage}
                    </span>{" "}
                    dari{" "}
                    <span
                      className={
                        darkMode ? "text-neutral-300" : "text-neutral-700"
                      }
                    >
                      {totalPages}
                    </span>
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => p - 1)}
                      className={`p-1.5 rounded-lg border transition-all text-neutral-400 hover:text-white disabled:opacity-20 disabled:pointer-events-none ${
                        darkMode
                          ? "bg-[#121212] border-[#222222]"
                          : "bg-white border-neutral-200"
                      }`}
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((p) => p + 1)}
                      className={`p-1.5 rounded-lg border transition-all text-neutral-400 hover:text-white disabled:opacity-20 disabled:pointer-events-none ${
                        darkMode
                          ? "bg-[#121212] border-[#222222]"
                          : "bg-white border-neutral-200"
                      }`}
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <Footer darkMode={darkMode} />
      </main>

      {/* ======================================================== */}
      {/* 🚀 MODAL POPUP PREVIEW DETAIL DATA (GLASSMORPHISM BLACK) */}
      {/* ======================================================== */}
      {selectedProductDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div
            className={`border rounded-xl w-full max-w-lg overflow-hidden shadow-2xl ${
              darkMode
                ? "bg-[#0a0a0a] border-[#222222]"
                : "bg-white border-neutral-200"
            }`}
          >
            <div
              className={`px-6 py-4 border-b flex justify-between items-center ${
                darkMode
                  ? "bg-[#0d0d0d] border-[#222222]"
                  : "bg-neutral-50 border-neutral-200"
              }`}
            >
              <h3 className="font-bold text-sm uppercase tracking-wider text-emerald-400 font-mono">
                Detail Spesifikasi Produk
              </h3>
              <button
                onClick={() => setSelectedProductDetail(null)}
                className="text-neutral-400 hover:text-white font-bold text-lg"
              >
                &times;
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
              <div>
                <span className="text-[10px] text-neutral-500 block uppercase font-semibold tracking-wider">
                  Nama Produk
                </span>
                <span
                  className={`text-base font-bold ${darkMode ? "text-white" : "text-neutral-800"}`}
                >
                  {selectedProductDetail.name}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-neutral-500 block uppercase font-semibold tracking-wider">
                    Kategori
                  </span>
                  <span className="text-sm font-medium">
                    {selectedProductDetail.category?.name || "Uncategorized"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 block uppercase font-semibold tracking-wider">
                    Stok Gudang
                  </span>
                  <span className="text-sm font-mono">
                    {selectedProductDetail.stock} Pcs
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-neutral-500 block uppercase font-semibold tracking-wider">
                  Harga Jual Resmi
                </span>
                <span className="text-base font-mono font-bold text-emerald-400">
                  Rp {selectedProductDetail.price?.toLocaleString("id-ID")}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-neutral-500 block uppercase font-semibold tracking-wider">
                    Varian Warna
                  </span>
                  <span className="text-xs font-mono text-neutral-300">
                    {productHasVarianData(selectedProductDetail.colors)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 block uppercase font-semibold tracking-wider">
                    Varian Ukuran
                  </span>
                  <span className="text-xs font-mono text-neutral-300">
                    {productHasVarianData(selectedProductDetail.sizes)}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-neutral-500 block uppercase font-semibold tracking-wider mb-1">
                  Deskripsi Produk
                </span>
                <p
                  className={`text-xs p-3 rounded-lg border whitespace-pre-wrap leading-relaxed ${
                    darkMode
                      ? "bg-[#121212] border-[#222222] text-neutral-400"
                      : "bg-neutral-50 border-neutral-100 text-neutral-600"
                  }`}
                >
                  {selectedProductDetail.description ||
                    "Tidak ada deskripsi yang disematkan."}
                </p>
              </div>
            </div>

            <div
              className={`px-6 py-3 border-t text-right ${darkMode ? "bg-[#0d0d0d] border-[#222222]" : "bg-neutral-50"}`}
            >
              <button
                onClick={() => setSelectedProductDetail(null)}
                className="bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-lg transition-colors"
              >
                Tutup Detail
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL DIALOG FULL SCREEN UNTUK FORM INPUT (ADD / EDIT)   */}
      {/* ======================================================== */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-[#0a0a0a] animate-fade-in overflow-y-auto">
          <div className="sticky top-0 bg-[#0a0a0a] border-b border-[#222222]/60 px-8 py-6 flex justify-between items-center z-10">
            <div>
              <h3 className="text-lg font-black text-white tracking-widest uppercase font-mono">
                {editingId ? "Ubah Detail Produk" : "Tambah Produk Baru"}
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                Lengkapi seluruh parameter komoditas produk di bawah ini dengan
                benar.
              </p>
            </div>
            <button
              onClick={closeFormModal}
              className="p-2.5 rounded-lg text-neutral-400 hover:text-white hover:bg-[#111111] border border-[#222222] transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
            >
              <X size={16} />
              <span>Tutup</span>
            </button>
          </div>

          <div className="flex-1 max-w-3xl w-full mx-auto px-6 py-12">
            <form onSubmit={handleSubmitProduct} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#888888] mb-2">
                  Nama Produk
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Hoodie Black Over-sized"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className={`w-full px-5 py-3 rounded-lg text-sm border focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all ${
                    darkMode
                      ? "bg-[#121212] border-[#222222] text-white"
                      : "bg-neutral-50 border-neutral-200 text-black"
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#888888] mb-2">
                  Kategori Klasifikasi
                </label>
                <select
                  required
                  value={formData.category_id}
                  onChange={(e) =>
                    setFormData({ ...formData, category_id: e.target.value })
                  }
                  className={`w-full px-5 py-3 rounded-lg text-sm border focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all ${
                    darkMode
                      ? "bg-[#121212] border-[#222222] text-white"
                      : "bg-neutral-50 border-neutral-200 text-black"
                  }`}
                >
                  <option value="">Pilih Rumpun Kategori</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#888888] mb-2">
                    Harga Jual (Rp)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="149000"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    className={`w-full px-5 py-3 rounded-lg text-sm border focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono transition-all ${
                      darkMode
                        ? "bg-[#121212] border-[#222222] text-white"
                        : "bg-neutral-50 border-neutral-200 text-black"
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#888888] mb-2">
                    Kuantitas Stok
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="100"
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({ ...formData, stock: e.target.value })
                    }
                    className={`w-full px-5 py-3 rounded-lg text-sm border focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all ${
                      darkMode
                        ? "bg-[#121212] border-[#222222] text-white"
                        : "bg-neutral-50 border-neutral-200 text-black"
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#888888] mb-3">
                  Galeri Foto Produk{" "}
                  <span className="text-neutral-500 lowercase">
                    (rekomendasi: persegi 1000x1000px, max 2MB)
                  </span>
                </label>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                  <div className="md:col-span-1 flex flex-col gap-1.5">
                    <span className="text-[10px] font-bold text-emerald-400 tracking-wider uppercase">
                      Gambar Utama *
                    </span>
                    <div className="relative h-40 w-full rounded-lg border-2 border-dashed border-[#222222] hover:border-emerald-500/50 bg-[#121212] transition-all overflow-hidden group flex flex-col items-center justify-center text-center p-4">
                      {imagePreviews.primary ? (
                        <>
                          <img
                            src={imagePreviews.primary}
                            alt="Utama"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setImagePreviews({
                                  ...imagePreviews,
                                  primary: null,
                                });
                                setPrimaryFile(null);
                              }}
                              className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </>
                      ) : (
                        <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center p-2 group-hover:text-white text-neutral-500 transition-colors">
                          <ImagePlus
                            size={24}
                            className="mb-2 text-neutral-400 group-hover:text-emerald-400 transition-colors"
                          />
                          <span className="text-[11px] font-medium block">
                            Pilih Foto
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                setPrimaryFile(file);
                                setImagePreviews({
                                  ...imagePreviews,
                                  primary: URL.createObjectURL(file),
                                });
                              }
                            }}
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  {["support1", "support2", "support3"].map((key, idx) => (
                    <div key={key} className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-bold text-neutral-500 tracking-wider uppercase">
                        Pendukung {idx + 1}
                      </span>
                      <div className="relative h-40 w-full rounded-lg border-2 border-dashed border-[#222222] hover:border-neutral-700 bg-[#121212] transition-all overflow-hidden group flex flex-col items-center justify-center text-center p-4">
                        {imagePreviews[key] ? (
                          <>
                            <img
                              src={imagePreviews[key]}
                              alt={`Pendukung ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setImagePreviews({
                                    ...imagePreviews,
                                    [key]: null,
                                  });
                                  setGalleryFiles((prev) => ({
                                    ...prev,
                                    [key]: null,
                                  }));
                                }}
                                className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </>
                        ) : (
                          <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center p-2 group-hover:text-white text-neutral-500 transition-colors">
                            <ImagePlus
                              size={20}
                              className="mb-2 text-neutral-500 group-hover:text-neutral-300 transition-colors"
                            />
                            <span className="text-[10px] font-medium block">
                              Upload
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  setGalleryFiles((prev) => ({
                                    ...prev,
                                    [key]: file,
                                  }));
                                  setImagePreviews({
                                    ...imagePreviews,
                                    [key]: URL.createObjectURL(file),
                                  });
                                }
                              }}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {/* PILIHAN WARNA */}
                <div className="space-y-4">
                  <div
                    className={`flex items-center space-x-3 p-4 rounded-lg border transition-all ${darkMode ? "bg-[#121212] border-[#222222]" : "bg-neutral-50 border-neutral-200"}`}
                  >
                    <input
                      type="checkbox"
                      id="hasColors"
                      checked={hasColors}
                      onChange={(e) => setHasColors(e.target.checked)}
                      className="w-4 h-4 text-emerald-500 border-neutral-300 rounded cursor-pointer"
                    />
                    <label
                      htmlFor="hasColors"
                      className={`text-sm font-medium cursor-pointer select-none ${darkMode ? "text-neutral-400" : "text-neutral-600"}`}
                    >
                      Memiliki Varian Warna
                    </label>
                  </div>
                  {hasColors && (
                    <div className="space-y-2 animate-fade-in">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#888888]">
                        Tambah Varian Warna
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Contoh: Onyx Black"
                          value={colorInput}
                          onChange={(e) => setColorInput(e.target.value)}
                          onKeyDown={(e) =>
                            e.key === "Enter" &&
                            (e.preventDefault(), handleAddColor(e))
                          }
                          className={`flex-1 px-5 py-3 rounded-lg text-sm border focus:outline-none focus:ring-1 focus:ring-emerald-500 ${darkMode ? "bg-[#121212] border-[#222222] text-white" : "bg-neutral-50 border-neutral-200 text-black"}`}
                        />
                        <button
                          type="button"
                          onClick={handleAddColor}
                          className="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg"
                        >
                          Tambah
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {colors.map((color, index) => (
                          <span
                            key={index}
                            className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-mono border ${darkMode ? "bg-[#1a1a1a] border-[#252525] text-neutral-300" : "bg-white border-neutral-200 text-neutral-800"}`}
                          >
                            {color}
                            <button
                              type="button"
                              onClick={() => handleRemoveColor(index)}
                              className="ml-2 text-neutral-400 hover:text-red-500 text-sm"
                            >
                              &times;
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* PILIHAN UKURAN */}
                <div className="space-y-4">
                  <div
                    className={`flex items-center space-x-3 p-4 rounded-lg border transition-all ${darkMode ? "bg-[#121212] border-[#222222]" : "bg-neutral-50 border-neutral-200"}`}
                  >
                    <input
                      type="checkbox"
                      id="hasSizes"
                      checked={hasSizes}
                      onChange={(e) => setHasSizes(e.target.checked)}
                      className="w-4 h-4 text-emerald-500 border-neutral-300 rounded cursor-pointer"
                    />
                    <label
                      htmlFor="hasSizes"
                      className={`text-sm font-medium cursor-pointer select-none ${darkMode ? "text-neutral-400" : "text-neutral-600"}`}
                    >
                      Memiliki Varian Ukuran (Size)
                    </label>
                  </div>
                  {hasSizes && (
                    <div className="space-y-2 animate-fade-in">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#888888]">
                        Tambah Varian Ukuran
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Contoh: XL, L"
                          value={sizeInput}
                          onChange={(e) => setSizeInput(e.target.value)}
                          onKeyDown={(e) =>
                            e.key === "Enter" &&
                            (e.preventDefault(), handleAddSize(e))
                          }
                          className={`flex-1 px-5 py-3 rounded-lg text-sm border focus:outline-none focus:ring-1 focus:ring-emerald-500 ${darkMode ? "bg-[#121212] border-[#222222] text-white" : "bg-neutral-50 border-neutral-200 text-black"}`}
                        />
                        <button
                          type="button"
                          onClick={handleAddSize}
                          className="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg"
                        >
                          Tambah
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {sizes.map((size, index) => (
                          <span
                            key={index}
                            className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-mono border ${darkMode ? "bg-[#1a1a1a] border-[#252525] text-neutral-300" : "bg-white border-neutral-200 text-neutral-800"}`}
                          >
                            {size}
                            <button
                              type="button"
                              onClick={() => handleRemoveSize(index)}
                              className="ml-2 text-neutral-400 hover:text-red-500 text-sm"
                            >
                              &times;
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#888888] mb-2">
                  Deskripsi Singkat
                </label>
                <textarea
                  rows="5"
                  placeholder="Informasikan detail spesifikasi item..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className={`w-full px-5 py-3 rounded-lg text-sm border focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none ${
                    darkMode
                      ? "bg-[#121212] border-[#222222] text-white"
                      : "bg-neutral-50 border-neutral-200 text-black"
                  }`}
                ></textarea>
              </div>

              <div className="flex justify-end gap-4 pt-6 border-t border-[#222222]/40 mt-8">
                <button
                  type="button"
                  onClick={closeFormModal}
                  className="px-6 py-3 rounded-lg text-xs font-bold uppercase text-neutral-400 hover:text-white hover:bg-[#111111] border border-transparent hover:border-[#222222]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className={`px-8 py-3 rounded-lg font-bold text-xs uppercase shadow-lg ${darkMode ? "bg-white text-black hover:bg-[#e5e5e5]" : "bg-neutral-900 text-white hover:bg-neutral-800"}`}
                >
                  {editingId ? "Simpan Perubahan" : "Simpan Ke Database"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmData.isOpen}
        title={confirmData.title}
        message={confirmData.message}
        type={confirmData.type}
        confirmText={confirmData.confirmText}
        onConfirm={confirmData.onConfirm}
        onClose={() => setConfirmData({ ...confirmData, isOpen: false })}
      />
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}

      {/* ─── MODAL LOADING OVERLAY ─── */}
      {isImporting && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in text-center">
          {/* Spinner Minimalis Premium */}
          <div className="w-14 h-14 border-4 border-t-emerald-500 border-r-transparent border-b-emerald-500 border-l-transparent rounded-full animate-spin mb-4"></div>
          <h3 className="text-sm font-black tracking-widest uppercase text-white font-mono">
            Sedang Memproses File Excel
          </h3>
          <p className="text-xs text-neutral-400 mt-2 max-w-xs leading-relaxed">
            Sistem sedang membaca baris data, memvalidasi kategori, dan
            mengunduh aset gambar otomatis. Mohon tunggu sejenak...
          </p>
        </div>
      )}

      {/* ─── MODAL POPUP SUMMARY HASIL UPLOAD ─── */}
      {importSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div
            className={`border rounded-xl w-full max-w-sm overflow-hidden shadow-2xl ${
              darkMode
                ? "bg-[#0a0a0a] border-[#222222]"
                : "bg-white border-neutral-200"
            }`}
          >
            <div
              className={`px-6 py-4 border-b flex justify-between items-center ${
                darkMode
                  ? "bg-[#0d0d0d] border-[#222222]"
                  : "bg-neutral-50 border-neutral-200"
              }`}
            >
              <h3 className="font-bold text-xs uppercase tracking-wider text-emerald-400 font-mono">
                Laporan Import Excel
              </h3>
              <button
                onClick={() => setImportSummary(null)}
                className="text-neutral-400 hover:text-white font-bold text-lg"
              >
                &times;
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-neutral-400 leading-relaxed">
                Berikut adalah rangkuman eksekusi pemindaian file `.xlsx` yang
                baru saja diunggah ke server:
              </p>

              <div className="grid grid-cols-3 gap-2 text-center pt-2">
                <div
                  className={`p-3 rounded-lg border ${darkMode ? "bg-[#121212] border-[#222222]" : "bg-neutral-50"}`}
                >
                  <span className="text-[10px] text-neutral-500 uppercase block font-semibold tracking-wider mb-1">
                    Total
                  </span>
                  <span
                    className={`text-base font-bold font-mono ${darkMode ? "text-white" : "text-neutral-800"}`}
                  >
                    {importSummary.total}
                  </span>
                </div>
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                  <span className="text-[10px] text-emerald-400 uppercase block font-semibold tracking-wider mb-1">
                    Sukses
                  </span>
                  <span className="text-base font-bold font-mono text-emerald-400">
                    {importSummary.success}
                  </span>
                </div>
                <div
                  className={`p-3 rounded-lg border ${importSummary.failed > 0 ? "bg-red-500/10 border-red-500/20 text-red-400" : "opacity-40"}`}
                >
                  <span className="text-[10px] text-neutral-500 uppercase block font-semibold tracking-wider mb-1">
                    Gagal
                  </span>
                  <span className="text-base font-bold font-mono">
                    {importSummary.failed}
                  </span>
                </div>
              </div>

              {importSummary.failed > 0 && (
                <p className="text-[11px] text-red-400/80 bg-red-950/20 p-2.5 rounded-lg border border-red-900/30">
                  💡 *Tip: Jika ada data gagal, pastikan kolom ID Kategori dan
                  Stok di Excel Anda sudah terisi rapat (tidak ada sel kosong).*
                </p>
              )}
            </div>

            <div
              className={`px-6 py-3 border-t text-right ${darkMode ? "bg-[#0d0d0d] border-[#222222]" : "bg-neutral-50"}`}
            >
              <button
                onClick={() => setImportSummary(null)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-lg transition-colors shadow-lg shadow-emerald-900/20"
              >
                Selesai & Pantau Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 🚀 HELPER FUNCTION AMAN UNTUK MEMBACA DATA VARIAN (ARRAY ATAU STRING JSON) DI POPUP DETAIL
function productHasVarianData(data) {
  if (!data) return "-";
  try {
    const parsed = typeof data === "string" ? JSON.parse(data) : data;
    if (Array.isArray(parsed) && parsed.length > 0) return parsed.join(", ");
    if (Array.isArray(data) && data.length > 0) return data.join(", ");
  } catch (e) {}
  return String(data) !== "[]" && String(data) !== "" ? String(data) : "-";
}
