'use client';

import { useRef } from 'react';
import { Skyline, W, H } from '@/components/ZoomSection';
import { smooth, useSectionProgress } from '@/lib/useSectionProgress';

// Nightography: aynı gece sahnesinin "sıradan kamera" (karanlık, kumlu) ve S26 Ultra (parlak, temiz) halleri.
// Ayırıcı scroll ile soldan sağa kayar; kullanıcı sürükleyerek de karşılaştırabilir.
// Bilgi: Samsung Türkiye ürün sayfası (F1.4 geniş kamera %47, F2.9 telefoto %37 daha parlak diyafram)

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

const STATS = [
  { value: '47%', label: 'brighter aperture', detail: '200MP wide · F1.4' },
  { value: '37%', label: 'brighter aperture', detail: '50MP 5x telephoto · F2.9' },
  { value: 'AI ISP', label: 'on the front camera', detail: 'natural, refined selfies' },
];

export default function NightographySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const brightRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  // pos: S26 Ultra görüntüsünün kaç yüzdesi görünür (ayırıcının konumu)
  const setPos = (pos: number) => {
    if (brightRef.current) brightRef.current.style.clipPath = `inset(0 0 0 ${100 - pos}%)`;
    if (handleRef.current) handleRef.current.style.left = `${100 - pos}%`;
  };

  useSectionProgress(sectionRef, (p) => {
    setPos(10 + 80 * smooth((p - 0.1) / 0.6));
    if (statsRef.current) statsRef.current.style.opacity = String(smooth((p - 0.55) / 0.2));
  });

  // Sürükleyerek karşılaştırma
  const drag = (e: React.PointerEvent) => {
    if (e.type === 'pointermove' && e.buttons === 0) return;
    const r = frameRef.current?.getBoundingClientRect();
    if (!r) return;
    setPos(100 - Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100)));
  };

  return (
    <section ref={sectionRef} id="nightography" className="relative z-10 w-full h-[260svh] bg-[#030303]">
      <div className="sg-ambient amb-night sticky top-0 h-svh w-full flex flex-col items-center justify-center gap-4 lg:gap-7 px-4 lg:px-[8%] pt-20 pb-6">
        <div className="text-center">
          <p className="sg-eyebrow mb-2 lg:mb-4">Nightography</p>
          <h2 className="sg-title text-3xl lg:text-6xl">
            Night shots, <strong className="sg-ai">brighter than ever.</strong>
          </h2>
        </div>

        <div
          ref={frameRef}
          onPointerDown={drag}
          onPointerMove={drag}
          className="relative w-full max-w-5xl aspect-[4/5] sm:aspect-video rounded-[28px] overflow-hidden border border-white/10 bg-black touch-pan-y cursor-ew-resize select-none"
        >
          {/* Sıradan kamera: karanlık ve kumlu */}
          <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className="absolute inset-0 w-full h-full brightness-[0.38] contrast-[0.9] saturate-[0.6] blur-[1.5px]">
            <Skyline />
          </svg>
          <div className="absolute inset-0 mix-blend-overlay opacity-50" style={{ backgroundImage: GRAIN }} />

          {/* S26 Ultra: parlak ve net (sağdan açılır) */}
          <div ref={brightRef} className="absolute inset-0" style={{ clipPath: 'inset(0 0 0 90%)' }}>
            <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className="absolute inset-0 w-full h-full brightness-[1.25] saturate-[1.15]">
              <Skyline />
            </svg>
          </div>

          <div ref={handleRef} className="absolute inset-y-0 w-0.5 bg-white/80 pointer-events-none" style={{ left: '90%' }}>
            <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white text-black flex items-center justify-center text-xs font-bold">
              ⇆
            </div>
          </div>

          <span className="absolute bottom-3 left-4 px-3 py-1 rounded-full bg-black/60 text-xs lg:text-sm text-white/70">
            Typical night shot
          </span>
          <span className="absolute bottom-3 right-4 px-3 py-1 rounded-full bg-black/60 text-xs lg:text-sm font-semibold">
            Galaxy S26 Ultra
          </span>
        </div>

        <div ref={statsRef} className="grid grid-cols-3 gap-2 lg:gap-4 w-full max-w-5xl opacity-0">
          {STATS.map((s) => (
            <div key={s.detail} className="sg-card !rounded-2xl p-3 lg:p-5 text-center">
              <p className="sg-ai text-xl lg:text-4xl font-semibold">{s.value}</p>
              <p className="text-[0.65rem] lg:text-sm">{s.label}</p>
              <p className="text-white/45 text-[0.6rem] lg:text-xs font-light">{s.detail}</p>
            </div>
          ))}
        </div>
        <p className="text-[0.6rem] lg:text-xs text-white/35">Illustration. Brightness vs. Galaxy S25 Ultra, per Samsung.</p>
      </div>
    </section>
  );
}
