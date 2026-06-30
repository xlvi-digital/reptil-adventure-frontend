import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingBag,
  Layers,
  TrendingUp,
  Wallet,
  CalendarRange,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

import API from "../../api/axios";
import AdminPageShell from "../../components/layouts/AdminPageShell";

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalProducts: 0, totalCategories: 0 });
  const [dashboardStats, setDashboardStats] = useState({
    todayOrders: 0,
    monthOrders: 0,
    todayRevenue: 0,
    monthRevenue: 0,
    salesChart: [],
  });
  const [loading, setLoading] = useState(true);

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
      setLoading(true);
      const [prodResponse, catResponse, statsResponse] = await Promise.all([
        API.get("/products"),
        API.get("/categories"),
        API.get("/admin/dashboard-stats"),
      ]);

      const fetchedProducts = prodResponse.data || [];
      const fetchedCategories = catResponse.data || [];
      setStats({
        totalProducts: fetchedProducts.length,
        totalCategories: fetchedCategories.length,
      });
      setDashboardStats({
        todayOrders: statsResponse.data?.today_orders || 0,
        monthOrders: statsResponse.data?.month_orders || 0,
        todayRevenue: statsResponse.data?.today_revenue || 0,
        monthRevenue: statsResponse.data?.month_revenue || 0,
        salesChart: statsResponse.data?.sales_chart || [],
      });
    } catch (error) {
      console.error("Gagal mengambil data dashboard", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/admin/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const formatRupiah = (value) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number(value || 0));

  const metricCards = [
    {
      title: "Pesanan Hari Ini",
      value: dashboardStats.todayOrders,
      subtitle: "Transaksi selesai hari ini",
      icon: <ShoppingBag size={18} />,
      accent: "bg-neutral-900 text-white",
    },
    {
      title: "Pesanan Bulan Ini",
      value: dashboardStats.monthOrders,
      subtitle: "Transaksi bulan berjalan",
      icon: <CalendarRange size={18} />,
      accent: "bg-amber-50 text-amber-700 border border-amber-100",
    },
    {
      title: "Pendapatan Hari Ini",
      value: formatRupiah(dashboardStats.todayRevenue),
      subtitle: "Total omzet hari ini",
      icon: <Wallet size={18} />,
      accent: "bg-emerald-50 text-emerald-700 border border-emerald-100",
    },
    {
      title: "Pendapatan Bulan Ini",
      value: formatRupiah(dashboardStats.monthRevenue),
      subtitle: "Total omzet bulan berjalan",
      icon: <TrendingUp size={18} />,
      accent: "bg-sky-50 text-sky-700 border border-sky-100",
    },
  ];

  return (
    <AdminPageShell contentClassName="max-w-7xl mx-auto w-full">
      <div className="rounded-3xl border border-neutral-200/70 bg-white p-4 sm:p-6 shadow-[0_12px_50px_-24px_rgba(15,23,42,0.25)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-neutral-100 mb-6">
          <div>
            <h1 className="text-xl font-black uppercase tracking-wider text-neutral-900 flex items-center gap-2">
              <LayoutDashboard size={22} /> Ringkasan Penjualan & Operasional
            </h1>
            <p className="text-xs text-neutral-400 font-medium mt-1">
              Pantau performa penjualan, omzet harian, serta progres pesanan
              yang sudah masuk alur pembayaran.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {metricCards.map((card) => (
            <div
              key={card.title}
              className="border border-neutral-200/60 p-6 rounded-2xl bg-white"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-neutral-400 mb-1">
                    {card.title}
                  </p>
                  <h3 className="text-2xl sm:text-3xl font-black text-neutral-900 font-mono leading-tight">
                    {card.value}
                  </h3>
                  <p className="text-[11px] text-neutral-500 mt-2">
                    {card.subtitle}
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${card.accent}`}>
                  {card.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_0.6fr] gap-6">
          <div className="border border-neutral-200/60 rounded-2xl p-4 sm:p-6 bg-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[10px] uppercase tracking-wider font-bold text-neutral-400">
                  Tren Penjualan 7 Hari
                </p>
                <h2 className="text-sm font-black text-neutral-900">
                  Grafik Omzet
                </h2>
              </div>
              <span className="text-[10px] rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 font-semibold uppercase tracking-wider text-neutral-500">
                Live
              </span>
            </div>
            <div className="h-72">
              {loading ? (
                <div className="flex h-full items-center justify-center text-sm text-neutral-400">
                  Memuat grafik...
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dashboardStats.salesChart}>
                    <CartesianGrid stroke="#f3f4f6" strokeDasharray="3 3" />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 12, fill: "#6b7280" }}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: "#6b7280" }}
                      tickFormatter={(value) => `Rp${value / 1000}k`}
                    />
                    <Tooltip formatter={(value) => formatRupiah(value)} />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#111827"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="border border-neutral-200/60 rounded-2xl p-4 sm:p-6 bg-white space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-wider font-bold text-neutral-400">
                  Ringkasan Katalog
                </p>
                <h2 className="text-sm font-black text-neutral-900">
                  Inventori Toko
                </h2>
              </div>
              <span className="text-[10px] rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 font-semibold uppercase tracking-wider text-neutral-500">
                {stats.totalProducts} item
              </span>
            </div>

            <div className="rounded-2xl border border-neutral-200/70 bg-neutral-50/70 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-neutral-400">
                    Produk aktif
                  </p>
                  <p className="text-2xl font-black text-neutral-900">
                    {stats.totalProducts}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-white border border-neutral-200">
                  <ShoppingBag size={18} className="text-neutral-700" />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-neutral-200/70 bg-neutral-50/70 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-neutral-400">
                    Kategori utama
                  </p>
                  <p className="text-2xl font-black text-neutral-900">
                    {stats.totalCategories}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-white border border-neutral-200">
                  <Layers size={18} className="text-neutral-700" />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-neutral-200/70 bg-neutral-50/70 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-neutral-400">
                    Performa Mingguan
                  </p>
                  <p className="text-lg font-black text-neutral-900">
                    Terus naik
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
                  <TrendingUp size={18} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminPageShell>
  );
}
