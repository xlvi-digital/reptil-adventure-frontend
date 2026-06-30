import React from "react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-16 pt-6 border-t border-neutral-200 text-center text-xs tracking-[0.2em] uppercase text-neutral-500">
      <p>
        © {currentYear} Reptil Adventure. Semua data terhubung ke panel admin
        live.
      </p>
    </footer>
  );
}
