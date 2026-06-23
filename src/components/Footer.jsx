import React from "react";


export default function Footer() {
    return (
        <footer className="bg-white border-t border-neutral-100 py-12 mt-16 select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-neutral-500 text-xs">
          <div className="flex items-center gap-2">
            <h2 className="font-display font-black text-lg text-neutral-900 tracking-tight">Reptil Adventure</h2>
            <span>— Premium Streetwear Cyberpwrk Apparel</span>
          </div>
          <div className="mt-4 sm:mt-0 font-mono text-[10px] tracking-wider uppercase text-neutral-400">
            © 2026 Reptil Adventure CO. ALL SPECIFICATION RIGHTS RESERVED
          </div>
        </div>
      </footer>
    )
}