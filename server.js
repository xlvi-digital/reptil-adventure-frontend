import express from "express";
import path from "path";
import dns from "dns";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Ensure DNS looks up IPv4 first to protect local connections
dns.setDefaultResultOrder("ipv4first");

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API core: Gemini Outdoor Engine Proxy Route
  app.post("/api/gemini/generate", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({
          error:
            "GEMINI_API_KEY environment variable is not defined. Please set it in the Secrets panel.",
        });
      }

      const { prompt, cartCount } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      // Lazy initialization of SDK inside request handler to prevent boot crash
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      // 🌟 UPDATE: Mengubah instruksi sistem ke identitas asli Reptil Adventure
      const systemInstruction = `Anda adalah "Cyber Adventure Guide", asisten AI resmi untuk "Reptil Adventure" — sebuah merek perlengkapan outdoor premium Indonesia yang berbasis di Bandung, berdiri sejak tahun 2023 dengan tagline resmi “Authentic Outdoor Gear”.
         
         Tugas utama Anda adalah membantu pelanggan menemukan perlengkapan outdoor terbaik untuk berbagai aktivitas luar ruangan. 
         Ingat bahwa lini produk Reptil Adventure tidak hanya untuk Hiking atau Trekking, melainkan juga menyediakan perlengkapan berkualitas tinggi untuk Traveling, Running, dan aktivitas outdoor lainnya.
         
         Tiga pilar utama dalam misi produk kami yang wajib dipegang teguh:
         1. Kenyamanan (Desain ergonomis & material presisi untuk pergerakan bebas).
         2. Keamanan (Standar durabilitas tinggi untuk proteksi maksimal di cuaca ekstrem).
         3. Tampil Maksimal (Memadukan fungsi teknis dengan estetika modern urban agar tetap stylish).

         Aturan Komunikasi:
         - Jawab pertanyaan customer dengan gaya bahasa yang sopan, ramah, sangat memahami kultur petualangan, informatif, namun tetap ringkas (maksimal 3-4 kalimat pendek).
         - Gunakan istilah outdoor yang keren dan profesional.
         - Saat ini pengguna memiliki ${cartCount || 0} item di dalam keranjang belanja digital mereka. Jika relevan, Anda boleh mengingatkan mereka untuk melakukan checkout demi petualangan berikutnya!`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.8,
        },
      });

      res.json({ text: response.text });
    } catch (err) {
      console.error("Gemini route error:", err);
      res.status(500).json({
        error: err.message || "Something went wrong inside server AI styling.",
      });
    }
  });

  // server.js

  // Di dalam file server.js Anda:

  // Vite middleware for asset bundling
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(
      `Express dev server actively listening on http://localhost:${PORT}`,
    );
  });
}

startServer();
