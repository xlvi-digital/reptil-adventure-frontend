import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom"; // 🌟 Ditambahkan useSearchParams
import API from "../../api/axios"; // 🌟 Menggunakan relasi mundur 3 tingkat dari folder admin
import {
  Lock,
  Mail,
  User,
  Phone,
  MapPin,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

export default function Login({ onLoginSuccess }) {
  // IsRegister true = Tampilan Register, false = Tampilan Login
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [searchParams] = useSearchParams(); // 🌟 Mendeteksi parameter URL (?token=...)
  const navigate = useNavigate();

  // State Form Gabungan
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    address: "",
  });

  // 🌟 OLEH-OLEH GOOGLE OAUTH: Deteksi otomatis token kiriman dari Backend Go
  useEffect(() => {
    const tokenFromUrl = searchParams.get("token");
    if (tokenFromUrl) {
      localStorage.setItem("token", tokenFromUrl);

      // Ambil profile pelengkap ke localStorage
      const fetchUserProfile = async () => {
        try {
          const res = await API.get("/auth/me", {
            // Sesuaikan endpoint info user profile Anda jika ada
            headers: { Authorization: `Bearer ${tokenFromUrl}` },
          });
          localStorage.setItem("user_data", JSON.stringify(res.data.user));

          // Redirect sesuai hak akses role string dari backend Go
          if (["admin", "owner", "developer"].includes(res.data.user?.role)) {
            navigate("/admin/dashboard");
          } else {
            navigate("/account");
          }
        } catch {
          // Fallback aman jika data profile detail belum siap dari server
          localStorage.setItem(
            "user_data",
            JSON.stringify({ name: "User Google", role: "customer" }),
          );
          navigate("/account");
        }
        window.location.reload();
      };

      fetchUserProfile();
    }
  }, [searchParams, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handler Submit Form (Login / Register Mandiri)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const endpoint = isRegister ? "/auth/register" : "/auth/login";

    try {
      const response = await API.post(
        endpoint,
        isRegister
          ? formData
          : {
              email: formData.email,
              password: formData.password,
            },
      );

      const token = response.data.token;
      const user = response.data.user;

      if (token) {
        localStorage.setItem("token", token);
        localStorage.setItem("user_data", JSON.stringify(user));

        // 🔒 Navigasi pintar membaca string role ("admin", "owner", "developer", "customer")
        if (
          user?.role === "admin" ||
          user?.role === "owner" ||
          user?.role === "developer"
        ) {
          navigate("/admin/dashboard");
        } else {
          if (user?.address_info) {
            localStorage.setItem(
              "user_saved_address",
              JSON.stringify(user.address_info),
            );
          }
          if (onLoginSuccess) onLoginSuccess(user);
          navigate("/account");
        }
        window.location.reload(); // Refresh layout global
      } else if (isRegister) {
        // Jika register berhasil tanpa auto-login dari backend, alihkan ke tab login
        setIsRegister(false);
        setError(
          "Registrasi berhasil! Silakan masuk menggunakan akun baru Anda.",
        );
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.error ||
          "Terjadi kesalahan pada sistem, coba lagi!",
      );
    } finally {
      setLoading(false);
    }
  };

  // Handler Memicu Google OAuth Langsung Ke Backend Go
  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:8080/api/v1/auth/google";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4 font-sans select-none selection:bg-neutral-900 selection:text-white">
      <div className="w-full max-w-sm bg-white border border-neutral-200/60 rounded-2xl p-6 shadow-xs my-8 transition-all duration-300">
        {/* Header Brand */}
        <div className="text-center mb-6">
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-400 block mb-1">
            {isRegister ? "Create Account" : "Secure Access"}
          </span>
          <h2 className="text-lg font-black text-neutral-900 uppercase tracking-wider">
            REPTIL{" "}
            <span className="text-neutral-400 font-light">ADVENTURE</span>
          </h2>
        </div>

        {/* Notifikasi Status/Eror */}
        {error && (
          <div
            className={`mb-4 flex items-center gap-2 p-3 rounded-xl text-xs font-semibold ${
              error.includes("berhasil")
                ? "bg-emerald-50 border border-emerald-100 text-emerald-600"
                : "bg-red-50 border border-red-100 text-red-600"
            }`}
          >
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Input Dinamis */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {isRegister && (
            <>
              <div>
                <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wide mb-1 pl-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-3 h-4 w-4 text-neutral-400" />
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Nama Lengkap"
                    className="w-full pl-11 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 focus:border-neutral-900 rounded-xl text-xs outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wide mb-1 pl-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-3 h-4 w-4 text-neutral-400" />
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="08123xxxx"
                    className="w-full pl-11 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 focus:border-neutral-900 rounded-xl text-xs outline-none transition"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wide mb-1 pl-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-3 h-4 w-4 text-neutral-400" />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="nama@email.com"
                className="w-full pl-11 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 focus:border-neutral-900 rounded-xl text-xs outline-none transition"
              />
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wide mb-1 pl-1">
                Alamat Rumah Lengkap
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-3 h-4 w-4 text-neutral-400" />
                <input
                  type="text"
                  name="address"
                  required
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Nama Jalan, RT/RW, Kota"
                  className="w-full pl-11 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 focus:border-neutral-900 rounded-xl text-xs outline-none transition"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wide mb-1 pl-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-3 h-4 w-4 text-neutral-400" />
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 focus:border-neutral-900 rounded-xl text-xs outline-none transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-xs transition disabled:bg-neutral-400 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 group mt-2"
          >
            {loading
              ? "Processing..."
              : isRegister
                ? "Sign Up Account"
                : "Sign In"}
            <ArrowRight
              size={14}
              className="group-hover:translate-x-0.5 transition-transform"
            />
          </button>
        </form>

        {/* ─── PEMBATAL / DIVIDER OAUTH ─── */}
        <div className="relative flex py-4 items-center">
          <div className="flex-grow border-t border-neutral-100"></div>
          <span className="flex-shrink mx-3 text-[10px] font-mono text-neutral-300 uppercase tracking-wider">
            Atau masuk dengan
          </span>
          <div className="flex-grow border-t border-neutral-100"></div>
        </div>

        {/* 🌐 LAYANAN TOMBOL OAUTH SINGLE GOOGLE */}
        <div className="w-full">
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-2 py-2.5 border border-neutral-200 rounded-xl hover:bg-neutral-50 transition text-xs font-semibold text-neutral-700 cursor-pointer"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.68 1.54 14.98 1 12 1 7.35 1 3.37 3.67 1.39 7.56l3.89 3.02C6.21 7.57 8.87 5.04 12 5.04z"
              />
              <path
                fill="#4285F4"
                d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.29 1.48-1.14 2.73-2.42 3.57v2.97h3.91c2.28-2.1 3.54-5.19 3.54-8.69z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.42c-.25-.76-.39-1.57-.39-2.42s.14-1.66.39-2.42L1.39 6.56C.5 8.34 0 10.31 0 12.4s.5 4.06 1.39 5.84l3.89-2.82z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.91-2.97c-1.08.72-2.48 1.16-4.05 1.16-3.13 0-5.79-2.53-6.73-5.54L1.39 15.56C3.37 19.45 7.35 22 12 23z"
              />
            </svg>
            Masuk dengan Google
          </button>
        </div>

        {/* Toggle Navigasi Bawah */}
        <div className="text-center mt-5">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError("");
            }}
            className="text-[11px] text-neutral-400 font-medium hover:text-neutral-900 transition underline underline-offset-4"
          >
            {isRegister
              ? "Sudah punya akun? Masuk disini"
              : "Belum punya akun? Daftar gratis disini"}
          </button>
        </div>
      </div>
    </div>
  );
}
