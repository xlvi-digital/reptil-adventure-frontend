import axios from "axios";

// Menggunakan URL Hugging Face secara dinamis jika di-deploy, atau localhost jika sedang coding di laptop
const BASE_URL_API =
  import.meta.env.VITE_API_BASE_URL ||
  "https://xlvi-digital-reptil-adventure-api.hf.space/api/v1";
const BASE_URL_IMAGE =
  import.meta.env.VITE_IMAGE_BASE_URL ||
  "https://xlvi-digital-reptil-adventure-api.hf.space";

// 1. Buat instance Axios dengan Base URL mengarah ke backend Hugging Face / Lokal
const API = axios.create({
  baseURL: BASE_URL_API,
  timeout: 10000,
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
