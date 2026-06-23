import React, { useState } from "react";
import {
  Calendar,
  MapPin,
  Gift,
  ArrowRight,
  Camera,
  Ticket,
  ShieldCheck,
  X,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const UPCOMING_EVENTS = [
  {
    id: "ev-1",
    title: "Reptile Open Trip: Hunting & Edukasi Alam",
    category: "Open Trip",
    date: "28 Juni 2026",
    location: "Gunung Gede Pangrango",
    price: "Rp 150.000",
    description:
      "Eksplorasi alam bersama para herpetolog untuk melihat habitat asli reptil endemik Jawa Barat. Kuota terbatas 20 orang!",
    badge: "Hot Event",
    type: "trip",
    image: "../assets/images/event-1.jpg", // 🌟 Diarahkan ke folder assets
  },
  {
    id: "ev-2",
    title: "Giveaway Bulanan: Ball Python Normal Morph",
    category: "Giveaway",
    date: "05 Juli 2026",
    location: "Live Instagram @xlvi.reptile",
    price: "Gratis (Syarat)",
    description:
      "Kesempatan mendapatkan 1 ekor Ball Python sehat hasil breeding lokal secara gratis. Cukup mendaftar melalui formulir di bawah.",
    badge: "Free Entry",
    type: "giveaway",
    image: "../assets/images/event-2.jpg", // 🌟 Diarahkan ke folder assets
  },
  {
    id: "ev-3",
    title: "Indofest Reptile Expo & Bazaar 2026",
    category: "Bazaar",
    date: "12-15 Agustus 2026",
    location: "JCC Senayan, Jakarta",
    price: "Tiket Masuk JCC",
    description:
      "Kunjungi booth kami di Indofest! Akan ada display reptil premium, merchandise eksklusif, dan diskon perlengkapan kandang.",
    badge: "Expo",
    type: "bazaar",
    image: "../assets/images/event-3.webp", // 🌟 Diarahkan ke folder assets
  },
  {
    id: "ev-4",
    title: "Gathering Komunitas & Sharing Session",
    category: "Gathering",
    date: "30 Agustus 2026",
    location: "Basecamp XLVI Digital",
    price: "Rp 25.000",
    description:
      "Kumpul santai sesama pecinta reptil, diskusi perawatan sariawan ular, mupeng morph baru, dan silaturahmi akbar regional.",
    badge: "Community",
    type: "member_baru",
    image: "../assets/images/event-4.webp", // 🌟 Diarahkan ke folder assets
  },
];

const PAST_EVENT_GALLERY = [
  {
    id: 1,
    title: "Gathering Regional 2025",
    img: "../assets/images/1.jpg",
  },
  {
    id: 2,
    title: "Edukasi Herpetologi Alam",
    img: "../assets/images/2.jpg",
  },
  { id: 3, title: "Bazaar Expo Jakarta", img: "../assets/images/3.jpg" },
];

export default function EventPage({
  cartItems,
  handleRemoveFromCart,
  handleUpdateCartQty,
}) {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    whatsapp: "",
    registrationType: "member_baru",
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmitRegistration = (e) => {
    e.preventDefault();
    const message =
      `Halo Admin Reptil, saya ingin mendaftar:\n\n` +
      `📌 Kategori: ${formData.registrationType.toUpperCase().replace("_", " ")}\n` +
      `👤 Nama: ${formData.name}\n` +
      `📱 No. WA: ${formData.whatsapp}\n` +
      (selectedEvent ? `🎫 Event Spesifik: ${selectedEvent.title}` : "");
    window.open(
      `https://wa.me/6281234567890?text=${encodeURIComponent(message)}`,
      "_blank",
    );
  };

  return (
    <div className="min-h-screen bg-[#070b12] text-neutral-100 flex flex-col justify-between selection:bg-red-600 selection:text-white">
      {/* NAVBAR */}
      <Navbar
        cartItems={cartItems}
        onRemoveItem={handleRemoveFromCart}
        onUpdateQty={handleUpdateCartQty}
      />

      {/* 1. HERO SECTION & FLOATING INTEGRATED REGISTRATION FORM */}
      <div className="relative w-full min-h-[90vh] pt-32 pb-20 flex items-center bg-gradient-to-b from-neutral-950 via-[#070b12] to-[#070b12]">
        {/* Background Hutan Outdoor Assets */}
        <div className="absolute inset-0 z-0">
          <img
            src="../assets/images/bg-event.jpg" // 🌟 Diarahkan ke hero banner assets lokal
            alt="Reptile Background"
            className="w-full h-full object-cover opacity-25 filter contrast-125 brightness-75"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#070b12] via-[#070b12]/70 to-transparent hidden lg:block" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070b12] via-transparent to-neutral-950" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 md:px-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center z-10">
          {/* Sisi Kiri: Judul Utama */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.05] text-white uppercase">
              SATU <br />
              KOMUNITAS, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500">
                BERJUTA <br />
                PETUALANGAN
              </span>
            </h1>
            <p className="text-xs md:text-sm text-neutral-400 max-w-lg leading-relaxed font-medium">
              Bergabunglah dalam agenda seru kami: edukasi herpetologi,
              kompetisi eksotis, dan keuntungan eksklusif.
            </p>
            <div className="pt-2">
              <button className="bg-red-600 text-white text-[10px] uppercase font-black tracking-widest px-5 py-3 rounded-md shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_30px_rgba(220,38,38,0.5)] transition-all duration-300 transform hover:-translate-y-0.5">
                CONNECT & EXPLORE WITH US
              </button>
            </div>
          </div>

          {/* Sisi Kanan: Form Pendaftaran */}
          <div className="lg:col-span-5 w-full flex justify-end">
            <div className="w-full max-w-sm bg-neutral-900/80 backdrop-blur-xl border-2 border-neutral-800/80 p-6 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-16 h-[2px] bg-red-600" />
              <div className="absolute top-0 right-0 w-[2px] h-16 bg-red-600" />
              <div className="absolute bottom-0 left-0 w-16 h-[2px] bg-red-700" />
              <div className="absolute bottom-0 left-0 w-[2px] h-16 bg-red-700" />

              <div className="flex justify-between items-center pb-4 border-b border-neutral-800">
                <div>
                  <h2 className="text-xs font-black uppercase tracking-wider text-white">
                    JENIS KEPERLUAN
                  </h2>
                  <p className="text-[9px] text-neutral-500 uppercase mt-0.5">
                    Formulir Registrasi Terpadu
                  </p>
                </div>
                {selectedEvent && (
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="text-neutral-500 hover:text-white transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {selectedEvent && (
                <div className="mt-4 p-3 bg-red-600/10 border border-red-500/20 rounded-xl animate-pulse">
                  <p className="text-[9px] uppercase text-red-500 font-bold">
                    Event Hack:
                  </p>
                  <p className="text-xs font-bold text-white tracking-tight truncate mt-0.5">
                    {selectedEvent.title}
                  </p>
                </div>
              )}

              <form
                onSubmit={handleSubmitRegistration}
                className="space-y-4 text-xs pt-4"
              >
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase text-neutral-400 font-bold tracking-wider">
                    Pilih Layanan
                  </label>
                  <select
                    name="registrationType"
                    value={formData.registrationType}
                    onChange={handleInputChange}
                    className="w-full border border-neutral-800 rounded-xl px-3 py-3 bg-neutral-950/80 text-neutral-300 focus:outline-none focus:border-red-600 font-semibold transition"
                  >
                    <option value="member_baru">
                      Registrasi Official Member
                    </option>
                    <option value="trip">Ikut Open Trip Hunting</option>
                    <option value="giveaway">Klaim Tiket Giveaway</option>
                    <option value="bazaar">
                      Pengajuan Partnership Booth / Bazaar
                    </option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase text-neutral-400 font-bold tracking-wider">
                    Nama Lengkap Anda
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Nama Lengkap"
                    className="w-full border border-neutral-800 rounded-xl px-3 py-3 bg-neutral-950/80 text-white placeholder-neutral-600 focus:outline-none focus:border-red-600 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase text-neutral-400 font-bold tracking-wider">
                    Nomor Whatsapp Aktif
                  </label>
                  <input
                    type="tel"
                    name="whatsapp"
                    required
                    value={formData.whatsapp}
                    onChange={handleInputChange}
                    placeholder="Nomor Whatsapp Aktif"
                    className="w-full border border-neutral-800 rounded-xl px-3 py-3 bg-neutral-950/80 text-white placeholder-neutral-600 focus:outline-none focus:border-red-600 transition"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-red-600 text-white font-black py-3 px-4 rounded-xl uppercase tracking-widest text-center text-[10px] transition duration-300 shadow-[0_4px_15px_rgba(220,38,38,0.2)] hover:bg-red-500 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  KIRIM VIA WHATSAPP <ShieldCheck className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* 2. AGENDA SECTION */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-16 w-full space-y-10">
        <div className="text-center">
          <h2 className="font-black text-xl md:text-2xl text-white uppercase tracking-tight flex items-center justify-center gap-2">
            AGENDA TERDEKAT YANG BISA ANDA IKUTI
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {UPCOMING_EVENTS.map((event) => (
            <div
              key={event.id}
              className="bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden p-5 flex flex-col justify-between space-y-4 relative group"
            >
              <div className="absolute top-0 right-0 w-8 h-[1px] bg-neutral-800 group-hover:bg-red-600 transition" />
              <div className="absolute top-0 right-0 w-[1px] h-8 bg-neutral-800 group-hover:bg-red-600 transition" />

              <div className="h-48 w-full relative overflow-hidden rounded-xl bg-neutral-900">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover transition duration-700 group-hover:scale-105 filter brightness-90 group-hover:brightness-100"
                />
                <div className="absolute bottom-3 right-3 bg-red-600 text-white font-extrabold text-[11px] px-3 py-1 rounded shadow-md">
                  {event.price}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-base text-white tracking-tight leading-snug">
                  {event.title}
                </h3>
                <div className="flex flex-wrap items-center gap-4 text-[10px] text-neutral-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-neutral-500" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-neutral-500" />
                    <span className="truncate max-w-[150px]">
                      {event.location}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedEvent(event);
                  setFormData({ ...formData, registrationType: event.type });
                  window.scrollTo({ top: 200, behavior: "smooth" });
                }}
                className="w-full bg-red-600 hover:bg-red-500 text-white text-[10px] font-black uppercase tracking-widest py-3 px-4 rounded transition flex items-center justify-center gap-1.5 cursor-pointer relative overflow-hidden"
                style={{
                  clipPath:
                    "polygon(0 0, 95% 0, 100% 30%, 100% 100%, 5% 100%, 0 70%)",
                }}
              >
                PILIH & AMBIL SLOT
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 3. DOKUMENTASI SECTION */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-12 w-full space-y-8 border-t border-neutral-900/60">
        <div className="text-center">
          <h2 className="font-black text-sm md:text-base text-white uppercase tracking-widest">
            DOKUMENTASI KEGIATAN KOMUNITAS SEBELUMNYA
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {PAST_EVENT_GALLERY.map((g) => (
            <div
              key={g.id}
              className="relative rounded-xl overflow-hidden group aspect-[4/3] bg-neutral-900 border border-neutral-800"
            >
              <img
                src={g.img}
                alt={g.title}
                className="w-full h-full object-cover filter brightness-75 group-hover:brightness-100 group-hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80 group-hover:opacity-40 transition p-4 flex items-end">
                <p className="text-[10px] uppercase tracking-wider text-neutral-300 font-bold">
                  {g.title}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
