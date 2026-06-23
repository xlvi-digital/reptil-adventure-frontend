import axios from "axios";

// 1. Buat instance Axios dengan Base URL mengarah ke backend Gin Golang Anda
const API = axios.create({
  baseURL: "http://localhost:8080/api/v1",
  timeout: 10000, // Batas waktu tunggu respons (10 detik)
  headers: {
    "Content-Type": "application/json",
  },
});

// URL dasar untuk memanggil gambar yang disimpan di server Go
export const IMAGE_URL = "http://localhost:8080";

// 2. Tambahkan Interceptor (Opsional tapi Sangat Berguna)
// Tujuannya agar setiap kali React menembak rute adminProtected, token JWT otomatis disisipkan di Headers
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // Mengambil token dari localStorage setelah login sukses
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default API;
