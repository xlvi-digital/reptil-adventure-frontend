import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import API from "../api/axios"; // 🚀 Menggunakan instance Axios bawaan agar base URL & interceptor seragam

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function CheckoutComponent({
  cart = [],
  onCheckoutSuccess,
  clearCart,
}) {
  const navigate = useNavigate();

  // ================= State Form Utama =================
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");

  const [formData, setFormData] = useState({
    provinceId: "",
    provinceName: "",
    cityId: "",
    cityName: "",
    districtName: "", // 🚀 Input teks mandiri untuk Kecamatan
    villageName: "", // 🚀 Input teks mandiri untuk Kelurahan / Desa
    postalCode: "",
    detailAddress: "",
    courier: "jne",
    mapCoordinates: "",
    rawMapAddress: "",
  });

  // State Data Wilayah untuk Dropdown RajaOngkir
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);

  // State Layanan Kurir & Ongkir RajaOngkir
  const [shippingOptions, setShippingOptions] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [shippingCost, setShippingCost] = useState(0);
  const [loadingOngkir, setLoadingOngkir] = useState(false);

  // State Koordinat Peta
  const [position, setPosition] = useState([-2.5489, 118.0149]);
  const [zoomLevel, setZoomLevel] = useState(5);
  const [isLocating, setIsLocating] = useState(false);
  const [isMapActive, setIsMapActive] = useState(false);
  const [hasPinnedLocation, setHasPinnedLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
  };

  // ================= KALKULASI BERDASARKAN DATA CART =================
  const totalWeight = cart.reduce((sum, item) => {
    const weight =
      item.product?.weight && item.product?.weight > 0
        ? item.product.weight
        : 300;
    return sum + weight * Number(item.quantity || 1);
  }, 0);

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

  // Reverse Geocoding
  const reverseGeocode = async (lat, lng) => {
    try {
      // Menggunakan API instance agar mengarah ke base URL production yang benar
      const response = await API.get(`/geocode/reverse?lat=${lat}&lon=${lng}`);
      const data = response.data;

      if (data && data.display_name) {
        setFormData((prev) => ({
          ...prev,
          mapCoordinates: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
          rawMapAddress: data.display_name,
        }));
      }
      setHasPinnedLocation(true);
    } catch (error) {
      console.error("Gagal mengambil data geocoding:", error.message);
    }
  };

  // GPS Deteksi Manual
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
        setHasPinnedLocation(true);
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

  const activateMapAndDetectLocation = () => {
    setIsMapActive(true);
    if (!hasPinnedLocation) {
      autoDetectLocation();
    }
  };

  useEffect(() => {
    if (formData.mapCoordinates) {
      const [lat, lng] = formData.mapCoordinates
        .split(",")
        .map((value) => Number(value.trim()));
      if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
        setPosition([lat, lng]);
        setZoomLevel(16);
        setHasPinnedLocation(true);
      }
    }
  }, [formData.mapCoordinates]);

  useEffect(() => {
    const initializeForm = async () => {
      try {
        // 💡 Kita tembak langsung ke root domain tanpa "/api/v1"
        const response = await fetch(
          "https://xlvi-digital-reptil-adventure-api.hf.space/shippings/provinces",
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const resData = await response.json();
        const provincesData = resData.data || resData || [];

        const provinceOptions = provincesData.map((prov) => ({
          value: prov.province_id,
          label: prov.province,
        }));
        setProvinces(provinceOptions);

        const savedAddress = localStorage.getItem("user_saved_address");
        if (savedAddress) {
          try {
            const parsed = JSON.parse(savedAddress);
            let provinceId = parsed.provinceId || "";
            const provinceName = parsed.provinceName || "";
            let cityId = parsed.cityId || "";
            const cityName = parsed.cityName || "";

            if (provinceId) {
              const citiesRes = await API.get(
                `/shippings/cities?province=${provinceId}`,
              );
              const citiesData = citiesRes.data?.data || citiesRes.data || [];
              const cityOptions = citiesData.map((city) => ({
                value: city.city_id,
                label: `${city.type} ${city.city_name}`,
              }));
              setCities(cityOptions);
            }

            setFormData((prev) => ({
              ...prev,
              provinceId,
              provinceName: provinceName || prev.provinceName,
              cityId,
              cityName: cityName || prev.cityName,
              districtName: parsed.districtName || prev.districtName,
              villageName: parsed.villageName || prev.villageName,
              postalCode: parsed.postalCode || prev.postalCode,
              detailAddress: parsed.detailAddress || prev.detailAddress,
            }));
          } catch (err) {
            console.warn("Gagal memuat alamat tersimpan:", err);
          }
        }
      } catch (err) {
        console.error("Gagal load data provinsi awal:", err);
      }

      const savedUser = localStorage.getItem("user_data");
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          setCustomerName(parsedUser.name || "");
          setCustomerPhone(parsedUser.phone || "");
          setCustomerEmail(parsedUser.email || "");
        } catch (err) {
          console.warn("Gagal memuat data user tersimpan:", err);
        }
      }
    };

    initializeForm();
  }, []);

  // Hitung Ongkir Otomatis saat Kota atau Kurir Berubah
  useEffect(() => {
    if (formData.cityId && formData.courier && totalWeight > 0) {
      const fetchShippingCost = async () => {
        setLoadingOngkir(true);
        try {
          const response = await API.post("/shippings/cost", {
            destination: formData.cityId,
            weight: totalWeight,
            courier: formData.courier,
          });
          const costData = response.data?.data || response.data || [];
          setShippingOptions(costData);
          setSelectedService(null);
          setShippingCost(0);
        } catch (error) {
          console.error("Gagal mengambil tarif ongkir:", error);
          showToast("Gagal memuat biaya pengiriman.", "warning");
        } finally {
          // 💡 Pastikan double 'l' di sini ya!
          setLoadingOngkir(false);
        }
      };

      fetchShippingCost();
    }
  }, [formData.cityId, formData.courier, totalWeight]);

  const loadAddressFromAccount = async () => {
    try {
      const profileRes = await API.get("/user/profile");
      const profileData = profileRes.data?.data || profileRes.data || {};
      const address = profileData?.shipping_address || {};

      let selectedProvinceId = address.province_id || "";
      let selectedCityId = address.city_id || "";

      if (selectedProvinceId) {
        const citiesRes = await API.get(
          `/shippings/cities?province=${selectedProvinceId}`,
        );
        const citiesData = citiesRes.data?.data || citiesRes.data || [];
        const cityOptions = citiesData.map((city) => ({
          value: city.city_id,
          label: `${city.type} ${city.city_name}`,
        }));
        setCities(cityOptions);
      }

      setFormData((prev) => ({
        ...prev,
        provinceId: selectedProvinceId,
        provinceName: address.province || prev.provinceName,
        cityId: selectedCityId,
        cityName: address.city || prev.cityName,
        districtName: address.district || prev.districtName,
        villageName: address.village || prev.villageName,
        postalCode: address.postal_code || prev.postalCode,
        detailAddress: address.manual_details || prev.detailAddress,
      }));

      if (profileData.name) setCustomerName(profileData.name);
      if (profileData.phone) setCustomerPhone(profileData.phone);
      if (profileData.email) setCustomerEmail(profileData.email);

      showToast("Alamat akun berhasil diterapkan ke checkout.", "success");
    } catch (err) {
      console.error("Gagal memuat alamat akun:", err);
      alert("Gagal mengambil alamat akun. Pastikan Anda sudah login.");
    }
  };

  const handleProvinceChange = async (selectedOption) => {
    const id = selectedOption ? selectedOption.value : "";
    const name = selectedOption ? selectedOption.label : "";

    setFormData((prev) => ({
      ...prev,
      provinceId: id,
      provinceName: name,
      cityId: "",
      cityName: "",
    }));
    setCities([]);
    setShippingOptions([]);
    setShippingCost(0);

    if (id) {
      try {
        const res = await API.get(`/shippings/cities?province=${id}`);
        const data = res.data?.data || res.data || [];
        const formatted = data.map((city) => ({
          value: city.city_id,
          label: `${city.type} ${city.city_name}`,
        }));
        setCities(formatted);
      } catch (err) {
        console.error("Gagal load kabupaten/kota:", err);
      }
    }
  };

  const handleCityChange = (selectedOption) => {
    const id = selectedOption ? selectedOption.value : "";
    const name = selectedOption ? selectedOption.label : "";

    setFormData((prev) => ({ ...prev, cityId: id, cityName: name }));
    setShippingOptions([]);
    setShippingCost(0);
  };

  const handleServiceSelect = (option) => {
    setSelectedService(option);
    setShippingCost(option.cost[0].value);
  };

  const handleCheckout = async () => {
    if (isSubmitting) return;

    if (!formData.cityId || !selectedService) {
      alert(
        "Silakan lengkapi alamat dan pilih opsi pengiriman kurir terlebih dahulu.",
      );
      return;
    }

    try {
      setIsSubmitting(true);

      let dbUser = {};
      try {
        const profileRes = await API.get("/user/profile");
        dbUser = profileRes.data?.data || profileRes.data || {};
      } catch (profileErr) {
        console.warn("Gagal mengambil profil real-time:", profileErr);
      }

      const detailAddressFinal =
        formData?.detailAddress && formData.detailAddress.trim() !== ""
          ? formData.detailAddress
          : formData?.rawMapAddress || "Cianjur";

      const res = await API.post("/user/orders", {
        customer_name: dbUser?.name || customerName || "Customer",
        customer_email: dbUser?.email || customerEmail || "",
        customer_phone: dbUser?.phone || customerPhone || "",
        province_name: formData?.provinceName || "",
        city_name: formData?.cityName || "",
        district_name: formData?.districtName || "", // 🚀 Mengirim nilai Kecamatan mandiri
        village_name: formData?.villageName || "", // 🚀 Mengirim nilai Kelurahan / Desa mandiri
        postal_code: formData?.postalCode || "",
        detail_address: `${detailAddressFinal} (Kurir: ${formData.courier.toUpperCase()} - ${selectedService.service})`,
        map_coordinates: formData?.mapCoordinates || "",
        raw_map_address: formData?.rawMapAddress || "",
        courier: formData?.courier.toUpperCase(),
        shipping_cost: Number(shippingCost),
        cart_items: cart.map((item) => {
          const rawIdString = item?.id || item?.product_id || "";
          const cleanSku = rawIdString.split("_")[0];
          return {
            product_id: cleanSku,
            quantity: Number(item?.qty || item?.quantity || 1),
          };
        }),
      });

      const resData = res.data;
      const invoiceNumber =
        resData.order_invoice || resData.invoice_number || "INV-UNKNOWN";
      const statusValue = resData.status || "PENDING";

      if (typeof clearCart === "function") clearCart();
      if (typeof onCheckoutSuccess === "function")
        onCheckoutSuccess({ invoiceNumber, status: statusValue });

      if (resData.snap_token && window.snap) {
        window.snap.pay(resData.snap_token, {
          onSuccess: () =>
            navigate(
              `/order-success?invoice=${encodeURIComponent(invoiceNumber)}&status=PAID`,
            ),
          onPending: () =>
            navigate(
              `/order-success?invoice=${encodeURIComponent(invoiceNumber)}&status=PENDING`,
            ),
          onError: () =>
            navigate(
              `/order-success?invoice=${encodeURIComponent(invoiceNumber)}&status=PENDING`,
            ),
          onClose: () => setIsSubmitting(false),
        });
      } else {
        navigate(
          `/order-success?invoice=${encodeURIComponent(invoiceNumber)}&status=${encodeURIComponent(statusValue)}`,
        );
      }
    } catch (err) {
      console.error("Error Checkout:", err);
      alert(
        err.response?.data?.message ||
          err.message ||
          "Gagal memproses checkout",
      );
      setIsSubmitting(false);
    }
  };

  function MapEventsHandler() {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setPosition([lat, lng]);
        setZoomLevel(15);
        setHasPinnedLocation(true);
        reverseGeocode(lat, lng);
      },
    });
    return null;
  }

  function ChangeMapView({ center, zoom }) {
    const map = useMap();
    map.setView(center, zoom);
    return null;
  }

  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      borderRadius: "0.75rem",
      borderColor: state.isFocused ? "#f59e0b" : "#e2e8f0",
      padding: "2px",
      fontSize: "0.875rem",
      backgroundColor: "white",
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
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={loadAddressFromAccount}
                className="text-xs bg-amber-50 text-amber-700 font-bold px-4 py-2 rounded-xl border border-amber-200 hover:bg-amber-100/80 active:scale-95 transition-all flex items-center gap-1.5 shadow-sm"
              >
                <span>📍</span> Gunakan Alamat Akun
              </button>
              <button
                type="button"
                onClick={activateMapAndDetectLocation}
                className="text-xs bg-slate-900 text-white font-bold px-4 py-2 rounded-xl border border-slate-900 hover:bg-slate-800 active:scale-95 transition-all flex items-center gap-1.5 shadow-sm"
              >
                <span>📡</span>{" "}
                {isLocating ? "Mendeteksi..." : "Gunakan Lokasi Saya"}
              </button>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
            <span className="text-slate-500 font-medium">
              ⚖️ Total Berat Paket:
            </span>
            <span className="font-bold text-amber-600">
              {(totalWeight / 1000).toFixed(2)} kg ({totalWeight} gram)
            </span>
          </div>

          <div className="space-y-4">
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

          {/* Wilayah Administrasi */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Wilayah Administrasi
            </h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Provinsi <span className="text-red-500">*</span>
                </label>
                <Select
                  options={provinces}
                  styles={customSelectStyles}
                  placeholder="Cari Provinsi..."
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
            </div>

            {/* 🚀 SEKARANG DIPISAH: Input Mandiri Kecamatan & Kelurahan/Desa */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Kecamatan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.districtName || ""}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, districtName: e.target.value }))
                  }
                  className="w-full rounded-xl border-slate-200 p-3 border text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none"
                  placeholder="Contoh: Karangtengah"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Kelurahan / Desa <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.villageName || ""}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, villageName: e.target.value }))
                  }
                  className="w-full rounded-xl border-slate-200 p-3 border text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none"
                  placeholder="Contoh: Desa Bojong"
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
                  className="w-full rounded-xl border-slate-200 p-3 border text-sm focus:border-amber-500"
                  placeholder="43281"
                />
              </div>
            </div>
          </div>

          {/* Opsi Ekspedisi */}
          <div className="space-y-4 pt-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              📦 Ekspedisi Pengiriman
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {["jne", "pos", "tiki"].map((courierOption) => (
                <div
                  key={courierOption}
                  onClick={() =>
                    setFormData((p) => ({ ...p, courier: courierOption }))
                  }
                  className={`p-3 border rounded-xl text-center font-bold text-sm uppercase cursor-pointer transition-all ${
                    formData.courier === courierOption
                      ? "border-amber-500 bg-amber-50 text-amber-700 shadow-sm"
                      : "border-slate-200 hover:bg-slate-50 text-slate-600"
                  }`}
                >
                  {courierOption}
                </div>
              ))}
            </div>

            {loadingOngkir && (
              <p className="text-xs text-amber-600 italic">
                Sedang mengecek tarif kurir...
              </p>
            )}

            {shippingOptions.length > 0 && !loadingOngkir && (
              <div className="space-y-2 mt-3">
                <label className="block text-xs font-semibold text-slate-600">
                  Pilih Paket Layanan:
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {shippingOptions.map((option, index) => (
                    <div
                      key={index}
                      onClick={() => handleServiceSelect(option)}
                      className={`p-3 border rounded-xl flex justify-between items-center cursor-pointer text-xs transition-all ${
                        selectedService?.service === option.service
                          ? "border-emerald-500 bg-emerald-50/50 text-emerald-900 font-medium"
                          : "border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <div>
                        <p className="font-bold uppercase text-slate-800">
                          {formData.courier} - {option.service}
                        </p>
                        <p className="text-slate-400 text-[11px]">
                          Estimasi Pengiriman: {option.cost[0].etd} Hari
                        </p>
                      </div>
                      <span className="font-bold text-sm text-slate-900">
                        {formatRupiah(option.cost[0].value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Peta Pinpoint */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
              Pinpoint Lokasi Koordinat
            </label>
            <div className="h-56 w-full rounded-2xl overflow-hidden border border-slate-100 shadow-inner relative z-10 bg-slate-50">
              {!isMapActive ? (
                <div
                  onClick={activateMapAndDetectLocation}
                  className="w-full h-full flex flex-col items-center justify-center cursor-pointer group hover:bg-slate-100/70"
                >
                  <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center text-xl shadow-sm group-hover:scale-110 transition-all">
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
                  {(hasPinnedLocation || formData.mapCoordinates) && (
                    <Marker position={position} />
                  )}
                  <MapEventsHandler />
                  <ChangeMapView center={position} zoom={zoomLevel} />
                </MapContainer>
              )}
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
              rows={3}
              className="w-full rounded-xl border-slate-200 p-3.5 border text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none shadow-sm resize-none"
              placeholder="Tuliskan nama jalan, nomor rumah, RT/RW, atau patokan dekat lokasi..."
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
                        Qty: {item.quantity} pcs
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
                <span
                  className={
                    shippingCost > 0
                      ? "font-semibold text-slate-800"
                      : "text-amber-600 font-bold text-xs"
                  }
                >
                  {shippingCost > 0
                    ? formatRupiah(shippingCost)
                    : "BELUM DIPILIH"}
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
              onClick={handleCheckout}
              disabled={isSubmitting || !selectedService}
              className={`w-full py-4 rounded-xl font-bold transition-all text-white ${
                isSubmitting || !selectedService
                  ? "bg-neutral-400 cursor-not-allowed"
                  : "bg-emerald-500 hover:bg-emerald-600"
              }`}
            >
              {isSubmitting ? "Memproses Pesanan..." : "Konfirmasi & Bayar"}
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
