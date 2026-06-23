import { X, Play, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { useState } from 'react';

// interface WatchIntroModalProps {
//   isOpen: boolean;
//   onClose: () => void;
// }

export default function WatchIntroModal({ isOpen, onClose }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-neutral-950/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />
      
      {/* Content wrapper */}
      <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 p-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-neutral-400" />
            <span className="font-mono text-xs uppercase tracking-widest text-neutral-400">
              Hoodie Fall/Winter 23 Film
            </span>
          </div>
          <button 
            onClick={onClose}
            className="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Video Screen / Player Mockup */}
        <div className="relative aspect-video w-full bg-black flex items-center justify-center">
          {isPlaying ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-950">
              {/* Dynamic Sound Waves simulation */}
              <div className="flex items-end gap-1 h-12 mb-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
                  <div 
                    key={i} 
                    className="w-1 bg-[#2D3E35] rounded-full animate-pulse" 
                    style={{ 
                      height: `${Math.floor(Math.random() * 80) + 20}%`,
                      animationDelay: `${i * 100}ms`,
                      animationDuration: `${500 + (i % 3) * 200}ms`
                    }} 
                  />
                ))}
              </div>
              
              {/* Video Teaser Canvas Background */}
              <img 
                src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200" 
                alt="Teaser" 
                className="absolute inset-0 h-full w-full object-cover opacity-30 mix-blend-luminosity"
              />

              <div className="relative z-10 text-center px-6">
                <p className="font-sans text-lg md:text-2xl font-light tracking-wide text-white mb-2 max-w-lg mx-auto">
                  "FUNCTION OVER DECORATION"
                </p>
                <p className="font-mono text-xs text-neutral-400">
                  FALL/WINTER COLLECTION 2026 TEASER ACTIVE
                </p>
              </div>

              {/* Player control HUD */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-10">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setIsPlaying(false)} 
                    className="font-mono text-xs text-neutral-300 hover:text-white underline"
                  >
                    PAUSE FILM
                  </button>
                  <button 
                    onClick={() => setIsMuted(!isMuted)} 
                    className="text-neutral-300 hover:text-white transition"
                  >
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </button>
                </div>
                <div className="font-mono text-xs text-neutral-400">
                  01:24 / 03:00
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Cover Art */}
              <img 
                src="https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=1200&auto=format&fit=crop" 
                alt="Intro Teaser Cover" 
                className="absolute inset-0 h-full w-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-neutral-950/40" />
              
              {/* Large Play Button */}
              <button 
                onClick={() => setIsPlaying(true)}
                className="group relative z-10 flex h-20 w-20 items-center justify-center rounded-full bg-white text-black shadow-lg transition hover:scale-110 active:scale-95 duration-200"
              >
                <Play className="h-8 w-8 translate-x-0.5" />
                <span className="absolute -inset-2 rounded-full border border-white/40 animate-ping group-hover:animate-none opacity-75" />
              </button>

              <p className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white font-mono text-[10px] tracking-widest bg-black/60 px-4 py-1.5 rounded-full border border-white/10">
                PLAY BRAND INTRO COODE
              </p>
            </>
          )}
        </div>
        
        {/* Footer info breakdown */}
        <div className="bg-neutral-900 px-6 py-4 border-t border-neutral-800">
          <p className="text-xs text-neutral-400 leading-relaxed font-sans">
            Our Streetwear Cyberpunk Collection captures a raw, industrial perspective of utility and urban defense garments. Designed in our global creative lab, all hoodies featured use certified 450GSM premium loops.
          </p>
        </div>
      </div>
    </div>
  );
}
