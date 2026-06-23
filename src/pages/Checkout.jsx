import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Import React Select untuk fitur search dropdown
import Select from "react-select";

import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import Toast from "../components/common/Toast";

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function CheckoutComponent({ cart = [], onCheckoutSuccess }) {
  // ================= State Form Utama =================
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail] = useState("");

  const [formData, setFormData] = useState({
    provinceId: "",
    provinceName: "",
    cityId: "",
    cityName: "",
    districtId: "",
    districtName: "",
    postalCode: "",
    villageName: "",
    detailAddress: "",
    courier: "JNE",
    mapCoordinates: "", // Awalnya kosong sebelum peta diklik
    rawMapAddress: "", // Awalnya kosong sebelum peta diklik
  });

  // State Data Wilayah untuk Dropdown
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);

  // State Koordinat Peta (Default ke titik tengah Indonesia jika belum ada interaksi)
  const [position, setPosition] = useState([-2.5489, 118.0149]);
  const [zoomLevel, setZoomLevel] = useState(5);
  const [isLocating, setIsLocating] = useState(false);
  const [isMapActive, setIsMapActive] = useState(false);

  // State Toast
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
  };

  // ================= KALKULASI BERDASARKAN DATA CART =================
  const shippingCost = 0;
  const productTotal = cart.reduce(
    (sum, item) =>
      sum + Number(item.product?.price || 0) * Number(item.quantity || 1),
    0,
  );
  const grandTotal = productTotal + shippingCost;

  const formatRupiah = (number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(number);
  };

  // Reverse Geocoding (Hanya dipanggil saat peta diklik atau tombol GPS ditekan)
  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      );
      const data = await response.json();
      if (data && data.display_name) {
        setFormData((prev) => ({
          ...prev,
          mapCoordinates: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
          rawMapAddress: data.display_name,
        }));
      }
    } catch (error) {
      console.error("Gagal mengambil data geocoding:", error);
    }
  };

  // GPS Deteksi Manual (Jika tombol diklik oleh user)
  const autoDetectLocation = () => {
    if (!navigator.geolocation) {
      showToast(
        "Browser Anda tidak mendukung deteksi lokasi otomatis.",
        "warning",
      );
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition([latitude, longitude]);
        setZoomLevel(16);
        reverseGeocode(latitude, longitude);
        setIsLocating(false);
        showToast("Lokasi GPS berhasil dideteksi!", "success");
      },
      (error) => {
        console.error("Gagal mendapatkan GPS:", error);
        setIsLocating(false);
        showToast(
          "Gagal akses GPS. Silakan pin lokasi Anda manual pada peta.",
          "warning",
        );
      },
      { enableHighAccuracy: true },
    );
  };

  // PERUBAHAN: useEffect hanya mengambil data Provinsi, auto-detect GPS saat pertama kali load dimatikan
  useEffect(() => {
    fetch("http://127.0.0.1:8080/api/v1/provinces")
      .then((res) => res.json())
      .then((data) => {
        const formatted = data.map((prov) => ({
          value: prov.id,
          label: prov.nama,
        }));
        setProvinces(formatted);
      })
      .catch((err) => console.error("Gagal load provinsi:", err));
  }, []);

  // Handler Perubahan Dropdown Wilayah
  const handleProvinceChange = (selectedOption) => {
    const id = selectedOption ? selectedOption.value : "";
    const name = selectedOption ? selectedOption.label : "";

    setFormData((prev) => ({
      ...prev,
      provinceId: id,
      provinceName: name,
      cityId: "",
      cityName: "",
      districtId: "",
      districtName: "",
    }));
    setCities([]);
    setDistricts([]);

    if (id) {
      fetch(`http://127.0.0.1:8080/api/v1/regencies?province_id=${id}`)
        .then((res) => res.json())
        .then((data) => {
          const formatted = data.map((city) => ({
            value: city.id,
            label: city.nama,
          }));
          setCities(formatted);
        })
        .catch((err) => console.error("Gagal load kabupaten/kota:", err));
    }
  };

  const handleCityChange = (selectedOption) => {
    const id = selectedOption ? selectedOption.value : "";
    const name = selectedOption ? selectedOption.label : "";

    setFormData((prev) => ({
      ...prev,
      cityId: id,
      cityName: name,
      districtId: "",
      districtName: "",
    }));
    setDistricts([]);

    if (id) {
      fetch(`http://127.0.0.1:8080/api/v1/districts?regency_id=${id}`)
        .then((res) => res.json())
        .then((data) => {
          const formatted = data.map((dist) => ({
            value: dist.id,
            label: dist.nama,
          }));
          setDistricts(formatted);
        })
        .catch((err) => console.error("Gagal load kecamatan:", err));
    }
  };

  const handleDistrictChange = (selectedOption) => {
    const id = selectedOption ? selectedOption.value : "";
    const name = selectedOption ? selectedOption.label : "";

    setFormData((prev) => ({
      ...prev,
      districtId: id,
      districtName: name,
    }));
  };

  const handleCheckout = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Sesi Anda habis. Silakan login kembali.");
      return;
    }

    try {
      // 1. Ambil data profil user real-time untuk mengisi Name, Email, & Phone
      const profileRes = await fetch(
        "http://localhost:8080/api/v1/user/profile",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      let dbUser = {};
      if (profileRes.ok) {
        dbUser = await profileRes.json();
      }

      const detailAddressFinal =
        formData?.detailAddress && formData.detailAddress.trim() !== ""
          ? formData.detailAddress
          : formData?.rawMapAddress || "Cianjur";

      // 2. Kirim data pesanan ke Backend
      const res = await fetch("http://127.0.0.1:8080/api/v1/user/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          customer_name: dbUser?.name || "Reyhan Tri Ramadan",
          customer_email: dbUser?.email || "reyhan@example.com",
          customer_phone: dbUser?.phone || "081234567890",

          province_name: formData?.provinceName || "",
          city_name: formData?.cityName || "",
          district_name: formData?.districtName || "",
          village_name: formData?.villageName || "",
          postal_code: formData?.postalCode || "",

          detail_address: detailAddressFinal,
          map_coordinates: formData?.mapCoordinates || "",
          raw_map_address: formData?.rawMapAddress || "",

          courier: formData?.courier || "JNE",
          shipping_cost: Number(formData?.shippingCost) || 0,

          // 🚀 KUNCI PERBAIKAN: Amankan ekstraksi ID produk dari array keranjang
          cart_items: cart.map((item) => {
            const rawIdString = item?.id || item?.product_id || "";
            // Mengambil "PROD-35930505" dari "PROD-35930505_One Size_Earth Green"
            const cleanSku = rawIdString.split("_")[0];

            return {
              product_id: cleanSku, // Dikirim string murni menuju CartItemInput (string)
              quantity: Number(item?.qty || item?.quantity || 1),
            };
          }),
        }),
      });

      const resData = await res.json();
      console.log("Response Akhir Backend:", resData);

      if (!res.ok) {
        throw new Error(resData.message || "Gagal memproses checkout");
      }

      if (resData.snap_token) {
        window.snap.pay(resData.snap_token, {
          onSuccess: function (result) {
            alert("Pembayaran sukses dikonfirmasi!");
          },
        });
      }
    } catch (err) {
      console.error("Error Checkout:", err);
      alert(err.message);
    }
  };

  // Handler Event Klik pada Peta
  function MapEventsHandler() {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setPosition([lat, lng]);
        setZoomLevel(15); // Perbesar otomatis agar pinpoint lebih presisi saat diklik
        reverseGeocode(lat, lng); // Trigger pengambilan data koordinat & alamat hanya di sini
      },
    });
    return null;
  }

  function ChangeMapView({ center, zoom }) {
    const map = useMap();
    map.setView(center, zoom);
    return null;
  }

  // Custom styling untuk React Select
  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      borderRadius: "0.75rem",
      borderColor: state.isFocused ? "#f59e0b" : "#e2e8f0",
      padding: "2px",
      boxShadow: state.isFocused
        ? "0 0 0 2px rgba(245, 158, 11, 0.2)"
        : "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
      fontSize: "0.875rem",
      backgroundColor: "white",
      outline: "none",
      "&:hover": { borderColor: state.isFocused ? "#f59e0b" : "#cbd5e1" },
    }),
    placeholder: (provided) => ({ ...provided, color: "#94a3b8" }),
    option: (provided, state) => ({
      ...provided,
      fontSize: "0.875rem",
      backgroundColor: state.isSelected
        ? "#f59e0b"
        : state.isFocused
          ? "#fef3c7"
          : "white",
      color: state.isSelected ? "white" : "#334155",
      "&:active": { backgroundColor: "#f59e0b" },
    }),
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-10 px-4 sm:px-6 lg:px-8 font-sans text-slate-800 antialiased">
      <div className="max-w-7xl mx-auto lg:grid lg:grid-cols-12 lg:gap-x-8 gap-y-8">
        {/* ================= KIRI: FORM ALAMAT ================= */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-slate-100 shadow-sm space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                Alamat Pengiriman
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Lengkapi informasi lokasi pengiriman pesanan Anda dengan benar
              </p>
            </div>
            <button
              type="button"
              onClick={autoDetectLocation}
              className="self-start sm:self-center text-xs bg-amber-50 text-amber-700 font-bold px-4 py-2 rounded-xl border border-amber-200 hover:bg-amber-100/80 active:scale-95 transition-all flex items-center gap-1.5 shadow-sm"
            >
              <span>📍</span>{" "}
              {isLocating ? "Mendeteksi..." : "Gunakan Lokasi GPS Saya"}
            </button>
          </div>

          {/* Kontak */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Kontak Penerima
            </h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full rounded-xl border-slate-200 p-3 border text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all placeholder:text-slate-400 shadow-sm"
                  placeholder="Contoh: Ahmad Subagja"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Nomor Handphone <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) =>
                    setCustomerPhone(e.target.value.replace(/\D/g, ""))
                  }
                  className="w-full rounded-xl border-slate-200 p-3 border text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all placeholder:text-slate-400 shadow-sm"
                  placeholder="Contoh: 081234567890"
                />
              </div>
            </div>
          </div>

          {/* Wilayah Administrasi */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Wilayah Administrasi{" "}
              <span className="text-[10px] text-amber-600 lowercase font-normal italic">
                (Ketik untuk mencari wilayah)
              </span>
            </h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Provinsi <span className="text-red-500">*</span>
                </label>
                <Select
                  options={provinces}
                  styles={customSelectStyles}
                  placeholder="Cari Provinsi..."
                  noOptionsMessage={() => "Provinsi tidak ditemukan"}
                  onChange={handleProvinceChange}
                  value={
                    formData.provinceId
                      ? {
                          value: formData.provinceId,
                          label: formData.provinceName,
                        }
                      : null
                  }
                  isClearable
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Kota / Kabupaten <span className="text-red-500">*</span>
                </label>
                <Select
                  options={cities}
                  styles={customSelectStyles}
                  placeholder="Cari Kota/Kab..."
                  noOptionsMessage={() => "Kota/Kabupaten tidak ditemukan"}
                  onChange={handleCityChange}
                  value={
                    formData.cityId
                      ? { value: formData.cityId, label: formData.cityName }
                      : null
                  }
                  isDisabled={!formData.provinceId}
                  isClearable
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Kecamatan <span className="text-red-500">*</span>
                </label>
                <Select
                  options={districts}
                  styles={customSelectStyles}
                  placeholder="Cari Kecamatan..."
                  noOptionsMessage={() => "Kecamatan tidak ditemukan"}
                  onChange={handleDistrictChange}
                  value={
                    formData.districtId
                      ? {
                          value: formData.districtId,
                          label: formData.districtName,
                        }
                      : null
                  }
                  isDisabled={!formData.cityId}
                  isClearable
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Kelurahan / Desa
                </label>
                <input
                  type="text"
                  value={formData.villageName || ""}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, villageName: e.target.value }))
                  }
                  className="w-full rounded-xl border-slate-200 p-3 border text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all placeholder:text-slate-400 shadow-sm"
                  placeholder="Ketik nama kelurahan / desa"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Kode Pos
                </label>
                <input
                  type="text"
                  maxLength={5}
                  value={formData.postalCode || ""}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      postalCode: e.target.value.replace(/\D/g, ""),
                    }))
                  }
                  className="w-full rounded-xl border-slate-200 p-3 border text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all placeholder:text-slate-400 shadow-sm"
                  placeholder="Contoh: 43281"
                />
              </div>
            </div>
          </div>

          {/* Peta Pinpoint */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                Pinpoint Lokasi Kurir{" "}
                <span className="text-[10px] text-amber-600 lowercase font-normal italic">
                  (Silakan klik/ketuk peta untuk memilih lokasi pas)
                </span>
              </label>
              {isMapActive && (
                <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md font-bold border border-emerald-200">
                  ● Peta Aktif
                </span>
              )}
            </div>

            <div className="h-56 w-full rounded-2xl overflow-hidden border border-slate-100 shadow-inner relative z-10 bg-slate-50">
              {!isMapActive ? (
                <div
                  onClick={() => setIsMapActive(true)}
                  className="w-full h-full flex flex-col items-center justify-center cursor-pointer group hover:bg-slate-100/70 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center text-xl shadow-sm group-hover:scale-110 transition-transform duration-300">
                    🗺️
                  </div>
                  <p className="text-sm font-semibold text-slate-700 mt-3">
                    Klik di sini untuk mengaktifkan peta pinpoint
                  </p>
                </div>
              ) : (
                <MapContainer
                  center={position}
                  zoom={zoomLevel}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="© OpenStreetMap"
                  />
                  {/* Hanya tampilkan Marker jika koordinat sudah terekam (peta sudah pernah diklik) */}
                  {formData.mapCoordinates && <Marker position={position} />}
                  <MapEventsHandler />
                  <ChangeMapView center={position} zoom={zoomLevel} />
                </MapContainer>
              )}
            </div>

            {/* Data Hasil Deteksi Peta Digital */}
            <div className="mt-3 bg-slate-50 border border-slate-200/60 rounded-xl p-3.5 space-y-2.5">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                🛰️ Data Hasil Deteksi Peta Digital
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">
                    Titik Koordinat (GPS)
                  </label>
                  <input
                    type="text"
                    readOnly
                    disabled
                    value={
                      formData.mapCoordinates || "Belum memilih lokasi di peta"
                    }
                    className="w-full rounded-lg bg-slate-100 border border-slate-200 p-2 text-xs font-mono text-slate-500 cursor-not-allowed"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">
                    Alamat Acuan Peta Bumi
                  </label>
                  <input
                    type="text"
                    readOnly
                    disabled
                    value={
                      formData.rawMapAddress ||
                      "Silakan klik area di dalam peta untuk menandai titik..."
                    }
                    className="w-full rounded-lg bg-slate-100 border border-slate-200 p-2 text-xs text-slate-500 cursor-not-allowed truncate"
                    title={formData.rawMapAddress}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Rincian Alamat Manual */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
              Rincian Alamat Fisik Manual{" "}
              <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.detailAddress}
              onChange={(e) =>
                setFormData((p) => ({ ...p, detailAddress: e.target.value }))
              }
              rows={4}
              className="w-full rounded-xl border-slate-200 p-3.5 border text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all placeholder:text-slate-400 shadow-sm resize-none"
              placeholder="Tuliskan nama jalan, nomor rumah, RT/RW, atau patokan dekat lokasi Anda secara detail..."
            />
          </div>
        </div>

        {/* ================= KANAN: RINGKASAN BELANJA ================= */}
        <div className="mt-8 lg:mt-0 lg:col-span-5">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-5 sticky top-6">
            <h3 className="text-lg font-bold text-slate-900 pb-2 border-b border-slate-100">
              Ringkasan Belanja
            </h3>

            <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
              {cart.length === 0 ? (
                <p className="text-sm text-slate-400 py-4 text-center">
                  Tidak ada produk dalam checkout.
                </p>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-start text-sm pb-2 border-b border-slate-50 last:border-0"
                  >
                    <div className="flex flex-col min-w-0 pr-2">
                      <span className="font-medium text-slate-700 truncate">
                        {item.product?.name}
                      </span>
                      <span className="text-xs text-slate-400 mt-0.5">
                        Qty: {item.quantity} pcs{" "}
                        {item.size && `| Size: ${item.size}`}{" "}
                        {item.color && `| Color: ${item.color}`}
                      </span>
                    </div>
                    <span className="font-semibold text-slate-900 shrink-0">
                      {formatRupiah((item.product?.price || 0) * item.quantity)}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-2.5 text-sm">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal ({cart.length} Jenis Produk)</span>
                <span className="font-medium text-slate-700">
                  {formatRupiah(productTotal)}
                </span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Total Ongkos Kirim</span>
                <span className="text-emerald-600 font-bold text-xs uppercase tracking-wider">
                  FREE
                </span>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total Tagihan
              </span>
              <span className="text-2xl font-black text-amber-600 tracking-tight">
                {formatRupiah(grandTotal)}
              </span>
            </div>

            <button
              type="button"
              onClick={handleCheckout}
              disabled={cart.length === 0}
              className="mt-2 w-full bg-slate-900 text-white rounded-xl py-3.5 text-sm font-bold shadow-md hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-all"
            >
              Lanjutkan ke Pembayaran
            </button>

            {toast.show && (
              <Toast
                message={toast.message}
                type={toast.type}
                onClose={() => setToast({ ...toast, show: false })}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
