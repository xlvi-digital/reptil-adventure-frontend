import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { PRODUCTS } from "../data"; // Sesuaikan dengan path file data produk Anda
import { Minus, Plus, ShoppingBag, ArrowLeft, Star } from "lucide-react";

export default function ProductDetail({
  handleAddToCart,
  formatRupiah,
  products,
}) {
  // 🌟 Ambil ID produk dari URL Browser menggunakan useParams
  const { id } = useParams();

  // Cari produk yang cocok berdasarkan ID
  const product = products?.find((p) => String(p.id) === String(id));

  // State lokal untuk interaksi di halaman detail
  // Mengambil warna pertama yang tersedia dari database secara dinamis saat halaman dimuat
  const [selectedColor, setSelectedColor] = useState(() => {
    if (product?.colors && product.colors.length > 0) {
      const firstColor = product.colors[0];
      return typeof firstColor === "object" ? firstColor.name : firstColor;
    }
    return "Default";
  });
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);

  // Set nilai default ketika produk berhasil dimuat
  useEffect(() => {
    if (product) {
      if (product.colors && product.colors.length > 0)
        setSelectedColor(product.colors[0].name);
      if (product.sizes && product.sizes.length > 0)
        setSelectedSize(product.sizes[0]);
      // Reset kuantitas ke 1 setiap ganti barang
      setQuantity(1);
    }
    // Scroll otomatis ke atas halaman saat membuka produk baru
    window.scrollTo(0, 0);
  }, [product]);

  // Jika produk tidak ditemukan di database
  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center font-sans">
        <p className="text-neutral-500 mb-4">
          Perlengkapan tidak ditemukan atau telah dihapus.
        </p>
        <Link
          to="/"
          className="text-sm font-bold text-neutral-900 underline flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali ke Katalog
        </Link>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-12 font-sans">
      {/* Tombol Back */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-xs font-bold text-neutral-500 hover:text-neutral-900 transition mb-8"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali ke Katalog Utama
      </Link>

      {/* Grid Konten Detail */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Kolom Kiri: Gambar Produk Premium */}
        <div className="w-full bg-neutral-50 rounded-3xl border border-neutral-100 overflow-hidden flex items-center justify-center p-8 aspect-square">
          <img
            src={
              product?.image &&
              typeof product.image === "string" &&
              product.image.startsWith("{")
                ? `http://localhost:8080${JSON.parse(product.image).primary}`
                : product?.image?.primary
                  ? `http://localhost:8080${product.image.primary}`
                  : "https://via.placeholder.com/600"
            }
            alt={product?.name || product?.title}
            className="w-full h-full object-cover rounded-2xl"
          />
        </div>

        {/* Kolom Kanan: Detail & Pembelian */}
        <div className="space-y-6 flex flex-col justify-center">
          <div>
            <span className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase">
              {typeof product?.category === "object" &&
              product?.category !== null
                ? product.category.name
                : product?.category || "No Category"}
            </span>
            <h1 className="text-3xl font-display font-black text-neutral-900 mt-1 tracking-tight">
              {product.name}
            </h1>
            <div className="flex items-center gap-1 mt-2 text-amber-500">
              <Star className="h-4 w-4 fill-current" />
              <span className="text-xs font-bold text-neutral-700">4.9</span>
              <span className="text-xs text-neutral-400">
                (48 Ulasan Terverifikasi)
              </span>
            </div>
          </div>

          {/* Harga Tag */}
          <div className="text-2xl font-sans font-black text-neutral-900 border-b border-neutral-100 pb-4">
            {formatRupiah ? formatRupiah(product.price) : `Rp ${product.price}`}
          </div>

          {/* Deskripsi Produk */}
          <p className="text-neutral-600 text-xs leading-relaxed">
            {product.description ||
              "Perlengkapan outdoor premium yang dirancang khusus untuk petualangan tangguh. Menggunakan material berkualitas tinggi yang awet, ringan, dan nyaman digunakan dalam berbagai kondisi cuaca ekstrim."}
          </p>

          {/* Opsi Pilihan Warna (Versi Fleksibel & Anti-Crash) */}
          {product?.colors && product.colors.length > 0 && (
            <div className="space-y-2">
              <span className="block font-mono text-[10px] uppercase text-neutral-500">
                Warna Terpilih:{" "}
                <strong className="text-neutral-900">
                  {/* Mengambil nama string langsung, atau properti .name jika berupa object */}
                  {typeof selectedColor === "object"
                    ? selectedColor?.name
                    : selectedColor}
                </strong>
              </span>
              <div className="flex gap-2">
                {product.colors.map((color, idx) => {
                  // 🌟 Deteksi otomatis tipe data warna dari database
                  const isObject = typeof color === "object" && color !== null;
                  const colorName = isObject ? color.name : color;
                  const colorHex = isObject ? color.hex : null;

                  // Mengecek apakah warna ini sedang aktif dipilih
                  const isSelected =
                    typeof selectedColor === "object"
                      ? selectedColor?.name === colorName
                      : selectedColor === colorName;

                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedColor(colorName)}
                      // Jika ada data HEX gunakan warna aslinya, jika string teks biasa (misal "black") inline style CSS akan otomatis membacanya
                      style={{ backgroundColor: colorHex || colorName }}
                      className={`w-6 h-6 rounded-full border-2 cursor-pointer transition ${
                        isSelected
                          ? "border-neutral-900 scale-110"
                          : "border-neutral-200 hover:scale-105"
                      }`}
                      title={colorName}
                      type="button" // Mencegah tombol memicu submit form tidak sengaja
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Opsi Pilihan Ukuran (Jika ada datanya) */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="space-y-2">
              <span className="block font-mono text-[10px] uppercase text-neutral-500">
                Ukuran:
              </span>
              <div className="flex gap-2">
                {product.sizes?.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-3 py-1.5 border rounded-lg font-sans text-xs font-bold cursor-pointer transition ${
                      selectedSize === size
                        ? "bg-neutral-900 border-neutral-900 text-white"
                        : "bg-white border-neutral-200 text-neutral-700 hover:border-neutral-400"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Pengatur Kuantitas & Tombol Beli */}
          <div className="pt-4 flex items-center gap-4">
            {/* Box Counter */}
            <div className="flex items-center border border-neutral-200 rounded-xl overflow-hidden bg-neutral-50">
              <button
                onClick={() => setQuantity((prev) => (prev > 1 ? prev - 1 : 1))}
                className="p-3 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition cursor-pointer"
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="w-10 text-center font-sans font-bold text-xs text-neutral-800">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((prev) => prev + 1)}
                className="p-3 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition cursor-pointer"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>

            {/* Tombol Add to Cart Utama */}
            <button
              onClick={() => {
                // Pastikan urutan argumen ini sama dengan definisi fungsi handleAddToCart di App.jsx Anda
                handleAddToCart(product, selectedSize, selectedColor, quantity);
              }}
              className="flex-1 bg-neutral-900 hover:bg-neutral-800 text-white font-sans text-xs font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 shadow-sm transition active:scale-[0.98] cursor-pointer"
            >
              <ShoppingBag className="h-4 w-4" /> Masukkan Keranjang Belanja
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
