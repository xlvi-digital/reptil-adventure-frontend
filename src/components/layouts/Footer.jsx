import React from "react";

export default function Footer({ darkMode }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={`mt-16 pt-6 border-t text-center text-xs tracking-wider transition-colors duration-300 ${
        darkMode
          ? "border-[#222222] text-[#555555]"
          : "border-neutral-200 text-neutral-400"
      }`}
    >
      <p>
        © {currentYear} xlvi-digital. All Rights Reserved. Terintegrasi ke
        PostgreSQL Live Database.
      </p>
    </footer>
  );
}
