import React, { useState, useEffect } from "react";
import axios from "../api/axios";

const ShippingForm = ({ cartItems, subtotal, onShippingSelected }) => {
  // 1. State untuk Alamat & Pengiriman
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [courier, setCourier] = useState("jne"); // default jne
  const [shippingOptions, setShippingOptions] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [loadingOngkir, setLoadingOngkir] = useState(false);
  const [addressDetail, setAddressDetail] = useState("");

  // 2. Hitung Total Berat Otomatis dari Keranjang (Gram)
  const totalWeight = cartItems.reduce((total, item) => {
    // Jika item.weight tidak ada/nol, berikan default 300 gram per produk
    const weight = item.weight && item.weight > 0 ? item.weight : 300;
    return total + weight * item.quantity;
  }, 0);

  // 3. Ambil Data Provinsi saat Komponen Load
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        // Ganti URL sesuai dengan endpoint API backend Go kamu
        const response = await axios.get(
          "https://xlvi-digital-reptil-adventure-api.hf.space/api/v1/shippings/provinces",
        );
        setProvinces(response.data || []);
      } catch (error) {
        console.error("Gagal mengambil data provinsi:", error);
      }
    };
    fetchProvinces();
  }, []);

  // 4. Ambil Data Kota berdasarkan Provinsi yang Dipilih
  useEffect(() => {
    if (!selectedProvince) return;
    const fetchCities = async () => {
      try {
        const response = await axios.get(
          `https://xlvi-digital-reptil-adventure-api.hf.space/api/v1/shippings/cities?province=${selectedProvince}`,
        );
        setCities(response.data || []);
        setShippingOptions([]); // Reset pilihan ongkir lama
        setSelectedService(null);
      } catch (error) {
        console.error("Gagal mengambil data kota:", error);
      }
    };
    fetchCities();
  }, [selectedProvince]);

  // 5. Fungsi Hitung Ongkir ke API Backend
  const handleCheckOngkir = async () => {
    if (!selectedCity) {
      alert("Silakan pilih Kota/Kabupaten tujuan terlebih dahulu!");
      return;
    }

    setLoadingOngkir(true);
    try {
      const response = await axios.post(
        "https://xlvi-digital-reptil-adventure-api.hf.space/api/v1/shippings/cost",
        {
          destination: selectedCity,
          weight: totalWeight,
          courier: courier,
        },
      );

      // Biasanya RajaOngkir mengembalikan array berisi opsi layanan (REG, OKE, YES, dll)
      setShippingOptions(response.data || []);
      setSelectedService(null);
    } catch (error) {
      console.error("Gagal menghitung ongkir:", error);
      alert("Gagal memuat tarif ongkos kirim.");
    } finally {
      setLoadingOngkir(false);
    }
  };

  // 6. Handler saat user memilih salah satu layanan kurir (misal: JNE REG)
  const handleSelectService = (service) => {
    setSelectedService(service);
    // Kirim data ongkir dan detail alamat kembali ke parent component (Checkout Page)
    onShippingSelected({
      courier: courier.toUpperCase(),
      service: service.service,
      cost: service.cost[0].value,
      etd: service.cost[0].etd,
      fullAddress: addressDetail,
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-lg mx-auto mt-6">
      <h2 className="text-xl font-bold mb-4 border-b pb-2">
        📦 Informasi Pengiriman
      </h2>

      {/* Ringkasan Berat */}
      <div className="mb-4 bg-gray-50 p-3 rounded text-sm flex justify-between">
        <span className="text-gray-600">Total Berat Belanjaan:</span>
        <span className="font-semibold text-orange-600">
          {(totalWeight / 1000).toFixed(2)} Kg ({totalWeight} gram)
        </span>
      </div>

      {/* Dropdown Provinsi */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Provinsi Tujuan
        </label>
        <select
          className="w-full p-2.5 border rounded-md bg-white focus:ring-2 focus:ring-amber-500"
          value={selectedProvince}
          onChange={(e) => setSelectedProvince(e.target.value)}
        >
          <option value="">-- Pilih Provinsi --</option>
          {provinces.map((prov) => (
            <option key={prov.province_id} value={prov.province_id}>
              {prov.province}
            </option>
          ))}
        </select>
      </div>

      {/* Dropdown Kota */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Kota / Kabupaten Tujuan
        </label>
        <select
          className="w-full p-2.5 border rounded-md bg-white focus:ring-2 focus:ring-amber-500"
          value={selectedCity}
          disabled={!selectedProvince}
          onChange={(e) => setSelectedCity(e.target.value)}
        >
          <option value="">-- Pilih Kota/Kabupaten --</option>
          {cities.map((city) => (
            <option key={city.city_id} value={city.city_id}>
              {city.type} {city.city_name}
            </option>
          ))}
        </select>
      </div>

      {/* Input Alamat Lengkap */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Alamat Lengkap (Jalan, RT/RW, Kec)
        </label>
        <textarea
          className="w-full p-2.5 border rounded-md focus:ring-2 focus:ring-amber-500"
          rows="3"
          placeholder="Contoh: Jl. Raya Cianjur No.45, RT 02/RW 01, Kec. Karangtengah"
          value={addressDetail}
          onChange={(e) => setAddressDetail(e.target.value)}
        />
      </div>

      {/* Pilihan Kurir & Tombol Cek Ongkir */}
      <div className="mb-6 grid grid-cols-3 gap-2 items-end">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pilih Ekspedisi
          </label>
          <select
            className="w-full p-2.5 border rounded-md bg-white focus:ring-2 focus:ring-amber-500"
            value={courier}
            onChange={(e) => setCourier(e.target.value)}
          >
            <option value="jne">JNE (Jalur Nugraha Ekakurir)</option>
            <option value="pos">POS Indonesia</option>
            <option value="tiki">TIKI (Titipan Kilat)</option>
          </select>
        </div>
        <button
          type="button"
          onClick={handleCheckOngkir}
          disabled={loadingOngkir}
          className="w-full p-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-md transition disabled:bg-gray-400"
        >
          {loadingOngkir ? "Memuat..." : "Cek Ongkir"}
        </button>
      </div>

      {/* Render Opsi Layanan Kurir & Tarif */}
      {shippingOptions.length > 0 && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pilih Paket Pengiriman
          </label>
          {shippingOptions.map((option, idx) => (
            <div
              key={idx}
              onClick={() => handleSelectService(option)}
              className={`p-3 border rounded-lg cursor-pointer transition flex justify-between items-center ${
                selectedService?.service === option.service
                  ? "border-amber-600 bg-amber-50 text-amber-900 font-medium"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              <div>
                <p className="text-sm font-bold uppercase">
                  {courier} - {option.service}
                </p>
                <p className="text-xs text-gray-500">
                  Estimasi sampai: {option.cost[0].etd} Hari
                </p>
              </div>
              <span className="text-sm font-semibold text-gray-950">
                Rp {option.cost[0].value.toLocaleString("id-ID")}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShippingForm;
