import { Aperture, ZoomIn, ShieldCheck } from 'lucide-react';

export default function CameraSection() {
  return (
    <section className="h-screen w-full flex items-center justify-start px-[8%] md:px-[12%] relative">
      <div className="max-w-xl">
        <div className="w-20 h-1 bg-gradient-to-r from-cyan-400 to-transparent mb-6" />
        <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-white drop-shadow-xl" style={{ fontFamily: "'Samsung Sharp Sans', 'Outfit', sans-serif" }}>
          Pro-Grade <br /> <span className="text-cyan-400">Optical Power.</span>
        </h2>
        <p className="text-zinc-400 text-lg md:text-xl font-light leading-relaxed mb-8">
          Equipped with a massive 200MP adaptive sensor and 100x Space Zoom capabilities. 
          Captures unmatched detail in absolute darkness with advanced Nightography AI.
        </p>

        {/* Kamera Özellik Kartları */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-md">
            <Aperture className="text-cyan-400 w-6 h-6 mb-2" />
            <h4 className="font-bold text-white text-base">200MP Main</h4>
            <p className="text-zinc-400 text-xs mt-1">Ultra-high resolution clarity.</p>
          </div>
          <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-md">
            <ZoomIn className="text-purple-400 w-6 h-6 mb-2" />
            <h4 className="font-bold text-white text-base">100x Space Zoom</h4>
            <p className="text-zinc-400 text-xs mt-1">Bring distant worlds closer.</p>
          </div>
        </div>
      </div>
    </section>
  );
}