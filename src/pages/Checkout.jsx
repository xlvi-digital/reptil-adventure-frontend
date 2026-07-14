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
import API from "../api/axios";

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

  const [shippingCost, setShippingCost] = useState(0);
  const [shippingOptions, setShippingOptions] = useState([]); // Untuk menampung layanan kurir (misal: JNE OKE, REG, YES)
  const [selectedService, setSelectedService] = useState(""); // Layanan kurir terpilih
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);

  const [formData, setFormData] = useState({
    provinceId: "",
    provinceName: "",
    cityId: "",
    cityName: "",
    districtId: "",
    districtName: "",
    postalCode: "",
    villageName: "", // Kelurahan berupa text input manual
    detailAddress: "",
    courier: "JNE",
    mapCoordinates: "",
    rawMapAddress: "",
  });

  // State Data Wilayah untuk Dropdown
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);

  // State Koordinat Peta
  const [position, setPosition] = useState([-2.5489, 118.0149]);
  const [zoomLevel, setZoomLevel] = useState(5);
  const [isLocating, setIsLocating] = useState(false);
  const [isMapActive, setIsMapActive] = useState(false);
  const [hasPinnedLocation, setHasPinnedLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State Toast
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
  };

  const BASE_URL = "https://xlvi-digital-reptil-adventure-api.hf.space";

  // ================= KALKULASI BERDASARKAN DATA CART =================
  // const shippingCost = 0;
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
      const response = await fetch(
        `${BASE_URL}/api/v1/geocode/reverse?lat=${lat}&lon=${lng}`,
      );
      if (!response.ok)
        throw new Error(`Server merespon dengan status ${response.status}`);

      const data = await response.json();
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
    if (!hasPinnedLocation) autoDetectLocation();
  };

  const calculateShipping = async (destinationCityId, courierName) => {
    if (!destinationCityId) return;

    setIsCalculatingShipping(true);
    try {
      // Hitung total berat barang belanjaan (default 1000 gram per jenis barang jika kosong)
      const totalWeight = cart.reduce(
        (sum, item) =>
          sum +
          Number(item.product?.weight || 1000) * Number(item.quantity || 1),
        0,
      );

      const response = await fetch(`${BASE_URL}/api/v1/shippings/cost`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          origin: "103", // Ganti dengan ID Kota asal tokomu (Contoh: 103 untuk Cianjur)
          destination: destinationCityId,
          weight: totalWeight,
          courier: courierName.toLowerCase(), // RajaOngkir biasanya menggunakan huruf kecil (jne, pos, tiki)
        }),
      });

      if (!response.ok) throw new Error("Gagal menghitung ongkos kirim");

      const json = await response.json();
      // Mengambil data cost dari response RajaOngkir
      const results = json.data?.[0]?.costs || json?.[0]?.costs || [];

      setShippingOptions(results);

      if (results.length > 0) {
        // Pilih layanan pertama secara default (misal: REG)
        const defaultService = results[0];
        setSelectedService(
          `${defaultService.service} - ${defaultService.description}`,
        );
        setShippingCost(defaultService.cost[0].value);
      } else {
        setShippingCost(0);
        showToast("Kurir tidak melayani rute ini.", "warning");
      }
    } catch (err) {
      console.error("Error shipping cost:", err);
      showToast(
        "Gagal memuat ongkos kirim. Silakan coba kurir lain.",
        "warning",
      );
    } finally {
      setIsCalculatingShipping(false);
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

  // ================= AMBIL DATA WILAYAH DARI DATABASE BACKEND =================

  // 1. Load Provinsi Pertama Kali
  useEffect(() => {
    const initializeForm = async () => {
      try {
        // 🚀 DISELARASKAN: Menggunakan /api/v1/shippings/provinces sesuai routes.go
        const provincesRes = await fetch(
          `${BASE_URL}/api/v1/shippings/provinces`,
        );
        if (!provincesRes.ok) throw new Error(`Status: ${provincesRes.status}`);

        const provincesJson = await provincesRes.json();
        const provincesData = provincesJson.data || provincesJson || [];

        const provinceOptions = provincesData.map((prov) => ({
          value: prov.province_id || prov.id,
          label: prov.province || prov.nama,
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
            let districtId = parsed.districtId || "";
            const districtName = parsed.districtName || "";

            if (provinceId) {
              // 🚀 DISELARASKAN: Menggunakan /api/v1/shippings/cities?province=...
              const citiesRes = await fetch(
                `${BASE_URL}/api/v1/shippings/cities?province_id=${provinceId}`,
              );
              if (citiesRes.ok) {
                const citiesJson = await citiesRes.json();
                const citiesData = citiesJson.data || citiesJson || [];
                const cityOptions = citiesData.map((city) => ({
                  value: city.city_id || city.id,
                  label: city.city_name
                    ? `${city.type || ""} ${city.city_name}`
                    : city.nama,
                }));
                setCities(cityOptions);

                if (cityId) {
                  // 🚀 DISELARASKAN: Menggunakan /api/v1/districts?regency_id=... sesuai routes.go
                  const districtsRes = await fetch(
                    `${BASE_URL}/api/v1/districts?regency_id=${cityId}`,
                  );
                  if (districtsRes.ok) {
                    const districtsJson = await districtsRes.json();
                    const districtsData =
                      districtsJson.data || districtsJson || [];
                    const districtOptions = districtsData.map((dist) => ({
                      value: dist.id || dist.district_id,
                      label: dist.nama || dist.district_name,
                    }));
                    setDistricts(districtOptions);
                  }
                }
              }
            }

            setFormData((prev) => ({
              ...prev,
              provinceId,
              provinceName: provinceName || prev.provinceName,
              cityId,
              cityName: cityName || prev.cityName,
              districtId,
              districtName: districtName || prev.districtName,
              villageName: parsed.villageName || prev.villageName,
              postalCode: parsed.postalCode || prev.postalCode,
              detailAddress: parsed.detailAddress || prev.detailAddress,
            }));
          } catch (err) {
            console.warn("Gagal memuat alamat tersimpan:", err);
          }
        }
      } catch (err) {
        console.error("Gagal load provinsi awal:", err);
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

  // ================= FUNGSI LOAD ALAMAT DARI AKUN =================
  const loadAddressFromAccount = async () => {
    try {
      // 1. Ambil data profil terbaru dari database API
      const res = await API.get("/user/profile");
      const profile = res.data?.data || res.data || {};

      if (profile) {
        setCustomerName(profile.name || customerName);
        setCustomerPhone(profile.phone || customerPhone);
        setCustomerEmail(profile.email || customerEmail);

        // Update form data berdasarkan alamat yang tersimpan di profile DB
        setFormData((prev) => ({
          ...prev,
          provinceId: profile.province_id || prev.provinceId,
          provinceName: profile.province_name || prev.provinceName,
          cityId: profile.city_id || prev.cityId,
          cityName: profile.city_name || prev.cityName,
          districtId: profile.district_id || prev.districtId,
          districtName: profile.district_name || prev.districtName,
          villageName: profile.village_name || prev.villageName,
          postalCode: profile.postal_code || prev.postalCode,
          detailAddress: profile.detail_address || prev.detailAddress,
          mapCoordinates: profile.map_coordinates || prev.mapCoordinates,
          rawMapAddress: profile.raw_map_address || prev.rawMapAddress,
        }));

        // 2. Jika profil memiliki ID provinsi & kota, load opsi dropdown bertingkatnya
        if (profile.province_id) {
          const citiesRes = await fetch(
            `${BASE_URL}/api/v1/shippings/cities?province_id=${profile.province_id}`,
          );
          if (citiesRes.ok) {
            const citiesJson = await citiesRes.json();
            const citiesData = citiesJson.data || citiesJson || [];
            const cityOptions = citiesData.map((city) => ({
              value: city.city_id || city.id,
              label: city.city_name
                ? `${city.type || ""} ${city.city_name}`
                : city.nama,
            }));
            setCities(cityOptions);
          }
        }

        if (profile.city_id) {
          const districtsRes = await fetch(
            `${BASE_URL}/api/v1/districts?regency_id=${profile.city_id}`,
          );
          if (districtsRes.ok) {
            const districtsJson = await districtsRes.json();
            const districtsData = districtsJson.data || districtsJson || [];
            const districtOptions = districtsData.map((dist) => ({
              value: dist.id || dist.district_id,
              label: dist.nama || dist.district_name,
            }));
            setDistricts(districtOptions);
          }
        }

        showToast("Alamat akun berhasil diterapkan!", "success");
      }
    } catch (err) {
      console.error("Gagal load alamat akun dari API:", err);

      // Fallback ke penyimpanan lokal (local storage) jika API profil bermasalah
      const savedAddress = localStorage.getItem("user_saved_address");
      if (savedAddress) {
        try {
          const parsed = JSON.parse(savedAddress);
          setFormData((prev) => ({
            ...prev,
            provinceId: parsed.provinceId || prev.provinceId,
            provinceName: parsed.provinceName || prev.provinceName,
            cityId: parsed.cityId || prev.cityId,
            cityName: parsed.cityName || prev.cityName,
            districtId: parsed.districtId || prev.districtId,
            districtName: parsed.districtName || prev.districtName,
            villageName: parsed.villageName || prev.villageName,
            postalCode: parsed.postalCode || prev.postalCode,
            detailAddress: parsed.detailAddress || prev.detailAddress,
            mapCoordinates: parsed.mapCoordinates || prev.mapCoordinates,
            rawMapAddress: parsed.rawMapAddress || prev.rawMapAddress,
          }));
          showToast("Alamat dimuat dari penyimpanan lokal.", "success");
        } catch (e) {
          showToast("Gagal memuat alamat akun.", "warning");
        }
      } else {
        showToast("Belum ada alamat yang tersimpan di profil Anda.", "warning");
      }
    }
  };

  // 2. Ketika Provinsi Berubah
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
      // 🚀 DISELARASKAN: Menggunakan /api/v1/shippings/cities?province=...
      fetch(`${BASE_URL}/api/v1/shippings/cities?province_id=${id}`)
        .then((res) => {
          if (!res.ok) throw new Error();
          return res.json();
        })
        .then((json) => {
          const data = json.data || json || [];
          const formatted = data.map((city) => ({
            value: city.city_id || city.id,
            label: city.city_name
              ? `${city.type || ""} ${city.city_name}`
              : city.nama,
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
    setShippingOptions([]);
    setShippingCost(0);

    if (id) {
      // Ambil data kecamatan
      fetch(`${BASE_URL}/api/v1/districts?regency_id=${id}`)
        .then((res) => res.json())
        .then((json) => {
          const data = json.data || json || [];
          const formatted = data.map((dist) => ({
            value: dist.id || dist.district_id,
            label: dist.nama || dist.district_name,
          }));
          setDistricts(formatted);
        })
        .catch((err) => console.error("Gagal load kecamatan:", err));

      // 🚀 HITUNG ONGKIR SEKALIGUS
      calculateShipping(id, formData.courier);
    }
  };

  // 4. Ketika Dropdown Kecamatan Dipilih
  const handleDistrictChange = (selectedOption) => {
    const id = selectedOption ? selectedOption.value : "";
    const name = selectedOption ? selectedOption.label : "";

    setFormData((prev) => ({
      ...prev,
      districtId: id,
      districtName: name,
    }));
  };

  const handleCourierChange = (e) => {
    const courier = e.target.value;
    setFormData((prev) => ({ ...prev, courier }));
    if (formData.cityId) {
      calculateShipping(formData.cityId, courier);
    }
  };

  // ================= PROSES KIRIM ORDER VIA AXIOS =================
  const handleCheckout = async () => {
    if (isSubmitting) return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Sesi Anda habis. Silakan login kembali.");
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
        customer_name: dbUser?.name || customerName,
        customer_email: dbUser?.email || customerEmail,
        customer_phone: dbUser?.phone || customerPhone,
        province_name: formData?.provinceName || "",
        city_name: formData?.cityName || "",
        district_name: formData?.districtName || "",
        village_name: formData?.villageName || "",
        postal_code: formData?.postalCode || "",
        detail_address: detailAddressFinal,
        map_coordinates: formData?.mapCoordinates || "",
        raw_map_address: formData?.rawMapAddress || "",
        courier: formData?.courier || "JNE",
        shipping_cost: shippingCost,
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
      if (typeof onCheckoutSuccess === "function") {
        onCheckoutSuccess({ invoiceNumber, status: statusValue });
      }

      if (resData.snap_token && window.snap) {
        window.snap.pay(resData.snap_token, {
          onSuccess: function () {
            navigate(
              `/order-success?invoice=${encodeURIComponent(invoiceNumber)}&status=PAID`,
            );
          },
          onPending: function () {
            navigate(
              `/order-success?invoice=${encodeURIComponent(invoiceNumber)}&status=PENDING`,
            );
          },
          onError: function () {
            navigate(
              `/order-success?invoice=${encodeURIComponent(invoiceNumber)}&status=PENDING`,
            );
          },
          onClose: function () {
            setIsSubmitting(false);
          },
        });
      } else {
        navigate(
          `/order-success?invoice=${encodeURIComponent(invoiceNumber)}&status=${encodeURIComponent(statusValue)}`,
        );
      }
    } catch (err) {
      console.error("Error Checkout:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Gagal memproses checkout";
      alert(errorMessage);
      setIsSubmitting(false);
    }
  };

  // Map Events
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
                className="self-start sm:self-center text-xs bg-amber-50 text-amber-700 font-bold px-4 py-2 rounded-xl border border-amber-200 hover:bg-amber-100/80 active:scale-95 transition-all flex items-center gap-1.5 shadow-sm"
              >
                <span>📍</span> Gunakan Alamat Akun
              </button>
              <button
                type="button"
                onClick={activateMapAndDetectLocation}
                className="self-start sm:self-center text-xs bg-slate-900 text-white font-bold px-4 py-2 rounded-xl border border-slate-900 hover:bg-slate-800 active:scale-95 transition-all flex items-center gap-1.5 shadow-sm"
              >
                <span>📡</span>{" "}
                {isLocating ? "Mendeteksi..." : "Gunakan Lokasi Saya"}
              </button>
            </div>
          </div>

          <div className="space-y-4">
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
              Wilayah Administrasi
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
                  Kelurahan / Desa <span className="text-red-500">*</span>
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

          {/* Pilihan Kurir & Layanan */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Pilih Kurir <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.courier}
                onChange={handleCourierChange}
                className="w-full rounded-xl border-slate-200 p-3 border text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all shadow-sm bg-white"
              >
                <option value="JNE">JNE (Jalur Nugraha Ekakurir)</option>
                <option value="POS">POS Indonesia</option>
                <option value="TIKI">TIKI</option>
              </select>
            </div>

            {shippingOptions.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Layanan Pengiriman <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedService}
                  onChange={(e) => {
                    const selected = shippingOptions.find(
                      (opt) =>
                        `${opt.service} - ${opt.description}` ===
                        e.target.value,
                    );
                    if (selected) {
                      setSelectedService(e.target.value);
                      setShippingCost(selected.cost[0].value);
                    }
                  }}
                  className="w-full rounded-xl border-slate-200 p-3 border text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all shadow-sm bg-white"
                >
                  {shippingOptions.map((opt, idx) => (
                    <option
                      key={idx}
                      value={`${opt.service} - ${opt.description}`}
                    >
                      {opt.service} ({opt.description}) -{" "}
                      {formatRupiah(opt.cost[0].value)} (Est: {opt.cost[0].etd}{" "}
                      hari)
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Peta Pinpoint */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                Pinpoint Lokasi Kurir
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
                  onClick={activateMapAndDetectLocation}
                  className="w-full h-full flex flex-col items-center justify-center cursor-pointer group hover:bg-slate-100/70 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center text-xl shadow-sm group-hover:scale-110 transition-transform duration-300">
                    🗺️
                  </div>
                  <p className="text-sm font-semibold text-slate-700 mt-3">
                    Klik di sini untuk mengaktifkan peta pinpoint dan deteksi
                    lokasi Anda
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
              onClick={handleCheckout}
              disabled={isSubmitting}
              className={`w-full py-4 rounded-xl font-bold transition-all text-white ${isSubmitting ? "bg-neutral-600 cursor-not-allowed" : "bg-emerald-500 hover:bg-emerald-600"}`}
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
