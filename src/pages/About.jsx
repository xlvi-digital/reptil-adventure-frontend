import React from "react";
import { Compass, ShieldCheck, Zap, Award, Target, MapPin } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function AboutPage({
  cartItems,
  handleRemoveFromCart,
  handleUpdateCartQty,
}) {
  return (
    <div className="min-h-screen bg-[#070b12] text-neutral-100 flex flex-col justify-between selection:bg-red-600 selection:text-white">
      {/* NAVBAR */}
      <Navbar
        cartItems={cartItems}
        onRemoveItem={handleRemoveFromCart}
        onUpdateQty={handleUpdateCartQty}
      />

      {/* 1. HERO BANNER */}
      <div className="relative w-full pt-32 pb-20 md:py-40 flex items-center bg-gradient-to-b from-neutral-950 via-[#070b12] to-[#070b12] overflow-hidden">
        {/* Background Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/assets/event-hero.jpg"
            alt="Reptil Adventure Bandung"
            className="w-full h-full object-cover opacity-15 filter contrast-125 brightness-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070b12] via-transparent to-neutral-950" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 md:px-8 w-full text-center z-10 space-y-4">
          <span className="font-mono text-xs font-black tracking-widest text-red-600 uppercase bg-red-600/10 px-3 py-1 rounded-full border border-red-500/20">
            ESTABLISHED 2023
          </span>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-none text-white uppercase">
            TENTANG{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500">
              REPTIL ADVENTURE
            </span>
          </h1>
          <p className="font-mono text-sm md:text-base text-neutral-400 max-w-xl mx-auto tracking-widest uppercase font-bold">
            “Authentic Outdoor Gear”
          </p>
        </div>
      </div>

      {/* 2. BRAND STORY SECTION */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Sisi Kiri: Logo & Aksen Frame Tekno */}
        <div className="lg:col-span-5 flex justify-center order-2 lg:order-1">
          <div className="relative p-8 bg-neutral-900/40 backdrop-blur-md border border-neutral-800 rounded-2xl w-full max-w-sm aspect-square flex items-center justify-center group shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
            {/* Sudut Cyberpunk Merah */}
            <div className="absolute top-0 right-0 w-12 h-[2px] bg-red-600" />
            <div className="absolute top-0 right-0 w-[2px] h-12 bg-red-600" />
            <div className="absolute bottom-0 left-0 w-12 h-[2px] bg-red-600" />
            <div className="absolute bottom-0 left-0 w-[2px] h-12 bg-red-600" />

            {/* Menggunakan Logo Utama */}
            <img
              src="/assets/reptil_2.png"
              alt="Reptil Adventure Logo"
              className="w-48 h-48 object-contain filter drop-shadow-[0_0_20px_rgba(220,38,38,0.15)] transition duration-500 group-hover:scale-105"
            />
          </div>
        </div>

        {/* Sisi Kanan: Deskripsi Cerita */}
        <div className="lg:col-span-7 space-y-6 text-left order-1 lg:order-2">
          <div className="flex items-center gap-2 text-red-500 text-xs font-mono font-bold uppercase tracking-wider">
            <MapPin className="w-4 h-4" /> Based in Bandung, Indonesia
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">
            Merek Outdoor Indonesia yang Tangguh dan Autentik
          </h2>
          <p className="text-sm text-neutral-400 leading-relaxed font-medium">
            Berdiri sejak tahun 2023, <strong>Reptil Adventure</strong> lahir
            sebagai wujud nyata dukungan bagi para penggiat alam bebas di
            Indonesia. Berbasis di kota kreatif Bandung, kami berdedikasi
            menciptakan perlengkapan luar ruangan tangguh yang mengusung jiwa
            petualang sejati.
          </p>
          <p className="text-sm text-neutral-400 leading-relaxed font-medium">
            Tidak hanya berfokus pada kebutuhan teknis seperti{" "}
            <span className="text-white font-semibold">Hiking</span> atau{" "}
            <span className="text-white font-semibold">Trekking</span>, lini
            produk kami berkembang luas untuk menemani segala aktivitas
            pergerakan Anda, mulai dari{" "}
            <span className="text-white font-semibold">Traveling</span>,{" "}
            <span className="text-white font-semibold">Running</span>, hingga
            berbagai kegiatan outdoor dinamis lainnya.
          </p>
        </div>
      </div>

      {/* 3. MISI & PILAR UTAMA SECTION (3 Kolom Responsif) */}
      <div className="bg-neutral-950/60 border-y border-neutral-900 py-16 my-8 w-full">
        <div className="max-w-6xl mx-auto px-4 md:px-8 w-full space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="flex justify-center">
              <Target className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">
              MISI UTAMA KAMI
            </h2>
            <p className="text-xs md:text-sm text-neutral-400 leading-relaxed">
              Menyediakan produk outdoor dengan kualitas terbaik bagi pelanggan
              kami agar mendapatkan proteksi maksimal dalam setiap perjalanan.
            </p>
          </div>

          {/* Grid 3 Pilar Kenyamanan, Keamanan, Tampil Maksimal */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            {/* Pilar 1 */}
            <div className="bg-neutral-900/60 border border-neutral-800 p-6 rounded-xl space-y-3 relative overflow-hidden group">
              <div className="p-3 bg-red-600/10 text-red-500 rounded-lg w-fit">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-white uppercase tracking-wide">
                Kenyamanan
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Setiap material dipilih secara presisi dan ergonomis, memastikan
                pergerakan tubuh Anda tetap bebas hambatan di segala medan
                ekstrem maupun harian.
              </p>
            </div>

            {/* Pilar 2 */}
            <div className="bg-neutral-900/60 border border-neutral-800 p-6 rounded-xl space-y-3 relative overflow-hidden group">
              <div className="p-3 bg-red-600/10 text-red-500 rounded-lg w-fit">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-white uppercase tracking-wide">
                Keamanan
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Standar durabilitas tinggi menjadi prioritas utama. Memberikan
                perlindungan andal dan rasa aman penuh di bawah cuaca luar
                ruangan Indonesia yang tidak menentu.
              </p>
            </div>

            {/* Pilar 3 */}
            <div className="bg-neutral-900/60 border border-neutral-800 p-6 rounded-xl space-y-3 relative overflow-hidden group">
              <div className="p-3 bg-red-600/10 text-red-500 rounded-lg w-fit">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-white uppercase tracking-wide">
                Tampil Maksimal
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Memadukan fungsionalitas teknis dengan estetika modern, potongan
                urban, dan corak berani yang membuat Anda tetap terlihat
                *stylish* di mana pun berada.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. KATEGORI AKTIVITAS LUAR RUANGAN */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-12 w-full space-y-8">
        <div className="text-center">
          <h2 className="text-sm font-mono tracking-widest text-neutral-400 uppercase font-black">
            KATEGORI KEGIATAN OUTDOOR KAMI
          </h2>
        </div>

        {/* Grid Aktivitas - Flex/Grid Responsif */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            "HIKING & TREKKING",
            "TRAVELING",
            "TRAIL RUNNING",
            "CAMPING GEAR",
          ].map((item, index) => (
            <div
              key={index}
              className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 text-center transition duration-300 hover:border-red-600 relative group cursor-default"
            >
              <span className="text-xs font-sans font-black text-white tracking-wider uppercase group-hover:text-red-500 transition">
                {item}
              </span>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-red-600 group-hover:w-1/2 transition-all duration-300" />
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
