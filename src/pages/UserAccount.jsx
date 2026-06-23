import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
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

  // ─── STATE LIST DATA WILAYAH DARI DATABASE/API ───
  const [provincesList, setProvincesList] = useState([]);
  const [citiesList, setCitiesList] = useState([]);
  const [districtsList, setDistrictsList] = useState([]);

  const token = localStorage.getItem("token");

  // ─── HOOK 1: FETCH DATA UTAMA DAN SINKRONISASI ALAMAT USER (VERSI AXIOS) ───
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchAccountData = async () => {
      try {
        setPageLoading(true);

        // A. Fetch Master Data Provinsi (Otomatis ke port 8080)
        const provRes = await API.get("/provinces");
        const provData = provRes.data;
        setProvincesList(provData);

        // B. Fetch Data Profil Pengguna (Token otomatis disisipkan oleh interceptor)
        const profileRes = await API.get("/user/profile");
        const profileData = profileRes.data;

        const safeAddress = profileData.shipping_address || {};

        setUserData({
          name: profileData.name || "",
          email: profileData.email || "",
          phone: profileData.phone || "",
          gender: profileData.gender || "Laki-laki",
          birth_date: profileData.birth_date
            ? profileData.birth_date.substring(0, 10)
            : "",
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

        // C. STRATEGI SINKRONISASI ALAMAT TERDAFTAR
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
              // Ambil list Kota/Kabupaten ke Gin Golang
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

                // Ambil list Kecamatan
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

        // D. Fetch Riwayat Transaksi
        try {
          const ordersRes = await API.get("/user/orders");
          setTransactions(ordersRes.data);
        } catch (orderErr) {
          console.warn("Gagal mengambil data transaksi:", orderErr.message);
        }
      } catch (err) {
        // Deteksi error spesifik dari Axios jika backend Gin memberikan pesan error JSON
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

  useEffect(() => {
    // 🔍 DEBUG: Cek apakah token Anda benar-benar ada atau malah undefined / null
    console.log("=== DEBUG USER ACCOUNT LFC ===");
    console.log("Token yang terbaca saat ini:", token);
    console.log("Tab yang sedang aktif saat ini:", activeTab);

    if (!token) {
      console.warn(
        "⚠️ Peringatan: Token tidak ditemukan! Proses fetch dibatalkan.",
      );
      return; // Berhenti di sini jika token tidak ada
    }

    const fetchUserProfile = async () => {
      try {
        console.log("Mengirim request ke /profile...");
        const response = await fetch(
          "http://localhost:8080/api/v1/user/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (response.ok) {
          const result = await response.json();
          console.log("✅ Data profil berhasil didapat:", result);
          setUserData({
            name: result.name || "",
            email: result.email || "",
            phone: result.phone || "",
            gender: result.gender || "Laki-laki",
            birth_date: result.birth_date || "",
            profile_picture: result.profile_picture || "",
            shipping_address: {
              province: result.shipping_address?.province || "",
              city: result.shipping_address?.city || "",
              district: result.shipping_address?.district || "",
              village: result.shipping_address?.village || "",
              postal_code: result.shipping_address?.postal_code || "",
              coordinates: result.shipping_address?.coordinates || "",
              map_reference: result.shipping_address?.map_reference || "",
              manual_details: result.shipping_address?.manual_details || "",
            },
          });
        } else {
          console.error(
            "❌ Backend menolak request profile. Status:",
            response.status,
          );
        }
      } catch (err) {
        console.error("❌ Gagal network fetch profil:", err);
      }
    };

    const fetchUserOrders = async () => {
      try {
        console.log("Mengirim request ke /orders...");
        const response = await fetch(
          "http://localhost:8080/api/v1/user/orders",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (response.ok) {
          const data = await response.json();
          console.log("✅ Data riwayat order berhasil didapat:", data);
          setTransactions(data);
        } else {
          console.error(
            "❌ Backend menolak request orders. Status:",
            response.status,
          );
        }
      } catch (error) {
        console.error("❌ Gagal network fetch order:", error);
      }
    };

    // Jalankan fetch profile secara berkala jika token tersedia
    fetchUserProfile();

    // Hanya fetch order jika sedang berada di tab transactions
    if (activeTab === "transactions") {
      fetchUserOrders();
    }
  }, [token, activeTab]);

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
        // 🚀 Trick jitu: Ambil data ulang dari server setelah sukses agar state sinkron
        if (typeof fetchUserProfile === "function") {
          fetchUserProfile();
        }
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
                    src={
                      userData.profile_picture.startsWith("http")
                        ? userData.profile_picture
                        : `http://localhost:8080/uploads/${userData.profile_picture}`
                    }
                    alt="Avatar Sidebar"
                    className="w-full h-full object-cover"
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
                          src={
                            userData.profile_picture.startsWith("http")
                              ? userData.profile_picture
                              : `http://localhost:8080/uploads/${userData.profile_picture}`
                          }
                          alt="Avatar"
                          className="w-full h-full object-cover transition group-hover:scale-105"
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
                    // Pemetaan gaya badge berdasarkan status database kamu
                    const getStatusStyles = (status) => {
                      switch (status?.toUpperCase()) {
                        case "PENDING":
                          return "bg-amber-50 text-amber-700 border-amber-200/60";
                        case "PAID":
                          return "bg-blue-50 text-blue-700 border-blue-200/60";
                        case "SHIPPED":
                          return "bg-purple-50 text-purple-700 border-purple-200/60";
                        case "DONE":
                        case "SELESAI":
                          return "bg-emerald-50 text-emerald-700 border-emerald-200/60";
                        case "CANCELLED":
                          return "bg-red-50 text-red-700 border-red-200/60";
                        default:
                          return "bg-neutral-50 text-neutral-600 border-neutral-200";
                      }
                    };

                    // Pemetaan indeks urutan langkah tracking
                    const statusSteps = [
                      "PENDING",
                      "PAID",
                      "SHIPPED",
                      "SELESAI",
                    ];
                    const currentStatus =
                      order.status?.toUpperCase() === "DONE"
                        ? "SELESAI"
                        : order.status?.toUpperCase();
                    let currentStepIndex = statusSteps.indexOf(currentStatus);
                    if (
                      currentStepIndex === -1 &&
                      currentStatus === "CANCELLED"
                    )
                      currentStepIndex = 0; // proteksi cancel

                    return (
                      <div
                        key={order.order_invoice}
                        className="bg-white border border-neutral-200/60 rounded-xl p-6 shadow-2xs space-y-6"
                      >
                        {/* Informasi Atas */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-100">
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono font-bold text-neutral-400 bg-neutral-50 border border-neutral-200 px-2 py-0.5 rounded">
                              {order.order_invoice}
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
                              className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 border rounded-full ${getStatusStyles(order.status)}`}
                            >
                              {order.status}
                            </span>
                          </div>
                        </div>

                        {/* STATUS TRACKING INDICATOR (STEPPER) */}
                        <div className="py-4 px-2">
                          <div className="relative flex items-center justify-between w-full">
                            {/* Background Line */}
                            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-neutral-100 -z-10" />
                            {/* Active Line Progress */}
                            <div
                              className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-neutral-900 transition-all duration-500 -z-10"
                              style={{
                                width: `${currentStepIndex >= 0 ? (currentStepIndex / (statusSteps.length - 1)) * 100 : 0}%`,
                              }}
                            />

                            {statusSteps.map((step, index) => {
                              const isCompleted =
                                index <= currentStepIndex &&
                                currentStatus !== "CANCELLED";
                              const isActive =
                                index === currentStepIndex &&
                                currentStatus !== "CANCELLED";

                              // Label ramah dibaca pengguna
                              const labels = {
                                PENDING: "Tertunda",
                                PAID: "Diproses",
                                SHIPPED: "Dikirim",
                                SELESAI: "Selesai",
                              };

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
                                    {labels[step]}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Blok Manifest Logistik & Resi (Muncul otomatis jika status SHIPPED / tracking_number tersedia) */}
                        {order.tracking_number &&
                          order.tracking_number !== "-" && (
                            <div className="mt-8 pt-4 bg-neutral-50/50 border border-neutral-200 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
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
