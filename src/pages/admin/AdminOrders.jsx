import React, { useState, useEffect } from "react";
import { ShoppingBag, Eye, Truck, Search } from "lucide-react";
import {
  getOrderCompletionState,
  getInvoiceNumber,
} from "../../utils/orderStatus";
import AdminPageShell from "../../components/layouts/AdminPageShell";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // mapping ke query ?status=
  const [selectedOrder, setSelectedOrder] = useState(null);

  // State form edit manifest pengiriman
  const [inputCourier, setInputCourier] = useState("");
  const [inputReceipt, setInputReceipt] = useState("");

  // Otomatis mendeteksi apakah Frontend berjalan di Vercel (Production) atau Laptop Sendiri (Localhost)
  const API_URL = () => {
    if (import.meta.env.PROD) {
      // 🚀 Menggunakan URL Hugging Face milikmu untuk Production
      return "https://xlvi-digital-reptil-adventure-api.hf.space";
    }
    // Tetap mengarah ke localhost jika kamu sedang testing di komputer sendiri
    return "http://localhost:8080";
  };

  // Fungsi Pembantu untuk mengambil Token JWT Admin dari LocalStorage/Session
  const getAuthHeader = () => {
    const token = localStorage.getItem("token"); // Sesuaikan tempat kamu menyimpan JWT token saat login
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  // 1. READ: Ambil data dari backend (Mendukung filter status PENDING/PAID/SHIPPED/CANCELLED)
  const fetchOrders = async () => {
    try {
      let url = API_URL;
      if (filterStatus !== "all") {
        url += `?status=${filterStatus.toUpperCase()}`;
      }

      const response = await fetch(url, {
        method: "GET",
        headers: getAuthHeader(),
      });

      if (!response.ok) {
        throw new Error(
          "Gagal mengambil data, pastikan Anda sudah login sebagai Admin.",
        );
      }

      const data = await response.json();
      setOrders(data || []);
    } catch (error) {
      console.error("Error fetchOrders:", error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filterStatus]);

  // Handler saat tombol detail di-klik
  const handleOpenDetail = (order) => {
    setSelectedOrder(order);
    setInputCourier(order.courier || "");
    setInputReceipt(
      order.tracking_number && order.tracking_number !== "-"
        ? order.tracking_number
        : "",
    );
  };

  // 2. UPDATE: Mengubah Status Utama Cepat (PAID / PENDING / CANCELLED)
  const handleUpdateStatus = async (invoice, newStatus) => {
    try {
      const response = await fetch(`${API_URL}/${invoice}/status`, {
        method: "PUT",
        headers: getAuthHeader(),
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        alert(`Status invoice ${invoice} berhasil diubah menjadi ${newStatus}`);
        fetchOrders(); // Refresh tabel utama
        setSelectedOrder(null); // Tutup modal
      } else {
        alert("Gagal mengubah status pesanan.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  // 3. UPDATE: Menginput Manifest Kurir & Resi (Otomatis mengubah status jadi SHIPPED)
  const handleSaveShippingDetails = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;

    try {
      const response = await fetch(
        `${API_URL}/${selectedOrder.order_invoice}/shipping`,
        {
          method: "PUT",
          headers: getAuthHeader(),
          body: JSON.stringify({
            courier: inputCourier,
            receipt_number: inputReceipt, // Diterima backend sebagai tracking_number
          }),
        },
      );

      if (response.ok) {
        alert("Manifest pengiriman dan nomor resi berhasil disimpan!");
        fetchOrders();
        setSelectedOrder(null);
      } else {
        alert("Gagal memperbarui manifest pengiriman.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  // 4. DELETE: Menghapus / Membatalkan pesanan permanen
  const handleDeleteOrder = async (invoice) => {
    if (
      window.confirm(
        `Apakah Anda yakin ingin menghapus data pesanan ${invoice}?`,
      )
    ) {
      try {
        const response = await fetch(`${API_URL}/${invoice}`, {
          method: "DELETE",
          headers: getAuthHeader(),
        });

        if (response.ok) {
          alert("Data pesanan berhasil dihapus.");
          fetchOrders();
          setSelectedOrder(null);
        } else {
          alert("Gagal menghapus pesanan.");
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  // Filter pencarian lokal berdasarkan nomor invoice atau nama pelanggan
  const filteredOrders = orders.filter((order) => {
    return (
      order.order_invoice.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <AdminPageShell contentClassName="max-w-7xl mx-auto w-full">
      <div className="rounded-3xl border border-neutral-200/70 bg-white p-4 sm:p-6 shadow-[0_12px_50px_-24px_rgba(15,23,42,0.25)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-neutral-100 mb-6">
          <div>
            <h1 className="text-xl font-black uppercase tracking-wider text-neutral-900 flex items-center gap-2">
              <ShoppingBag size={22} /> Manajemen Pesanan (Admin)
            </h1>
            <p className="text-xs text-neutral-400 font-medium mt-1">
              Pantau status pembayaran, manifest logistik, dan progres
              pengiriman dari satu panel.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Cari ID Invoice atau nama pelanggan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 text-xs font-medium rounded-xl outline-none focus:border-neutral-900 transition"
            />
          </div>

          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 text-xs font-semibold rounded-xl outline-none focus:border-neutral-900 text-neutral-600 transition"
            >
              <option value="all">📦 STATUS PESANAN: SEMUA</option>
              <option value="pending">PENDING (BELUM BAYAR)</option>
              <option value="paid">PAID (SUDAH BAYAR)</option>
              <option value="shipped">SHIPPED (SUDAH DIKIRIM)</option>
              <option value="cancelled">CANCELLED (BATAL)</option>
            </select>
          </div>
        </div>

        <div className="border border-neutral-200/60 rounded-xl overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50 text-[10px] font-black uppercase tracking-wider text-neutral-400 border-b border-neutral-200">
                  <th className="p-4">Invoice</th>
                  <th className="p-4">Pelanggan</th>
                  <th className="p-4">Total Transaksi</th>
                  <th className="p-4">Status Alur</th>
                  <th className="p-4">No. Resi</th>
                  <th className="p-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-xs font-medium">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="text-center py-10 text-neutral-400"
                    >
                      Tidak ada data transaksi ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-neutral-50/50 transition"
                    >
                      <td className="p-4 font-mono font-bold text-neutral-900">
                        {getInvoiceNumber(order)}
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-neutral-900">
                          {order.customer_name}
                        </div>
                        <div className="text-[10px] text-neutral-400 font-mono mt-0.5">
                          {order.created_at
                            ? new Date(order.created_at).toLocaleDateString(
                                "id-ID",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                },
                              )
                            : "-"}
                        </div>
                      </td>
                      <td className="p-4 font-bold text-neutral-900">
                        Rp{" "}
                        {order.grand_total
                          ? order.grand_total.toLocaleString("id-ID")
                          : 0}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${getOrderCompletionState(order).meta.badge}`}
                        >
                          {getOrderCompletionState(order).meta.label}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-neutral-500">
                        {order.tracking_number || "-"}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleOpenDetail(order)}
                          className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-[10px] uppercase tracking-wider rounded-lg transition inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Eye size={12} /> Kelola
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL DETAL & CONTROL PANEL UPDATE */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-lg rounded-2xl p-6 border border-neutral-100 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-neutral-100 pb-4 mb-4">
                <div>
                  <span className="text-[10px] text-neutral-400 font-mono block">
                    Pengelolaan Invoice
                  </span>
                  <h3 className="text-sm font-black uppercase tracking-wider text-neutral-900 font-mono">
                    {selectedOrder.order_invoice}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-xs font-bold text-neutral-400 hover:text-black"
                >
                  [X] Tutup
                </button>
              </div>

              {/* Alamat Penerima Rapi */}
              <div className="space-y-3 text-xs mb-5">
                <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200/50">
                  <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">
                    Manifes Pengiriman
                  </span>
                  <p className="text-neutral-700 font-medium whitespace-pre-line mt-1 leading-relaxed">
                    {selectedOrder.shipping_address}
                  </p>
                </div>
              </div>

              {/* Aksi Ganti Status Pembayaran Cepat */}
              <div className="border-t border-neutral-100 pt-4 space-y-4">
                <div>
                  <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block mb-2">
                    Ubah Status Cepat
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() =>
                        handleUpdateStatus(
                          selectedOrder.order_invoice,
                          "PENDING",
                        )
                      }
                      className="px-3 py-1.5 text-[10px] bg-amber-50 text-amber-600 border border-amber-200 font-bold uppercase rounded-lg transition"
                    >
                      Set Menunggu (PENDING)
                    </button>
                    <button
                      onClick={() =>
                        handleUpdateStatus(selectedOrder.order_invoice, "PAID")
                      }
                      className="px-3 py-1.5 text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-200 font-bold uppercase rounded-lg transition"
                    >
                      Set Lunas (PAID)
                    </button>
                    <button
                      onClick={() =>
                        handleUpdateStatus(
                          selectedOrder.order_invoice,
                          "SHIPPED",
                        )
                      }
                      className="px-3 py-1.5 text-[10px] bg-violet-50 text-violet-600 border border-violet-200 font-bold uppercase rounded-lg transition"
                    >
                      Set Dikirim (SHIPPED)
                    </button>
                    <button
                      onClick={() =>
                        handleUpdateStatus(selectedOrder.order_invoice, "DONE")
                      }
                      className="px-3 py-1.5 text-[10px] bg-slate-900 text-white border border-slate-900 font-bold uppercase rounded-lg transition"
                    >
                      Set Selesai (DONE)
                    </button>
                    <button
                      onClick={() =>
                        handleUpdateStatus(
                          selectedOrder.order_invoice,
                          "CANCELLED",
                        )
                      }
                      className="px-3 py-1.5 text-[10px] bg-rose-50 text-rose-600 border border-rose-200 font-bold uppercase rounded-lg transition"
                    >
                      Batalkan (CANCELLED)
                    </button>
                  </div>
                </div>

                {/* Form Input Resi Kurir */}
                <form
                  onSubmit={handleSaveShippingDetails}
                  className="bg-neutral-50/60 border border-neutral-200/60 p-4 rounded-xl space-y-3"
                >
                  <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider block">
                    <Truck size={14} className="inline mr-1 mb-0.5" /> Input
                    Resi Pengiriman Resmi
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] text-neutral-400 font-bold uppercase mb-1">
                        Kurir
                      </label>
                      <input
                        type="text"
                        placeholder="J&T, JNE, POS..."
                        value={inputCourier}
                        onChange={(e) => setInputCourier(e.target.value)}
                        className="w-full p-2 bg-white border border-neutral-200 text-xs rounded-lg outline-none focus:border-neutral-900 transition font-medium"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] text-neutral-400 font-bold uppercase mb-1">
                        Nomor Resi
                      </label>
                      <input
                        type="text"
                        placeholder="Masukkan No. Resi..."
                        value={inputReceipt}
                        onChange={(e) => setInputReceipt(e.target.value)}
                        className="w-full p-2 bg-white border border-neutral-200 text-xs rounded-lg outline-none focus:border-neutral-900 transition font-mono font-bold"
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 bg-neutral-900 text-white font-bold text-[10px] uppercase tracking-wider rounded-lg transition"
                  >
                    Simpan Manifest & Set SHIPPED
                  </button>
                </form>
              </div>

              {/* Aksi Hapus / Hancurkan */}
              <div className="mt-5 pt-3 border-t border-neutral-100 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => handleDeleteOrder(selectedOrder.order_invoice)}
                  className="text-[10px] font-bold text-red-500 uppercase hover:underline"
                >
                  Hapus / Batalkan Pesanan
                </button>
                <span className="text-xs font-black text-neutral-900">
                  Total: Rp{" "}
                  {selectedOrder.grand_total
                    ? selectedOrder.grand_total.toLocaleString("id-ID")
                    : 0}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminPageShell>
  );
}
