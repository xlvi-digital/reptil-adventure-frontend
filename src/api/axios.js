import axios from "axios";

// 1. Naikkan toleransi timeout ke 30 detik (30000ms) agar tidak mudah putus saat Hugging Face bangun tidur
const BASE_URL_API =
  import.meta.env.VITE_API_BASE_URL ||
  "https://xlvi-digital-reptil-adventure-api.hf.space/api/v1";

const BASE_URL_IMAGE =
  import.meta.env.VITE_IMAGE_BASE_URL ||
  "https://xlvi-digital-reptil-adventure-api.hf.space";

const API = axios.create({
  baseURL: BASE_URL_API,
  timeout: 30000, // 🔥 DIUBAH DARI 10000 KE 30000
  headers: {
    "Content-Type": "application/json",
  },
});

// URL dasar untuk memanggil gambar yang disimpan di server Go
export const IMAGE_URL = BASE_URL_IMAGE;

// 2. Tambahkan Interceptor untuk Token JWT Admin
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
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
