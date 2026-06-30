import React, { useState, useEffect, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import API from "../api/axios";
import {
  User,
  ShoppingBag,
  MapPin,
  LogOut,
  ShieldCheck,
  Truck,
  Calendar,
  Phone,
  Mail,
  Loader2,
  ChevronDown,
  Search,
  Camera,
} from "lucide-react";
import {
  getOrderCompletionState,
  getInvoiceNumber,
} from "../utils/orderStatus";

// ─── KOMPONEN DROPDOWN DENGAN SEARCH BAR (LUXURY THEME - DYNAMIC DATABASE) ───
function SearchableSelect({
  label,
  placeholder,
  value, // Ini berisi nama wilayah yang terpilih (string) untuk ditampilkan ke user
  onChange,
  options = [], // Sekarang menerima array of object: [{ id: 1, nama: "Jawa Barat" }]
  disabled,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter pencarian berdasarkan properti .nama dari database
  const filteredOptions = options.filter((opt) =>
    opt.nama?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wide mb-1.5 pl-0.5">
        {label}
      </label>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2.5 bg-neutral-50/50 border border-neutral-200 text-xs rounded-xl outline-none focus:border-neutral-900 transition flex justify-between items-center disabled:bg-neutral-100 disabled:text-neutral-400 disabled:cursor-not-allowed text-left"
      >
        <span
          className={
            value ? "text-neutral-900 font-medium" : "text-neutral-400"
          }
        >
          {value || placeholder}
        </span>
        <ChevronDown
          size={14}
          className={`text-neutral-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-neutral-200 shadow-xl rounded-xl max-h-56 overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="p-2 border-b border-neutral-100 flex items-center gap-2 bg-neutral-50">
            <Search size={12} className="text-neutral-400 shrink-0" />
            <input
              type="text"
              placeholder="Cari wilayah..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-xs outline-none text-neutral-800"
              autoFocus
            />
          </div>
          <div className="overflow-y-auto flex-1 py-1 max-h-40 minimal-scrollbar">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-2.5 text-xs text-neutral-400 italic">
                Data tidak ditemukan
              </div>
            ) : (
              filteredOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    onChange(opt); // Mengirimkan seluruh objek wilayah { id, nama } saat dipilih
                    setIsOpen(false);
                    setSearch("");
                  }}
                  className={`w-full text-left px-4 py-2 text-xs transition font-medium ${
                    value === opt.nama
                      ? "bg-neutral-900 text-white"
                      : "text-neutral-700 hover:bg-neutral-50"
                  }`}
                >
                  {opt.nama}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function UserAccount({ cartCount, onCartOpen, onSearchOpen }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  // Menyimpan ID wilayah aktif saat ini untuk keperluan trigger fetch data anak
  const [activeRegionIds, setActiveRegionIds] = useState({
    provinceId: "",
    cityId: "",
  });

  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "Laki-laki",
    birth_date: "",
    shipping_address: {
      province: "",
      city: "",
      district: "",
      village: "",
      postal_code: "",
      coordinates: "",
      map_reference: "",
      manual_details: "",
    },
  });

  const [transactions, setTransactions] = useState([]);
  const [productCatalog, setProductCatalog] = useState([]);
  const [productMap, setProductMap] = useState({});

  // ─── STATE LIST DATA WILAYAH DARI DATABASE/API ───
  const [provincesList, setProvincesList] = useState([]);
  const [citiesList, setCitiesList] = useState([]);
  const [districtsList, setDistrictsList] = useState([]);

  const token = localStorage.getItem("token");
  const [avatarRefreshKey, setAvatarRefreshKey] = useState(Date.now());

  const profileImageUrl = useMemo(() => {
    if (!userData.profile_picture) return null;
    if (userData.profile_picture.startsWith("http")) {
      return userData.profile_picture;
    }
    return `http://localhost:8080/uploads/${userData.profile_picture}?t=${avatarRefreshKey}`;
  }, [userData.profile_picture, avatarRefreshKey]);

  const fetchUserOrders = async () => {
    try {
      const [ordersRes, productsRes] = await Promise.all([
        API.get("/user/orders"),
        API.get("/products"),
      ]);

      const orders = Array.isArray(ordersRes.data) ? ordersRes.data : [];
      const catalog = Array.isArray(productsRes.data) ? productsRes.data : [];
      const map = catalog.reduce((acc, product) => {
        const keys = [
          product.id,
          product.product_id,
          product.sku,
          product.code,
          product.title,
          product.name,
        ];
        keys.forEach((key) => {
          if (key) acc[String(key).split("_")[0]] = product;
        });
        return acc;
      }, {});

      setTransactions(orders);
      setProductCatalog(catalog);
      setProductMap(map);
    } catch (orderErr) {
      console.warn("Gagal mengambil data transaksi:", orderErr.message);
    }
  };

  const getOrderItemImageUrl = (item) => {
    const rawImage =
      item.product?.image ||
      item.product_image ||
      item.image ||
      item.image_url ||
      item.product?.image_url ||
      item.product?.thumbnail ||
      item.image?.primary ||
      item.primary_image ||
      item.thumbnail;

    if (!rawImage) return null;
    if (typeof rawImage === "string" && rawImage.startsWith("{")) {
      try {
        const parsed = JSON.parse(rawImage);
        if (parsed.primary)
          return parsed.primary.startsWith("http")
            ? parsed.primary
            : `http://localhost:8080${parsed.primary}`;
        if (Array.isArray(parsed) && parsed.length > 0)
          return parsed[0].startsWith("http")
            ? parsed[0]
            : `http://localhost:8080${parsed[0]}`;
      } catch (e) {
        return rawImage.startsWith("http")
          ? rawImage
          : `http://localhost:8080${rawImage}`;
      }
    }

    if (typeof rawImage === "object") {
      if (rawImage.primary)
        return rawImage.primary.startsWith("http")
          ? rawImage.primary
          : `http://localhost:8080${rawImage.primary}`;
      if (Array.isArray(rawImage) && rawImage.length > 0)
        return rawImage[0].startsWith("http")
          ? rawImage[0]
          : `http://localhost:8080${rawImage[0]}`;
      return rawImage.url
        ? rawImage.url.startsWith("http")
          ? rawImage.url
          : `http://localhost:8080${rawImage.url}`
        : null;
    }

    return rawImage.startsWith("http")
      ? rawImage
      : `http://localhost:8080${rawImage}`;
  };

  const getOrderItemProductId = (item) => {
    if (!item || typeof item !== "object") return null;

    const rawId =
      item.product_id ||
      item.product?.id ||
      item.product?.product_id ||
      item.product?.sku ||
      item.sku ||
      item.id ||
      item.product?.code ||
      item.code;

    if (!rawId) return null;
    if (typeof rawId === "string") return rawId.split("_")[0];
    return String(rawId);
  };

  const findCatalogProduct = (item) => {
    const productId = getOrderItemProductId(item);
    if (!productId) return null;
    return (
      productMap[productId] ||
      productMap[String(productId)] ||
      Object.values(productMap).find(
        (product) =>
          String(
            product.id || product.product_id || product.sku || product.code,
          ).split("_")[0] === String(productId).split("_")[0],
      ) ||
      null
    );
  };

  const getOrderItems = (order) => {
    if (!order || typeof order !== "object") return [];

    const knownOrderArrays = [
      order.items,
      order.order_items,
      order.order_details,
      order.line_items,
      order.cart_items,
      order.products,
      order.order_item_list,
      order.items_list,
    ];

    for (const arr of knownOrderArrays) {
      if (Array.isArray(arr) && arr.length > 0) return arr;
      if (typeof arr === "string") {
        try {
          const parsed = JSON.parse(arr);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch (err) {
          continue;
        }
      }
    }

    const firstArray = Object.values(order).find(
      (value) => Array.isArray(value) && value.length > 0,
    );
    return firstArray || [];
  };

  const syncUserProfileState = async (profileData, provData = []) => {
    const safeAddress = profileData.shipping_address || {};

    setUserData({
      name: profileData.name || "",
      email: profileData.email || "",
      phone: profileData.phone || "",
      gender: profileData.gender || "Laki-laki",
      birth_date: profileData.birth_date
        ? profileData.birth_date.substring(0, 10)
        : "",
      profile_picture: profileData.profile_picture || "",
      shipping_address: {
        province: safeAddress.province || "",
        city: safeAddress.city || "",
        district: safeAddress.district || "",
        village: safeAddress.village || "",
        postal_code: safeAddress.postal_code || "",
        coordinates: safeAddress.coordinates || "",
        map_reference: safeAddress.map_reference || "",
        manual_details: safeAddress.manual_details || "",
      },
    });

    if (safeAddress.province) {
      const foundProvince = provData.find(
        (p) => p.nama?.toLowerCase() === safeAddress.province.toLowerCase(),
      );

      if (foundProvince) {
        setActiveRegionIds((prev) => ({
          ...prev,
          provinceId: foundProvince.id,
        }));

        try {
          const citiesRes = await API.get(
            `/regencies?province_id=${foundProvince.id}`,
          );
          const citiesData = citiesRes.data;
          setCitiesList(citiesData);

          const foundCity = citiesData.find(
            (c) => c.nama?.toLowerCase() === safeAddress.city.toLowerCase(),
          );

          if (foundCity) {
            setActiveRegionIds((prev) => ({
              ...prev,
              cityId: foundCity.id,
            }));

            const distRes = await API.get(
              `/districts?regency_id=${foundCity.id}`,
            );
            setDistrictsList(distRes.data);
          }
        } catch (regionErr) {
          console.warn(
            "Gagal sinkronisasi otomatis alamat terdaftar:",
            regionErr.message,
          );
        }
      }
    }
  };

  const fetchUserProfile = async (provData = []) => {
    try {
      const profileRes = await API.get("/user/profile");
      await syncUserProfileState(profileRes.data, provData);
    } catch (err) {
      console.error("Gagal memuat profil pengguna:", err.message || err);
    }
  };

  // ─── HOOK 1: FETCH DATA UTAMA DAN SINKRONISASI ALAMAT USER (VERSI AXIOS) ───
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchAccountData = async () => {
      try {
        setPageLoading(true);

        const provRes = await API.get("/provinces");
        const provData = provRes.data;
        setProvincesList(provData);

        await fetchUserProfile(provData);
        await fetchUserOrders();
      } catch (err) {
        const errorMsg = err.response?.data?.message || err.message;
        console.error("Detail kegagalan memuat data akun:", errorMsg);
      } finally {
        setPageLoading(false);
      }
    };

    fetchAccountData();
  }, [token, navigate]);

  // ─── HOOK 2: FETCH KOTA KETIKA PROVINSI DIUBAH SECARA MANUAL ───
  useEffect(() => {
    if (pageLoading || !activeRegionIds.provinceId) return;

    API.get(`/regencies?province_id=${activeRegionIds.provinceId}`)
      .then((res) => setCitiesList(res.data))
      .catch((err) =>
        console.error("Gagal memuat data kota dari Gin:", err.message),
      );
  }, [activeRegionIds.provinceId]);

  // ─── HOOK 3: FETCH KECAMATAN KETIKA KOTA DIUBAH SECARA MANUAL ───
  useEffect(() => {
    if (pageLoading || !activeRegionIds.cityId) return;

    API.get(`/districts?regency_id=${activeRegionIds.cityId}`)
      .then((res) => setDistrictsList(res.data))
      .catch((err) =>
        console.error("Gagal memuat data kecamatan dari Gin:", err.message),
      );
  }, [activeRegionIds.cityId]);

  const handleInputChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleAddressChange = (e) => {
    setUserData({
      ...userData,
      shipping_address: {
        ...userData.shipping_address,
        [e.target.name]: e.target.value,
      },
    });
  };

  // Handler Perubahan Dropdown Wilayah Utama (dengan reset manual & update ID wilayah)
  const handleRegionSelectChange = (type, selectedObj) => {
    setUserData((prev) => {
      const currentAddress = { ...prev.shipping_address };

      if (type === "province") {
        currentAddress.province = selectedObj ? selectedObj.nama : "";
        currentAddress.city = "";
        currentAddress.district = "";

        setActiveRegionIds({
          provinceId: selectedObj ? selectedObj.id : "",
          cityId: "",
        });
        setCitiesList([]);
        setDistrictsList([]);
      } else if (type === "city") {
        currentAddress.city = selectedObj ? selectedObj.nama : "";
        currentAddress.district = "";

        setActiveRegionIds((prevIds) => ({
          ...prevIds,
          cityId: selectedObj ? selectedObj.id : "",
        }));
        setDistrictsList([]);
      } else if (type === "district") {
        currentAddress.district = selectedObj ? selectedObj.nama : "";
      }

      return {
        ...prev,
        shipping_address: currentAddress,
      };
    });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(
        "http://localhost:8080/api/v1/user/profile",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: userData.name,
            phone: userData.phone, // 🚀 Dikirim di root level sesuai struct User baru
            gender: userData.gender,
            birth_date: userData.birth_date,
            shipping_address: {
              province: userData.shipping_address?.province || "",
              city: userData.shipping_address?.city || "",
              district: userData.shipping_address?.district || "",
              village: userData.shipping_address?.village || "",
              postal_code: userData.shipping_address?.postal_code || "",
              coordinates: userData.shipping_address?.coordinates || "",
              map_reference: userData.shipping_address?.map_reference || "",
              manual_details: userData.shipping_address?.manual_details || "",
            },
          }),
        },
      );

      if (response.ok) {
        alert("Informasi akun Anda berhasil diperbarui di database!");
        localStorage.setItem(
          "user_saved_address",
          JSON.stringify({
            provinceName: userData.shipping_address.province,
            cityName: userData.shipping_address.city,
            districtName: userData.shipping_address.district,
            villageName: userData.shipping_address.village,
            postalCode: userData.shipping_address.postal_code,
            detailAddress: userData.shipping_address.manual_details,
          }),
        );
        fetchUserProfile();
        setAvatarRefreshKey(Date.now());
      } else {
        const errData = await response.json();
        alert(errData.error || "Gagal memperbarui data.");
      }
    } catch (err) {
      console.error("Gagal memperbarui data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_data");
    localStorage.removeItem("user_saved_address");
    navigate("/login");
    window.location.reload();
  };

  const formatRupiah = (number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);
  };

  const handleUploadPaymentProof = async (order) => {
    const invoice = getInvoiceNumber(order);
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      try {
        const formData = new FormData();
        formData.append("payment_proof", file);

        const response = await fetch(
          `http://localhost:8080/api/v1/user/orders/${encodeURIComponent(invoice)}/payment-proof`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
          },
        );

        if (response.ok) {
          alert(
            "Bukti pembayaran berhasil dikirim. Admin akan memverifikasi pesanan Anda.",
          );
          await fetchUserOrders();
        } else {
          const fallbackKey = `order_payment_proof_${invoice}`;
          localStorage.setItem(fallbackKey, file.name);
          alert(
            "Sistem belum menerima upload bukti pembayaran, tetapi catatan lokal telah disimpan untuk verifikasi manual.",
          );
        }
      } catch (err) {
        console.error("Gagal mengunggah bukti pembayaran", err);
        alert("Gagal mengunggah bukti pembayaran. Silakan coba lagi.");
      }
    };

    input.click();
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col justify-center items-center gap-3">
        <Loader2 className="animate-spin text-neutral-900" size={32} />
        <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">
          Memuat Akun...
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50/50 font-sans flex flex-col justify-between selection:bg-neutral-900 selection:text-white pt-16">
      <Navbar
        cartCount={cartCount}
        onCartOpen={onCartOpen}
        onSearchOpen={onSearchOpen}
      />

      <main className="flex-grow max-w-6xl w-full mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* SIDEBAR */}
          <div className="w-full md:w-64 bg-white border border-neutral-200/60 rounded-xl p-4 shadow-2xs shrink-0">
            <div className="flex items-center gap-3 pb-4 mb-4 border-b border-neutral-100 pl-2">
              {/* 🚀 MODIFIKASI AVATAR SIDEBAR DI SINI */}
              <div className="h-10 w-10 rounded-full bg-neutral-900 text-white text-xs font-bold flex items-center justify-center uppercase tracking-wider overflow-hidden shrink-0 border border-neutral-100">
                {userData.profile_picture ? (
                  <img
                    src={profileImageUrl}
                    alt="Avatar Sidebar"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "/default-avatar.png";
                    }}
                  />
                ) : (
                  <span>
                    {userData.name
                      ? userData.name.substring(0, 2).toUpperCase()
                      : "US"}
                  </span>
                )}
              </div>

              <div className="overflow-hidden">
                <h4 className="text-xs font-black text-neutral-900 truncate uppercase tracking-wider">
                  {userData.name || "Pelanggan Setia"}
                </h4>
                <span className="text-[10px] text-neutral-400 font-mono">
                  Member Terverifikasi
                </span>
              </div>
            </div>

            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab("profile")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition ${activeTab === "profile" ? "bg-neutral-900 text-white" : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900"}`}
              >
                <User size={15} /> Ubah Informasi Akun
              </button>

              <button
                onClick={() => setActiveTab("transactions")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition ${activeTab === "transactions" ? "bg-neutral-900 text-white" : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900"}`}
              >
                <ShoppingBag size={15} /> Riwayat Transaksi (
                {transactions.length})
              </button>

              <button
                onClick={() => setActiveTab("address")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition ${activeTab === "address" ? "bg-neutral-900 text-white" : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900"}`}
              >
                <MapPin size={15} /> Alamat Pengiriman
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider text-red-500 hover:bg-red-50 transition mt-4 border-t border-neutral-100 pt-4"
              >
                <LogOut size={15} /> Keluar
              </button>
            </nav>
          </div>

          {/* DYNAMIC CONTENT CONTAINER */}
          <div className="flex-1 w-full">
            {/* TAB 1: DETAIL AKUN */}
            {activeTab === "profile" && (
              <div className="bg-white border border-neutral-200/60 rounded-xl p-6 shadow-2xs">
                <h3 className="text-sm font-black uppercase tracking-wider text-neutral-900 mb-5 pb-2 border-b border-neutral-100">
                  Detail Akun
                </h3>

                <form onSubmit={handleSaveProfile} className="space-y-5">
                  {/* 🌟 1. BLOK UNGGAH FOTO PROFIL BARU */}
                  <div className="flex flex-col sm:flex-row items-center gap-5 p-4 bg-neutral-50/50 border border-neutral-150 rounded-2xl mb-2">
                    <div className="relative group cursor-pointer w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-md bg-neutral-900 flex items-center justify-center text-white font-bold text-lg">
                      {userData.profile_picture ? (
                        <img
                          src={profileImageUrl}
                          alt="Avatar"
                          className="w-full h-full object-cover transition group-hover:scale-105"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "/default-avatar.png";
                          }}
                        />
                      ) : (
                        <span>
                          {userData.name
                            ? userData.name.substring(0, 2).toUpperCase()
                            : "RE"}
                        </span>
                      )}
                      {/* Overlay saat di-hover */}
                      <label
                        htmlFor="avatar-upload"
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center cursor-pointer"
                      >
                        <Camera size={16} className="text-white" />
                      </label>
                    </div>

                    <div className="text-center sm:text-left space-y-1">
                      <h4 className="text-xs font-bold text-neutral-800">
                        Foto Profil
                      </h4>
                      <p className="text-[10px] text-neutral-400 font-medium">
                        Format PNG, JPG atau WEBP. Maksimal 2MB.
                      </p>
                      <input
                        type="file"
                        id="avatar-upload"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (!file) return;

                          // Logika Upload file langsung ke backend static folder /uploads
                          const formData = new FormData();
                          formData.append("avatar", file);

                          try {
                            const res = await fetch(
                              "http://localhost:8080/api/v1/user/upload-avatar",
                              {
                                method: "POST",
                                headers: { Authorization: `Bearer ${token}` },
                                body: formData,
                              },
                            );
                            const resData = await res.json();
                            if (res.ok) {
                              setUserData((prev) => ({
                                ...prev,
                                profile_picture: resData.filename,
                              }));
                              alert("Foto profil berhasil diunggah!");
                            }
                          } catch (err) {
                            console.error("Gagal upload gambar:", err);
                          }
                        }}
                      />
                    </div>
                  </div>

                  {/* Grid Input Bawaan Anda */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wide mb-1.5 pl-0.5">
                        Nama lengkap
                      </label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-3 h-4 w-4 text-neutral-400" />
                        <input
                          type="text"
                          name="name"
                          value={userData.name}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-2.5 bg-neutral-50/50 border border-neutral-200 text-xs rounded-xl outline-none focus:border-neutral-900 transition"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wide mb-1.5 pl-0.5">
                        Alamat email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-3 h-4 w-4 text-neutral-400" />
                        <input
                          type="email"
                          name="email"
                          readOnly
                          value={userData.email}
                          className="w-full pl-10 pr-4 py-2.5 bg-neutral-100 border border-neutral-200 text-xs rounded-xl outline-none text-neutral-500 cursor-not-allowed"
                        />
                      </div>
                      <span className="text-[10px] text-emerald-600 font-semibold mt-1 flex items-center gap-1 pl-0.5">
                        <ShieldCheck size={12} /> Email akun terproteksi
                      </span>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wide mb-1.5 pl-0.5">
                        Nomor Handphone
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-3 h-4 w-4 text-neutral-400" />
                        <input
                          type="tel"
                          name="phone"
                          value={userData.phone || ""}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-2.5 bg-neutral-50/50 border border-neutral-200 text-xs rounded-xl outline-none focus:border-neutral-900 transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wide mb-1.5 pl-0.5">
                        Tanggal Lahir
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3.5 top-3 h-4 w-4 text-neutral-400" />
                        <input
                          type="date"
                          name="birth_date"
                          value={userData.birth_date}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-2.5 bg-neutral-50/50 border border-neutral-200 text-xs rounded-xl outline-none focus:border-neutral-900 transition"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wide mb-2 pl-0.5">
                      Jenis Kelamin
                    </label>
                    <div className="flex gap-6 items-center pl-0.5">
                      <label className="flex items-center gap-2 text-xs font-semibold text-neutral-700 cursor-pointer">
                        <input
                          type="radio"
                          name="gender"
                          value="Laki-laki"
                          checked={userData.gender === "Laki-laki"}
                          onChange={handleInputChange}
                          className="accent-neutral-900 h-4 w-4"
                        />{" "}
                        Laki-laki
                      </label>
                      <label className="flex items-center gap-2 text-xs font-semibold text-neutral-700 cursor-pointer">
                        <input
                          type="radio"
                          name="gender"
                          value="Perempuan"
                          checked={userData.gender === "Perempuan"}
                          onChange={handleInputChange}
                          className="accent-neutral-900 h-4 w-4"
                        />{" "}
                        Perempuan
                      </label>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-neutral-100 flex justify-end items-center">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition shadow-xs flex items-center gap-2"
                    >
                      {loading && (
                        <Loader2 className="animate-spin" size={14} />
                      )}
                      {loading ? "Menyimpan..." : "Simpan Perubahan"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 2: RIWAYAT TRANSAKSI */}
            {activeTab === "transactions" && (
              <div className="space-y-6">
                {/* Header */}
                <div className="bg-white border border-neutral-200/60 rounded-xl p-6 shadow-2xs">
                  <h3 className="text-sm font-black uppercase tracking-wider text-neutral-900 mb-2 pb-2 border-b border-neutral-100">
                    Riwayat Belanja & Pelacakan
                  </h3>
                  <p className="text-[10px] text-neutral-400 font-medium uppercase tracking-wide">
                    Pantau real-time progres item petualangan Anda langsung dari
                    sistem logistik kami.
                  </p>
                </div>

                {/* List Data Transaksi */}
                {transactions.length === 0 ? (
                  <div className="bg-white border border-neutral-200/60 rounded-xl p-12 text-center shadow-2xs">
                    <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                      Belum ada transaksi keluar.
                    </p>
                  </div>
                ) : (
                  transactions.map((order) => {
                    const completionState = getOrderCompletionState(order);
                    const statusSteps = completionState.steps;
                    const currentStepIndex = completionState.meta.step;

                    return (
                      <div
                        key={order.order_invoice}
                        className="bg-white border border-neutral-200/60 rounded-xl p-6 shadow-2xs space-y-6"
                      >
                        {/* Informasi Atas */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-100">
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono font-bold text-neutral-400 bg-neutral-50 border border-neutral-200 px-2 py-0.5 rounded">
                              {getInvoiceNumber(order)}
                            </span>
                            <h4 className="text-xs font-black text-neutral-900 uppercase tracking-wide pt-1">
                              Total Bayar:{" "}
                              <span className="font-mono text-neutral-700">
                                Rp {order.grand_total?.toLocaleString("id-ID")}
                              </span>
                            </h4>
                          </div>
                          <div>
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 border rounded-full ${completionState.meta.badge}`}
                            >
                              {completionState.meta.label}
                            </span>
                          </div>
                        </div>

                        {getOrderItems(order).length > 0 && (
                          <div className="pt-4 border-t border-neutral-100 space-y-3">
                            <h5 className="text-[10px] uppercase tracking-widest text-neutral-500 font-semibold">
                              Produk yang dipesan
                            </h5>
                            {getOrderItems(order).map((item, index) => {
                              const catalogProduct = findCatalogProduct(item);
                              const imageUrl =
                                getOrderItemImageUrl(item) ||
                                getOrderItemImageUrl(catalogProduct);
                              const productName =
                                item.product_name ||
                                item.name ||
                                item.title ||
                                item.product?.name ||
                                item.product?.title ||
                                catalogProduct?.name ||
                                catalogProduct?.title ||
                                item.product?.name ||
                                item.product?.title ||
                                "Produk tidak dikenal";
                              const productDesc =
                                item.product_description ||
                                item.description ||
                                item.product?.description ||
                                catalogProduct?.description ||
                                "Detail produk tidak tersedia.";
                              const productPrice = Number(
                                item.price ||
                                  item.unit_price ||
                                  item.product?.price ||
                                  item.product_price ||
                                  catalogProduct?.price ||
                                  0,
                              );
                              const productQty = item.quantity || item.qty || 1;
                              const productLink =
                                item.product?.id ||
                                catalogProduct?.id ||
                                item.product_id ||
                                item.id ||
                                null;

                              return (
                                <div
                                  key={
                                    item.id ||
                                    item.product_id ||
                                    productLink ||
                                    index
                                  }
                                  className="rounded-2xl border border-neutral-200 bg-neutral-50 p-3"
                                >
                                  <div className="flex items-start gap-3">
                                    {imageUrl ? (
                                      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-neutral-100 shrink-0">
                                        <img
                                          src={imageUrl}
                                          alt={productName}
                                          className="w-full h-full object-cover"
                                          onError={(e) => {
                                            e.currentTarget.onerror = null;
                                            e.currentTarget.src =
                                              "/default-product.png";
                                          }}
                                        />
                                      </div>
                                    ) : (
                                      <div className="w-16 h-16 rounded-2xl bg-neutral-200 flex items-center justify-center text-[10px] text-neutral-500">
                                        No Image
                                      </div>
                                    )}
                                    <div className="flex-1">
                                      <div className="flex justify-between gap-4">
                                        <div>
                                          {productLink ? (
                                            <Link
                                              to={`/product/${productLink}`}
                                              className="text-xs font-bold text-neutral-900 hover:text-neutral-700"
                                            >
                                              {productName}
                                            </Link>
                                          ) : (
                                            <p className="text-xs font-bold text-neutral-900">
                                              {productName}
                                            </p>
                                          )}
                                          <p className="text-[10px] text-neutral-500 mt-1">
                                            {productDesc}
                                          </p>
                                        </div>
                                        <p className="text-[10px] text-neutral-500">
                                          Qty: {productQty}
                                        </p>
                                      </div>
                                      <div className="mt-2 text-[10px] text-neutral-500">
                                        Harga: Rp{" "}
                                        {productPrice.toLocaleString("id-ID")}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* STATUS TRACKING INDICATOR (STEPPER) */}
                        <div className="py-4 px-2">
                          <div className="relative flex items-center justify-between w-full">
                            {/* Background Line */}
                            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-neutral-100 -z-10" />
                            {/* Active Line Progress */}
                            <div
                              className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-neutral-900 transition-all duration-500 -z-10"
                              style={{
                                width: `${completionState.progress}%`,
                              }}
                            />

                            {statusSteps.map((step, index) => {
                              const isCompleted =
                                index <= currentStepIndex &&
                                currentStepIndex !== -1;
                              const isActive =
                                index === currentStepIndex &&
                                currentStepIndex !== -1;

                              return (
                                <div
                                  key={step}
                                  className="flex flex-col items-center flex-1 relative"
                                >
                                  <div
                                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all ${
                                      isActive
                                        ? "bg-neutral-900 border-neutral-900 text-white shadow-md scale-110"
                                        : isCompleted
                                          ? "bg-neutral-900 border-neutral-900 text-white"
                                          : "bg-white border-neutral-200 text-neutral-400"
                                    }`}
                                  >
                                    {index + 1}
                                  </div>
                                  <span
                                    className={`text-[9px] font-bold uppercase tracking-wider mt-2 text-center absolute -bottom-5 w-max transition-colors ${
                                      isActive
                                        ? "text-neutral-900 font-black"
                                        : isCompleted
                                          ? "text-neutral-600"
                                          : "text-neutral-400"
                                    }`}
                                  >
                                    {step.label}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-100 pt-4">
                          <div className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">
                            {completionState.meta.title}
                          </div>
                          {completionState.status === "PENDING" && (
                            <button
                              type="button"
                              onClick={() => handleUploadPaymentProof(order)}
                              className="px-3 py-2 rounded-lg border border-amber-200 bg-amber-50 text-amber-700 text-[10px] font-bold uppercase tracking-wider hover:bg-amber-100"
                            >
                              Unggah Bukti Bayar
                            </button>
                          )}
                        </div>

                        {/* Blok Manifest Logistik & Resi (Muncul otomatis jika status SHIPPED / tracking_number tersedia) */}
                        {order.tracking_number &&
                          order.tracking_number !== "-" && (
                            <div className="mt-4 pt-4 bg-neutral-50/50 border border-neutral-200 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                              <div className="text-[10px] uppercase tracking-wide space-y-0.5">
                                <p className="text-neutral-400 font-bold">
                                  Ekspedisi
                                </p>
                                <p className="text-neutral-800 font-black font-mono">
                                  {order.courier || "Kurir Internal"}
                                </p>
                              </div>
                              <div className="text-[10px] uppercase tracking-wide space-y-0.5 sm:text-right w-full sm:w-auto">
                                <p className="text-neutral-400 font-bold">
                                  No. Resi Pelacakan
                                </p>
                                <p className="text-neutral-800 font-black font-mono select-all bg-white border border-neutral-200 px-2 py-1 rounded-md inline-block mt-0.5 shadow-3xs">
                                  {order.tracking_number}
                                </p>
                              </div>
                            </div>
                          )}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* TAB 3: ALAMAT PENGIRIMAN (DYNAMIC DATABASE API) */}
            {activeTab === "address" && (
              <div className="bg-white border border-neutral-200/60 rounded-xl p-6 shadow-2xs animate-in fade-in duration-300">
                <h3 className="text-sm font-black uppercase tracking-wider text-neutral-900 mb-5 pb-2 border-b border-neutral-100">
                  Alamat Pengiriman Utama
                </h3>

                <form onSubmit={handleSaveProfile} className="space-y-6">
                  {/* WILAYAH ADMINISTRASI */}
                  <div>
                    <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-3">
                      Wilayah Administrasi
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <SearchableSelect
                        label="Provinsi"
                        placeholder="Pilih Provinsi"
                        value={userData.shipping_address?.province || ""}
                        options={provincesList}
                        onChange={(obj) =>
                          handleRegionSelectChange("province", obj)
                        }
                      />
                      <SearchableSelect
                        label="Kota / Kabupaten"
                        placeholder="Pilih Kota / Kabupaten"
                        value={userData.shipping_address?.city || ""}
                        options={citiesList}
                        disabled={!userData.shipping_address?.province}
                        onChange={(obj) =>
                          handleRegionSelectChange("city", obj)
                        }
                      />
                      <SearchableSelect
                        label="Kecamatan"
                        placeholder="Pilih Kecamatan"
                        value={userData.shipping_address?.district || ""}
                        options={districtsList}
                        disabled={!userData.shipping_address?.city}
                        onChange={(obj) =>
                          handleRegionSelectChange("district", obj)
                        }
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wide mb-1.5 pl-0.5">
                          Kelurahan / Desa
                        </label>
                        <input
                          type="text"
                          name="village"
                          value={userData.shipping_address?.village || ""}
                          onChange={handleAddressChange}
                          className="w-full px-4 py-2.5 bg-neutral-50/50 border border-neutral-200 text-xs rounded-xl outline-none focus:border-neutral-900 transition"
                          placeholder="Ketik nama kelurahan / desa"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wide mb-1.5 pl-0.5">
                          Kode Pos
                        </label>
                        <input
                          type="text"
                          name="postal_code"
                          value={userData.shipping_address?.postal_code || ""}
                          onChange={handleAddressChange}
                          className="w-full px-4 py-2.5 bg-neutral-50/50 border border-neutral-200 text-xs rounded-xl outline-none focus:border-neutral-900 transition"
                          placeholder="Contoh: 43281"
                        />
                      </div>
                    </div>
                  </div>

                  {/* RINCIAN ALAMAT FISIK MANUAL */}
                  <div>
                    <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-3">
                      Rincian Alamat Fisik Manual
                    </h4>
                    <textarea
                      name="manual_details"
                      value={userData.shipping_address?.manual_details || ""}
                      onChange={handleAddressChange}
                      className="w-full p-4 bg-neutral-50/50 border border-neutral-200 text-xs rounded-xl outline-none focus:border-neutral-900 transition resize-none h-24"
                      placeholder="Tuliskan nama jalan, nomor rumah, RT/RW, atau patokan dekat lokasi Anda..."
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2.5 bg-neutral-900 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition hover:bg-neutral-800 flex items-center gap-2"
                    >
                      {loading && (
                        <Loader2 className="animate-spin" size={14} />
                      )}
                      {loading ? "Menyimpan..." : "Simpan Alamat Akun"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
