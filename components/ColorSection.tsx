'use client';

import { useEffect, useRef, useSyncExternalStore } from 'react';
import { FAN_COLORS, getColorId, getServerColorId, setColorId, subscribeColor } from '@/lib/phoneColor';

export default function ColorSection() {
  const activeId = useSyncExternalStore(subscribeColor, getColorId, getServerColorId);
  const active = FAN_COLORS.find((c) => c.id === activeId) ?? FAN_COLORS[0];

  const sectionRef = useRef<HTMLElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Renk seçici yelpaze açılırken yavaşça görünür (scroll'a bağlı, state tutmadan)
  useEffect(() => {
    const update = () => {
      const sec = sectionRef.current;
      const picker = pickerRef.current;
      if (!sec || !picker) return;
      const vh = window.innerHeight;
      const t = (window.scrollY - sec.offsetTop) / vh; // 0 = bölüm başı, 1 = yelpaze açılmış
      const v = Math.min(1, Math.max(0, (t - 0.45) / 0.45));
      picker.style.opacity = String(v);
      picker.style.pointerEvents = v > 0.6 ? 'auto' : 'none';
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    // 300svh: ilk 100svh'de bölüm girer ve telefon geçişi biter, sonraki 200svh'de içerik sabit kalır:
    // yelpaze açılır, ardından renk seçimi için bir ekran daha beklenir
    <section ref={sectionRef} id="colors" className="relative w-full h-[300svh] pointer-events-none">
      <div className="sticky top-0 h-svh w-full flex flex-col justify-between items-center px-6 md:px-[12%] pt-24 md:pt-28 pb-8 md:pb-10 text-center">
        <div>
          <p className="sg-eyebrow mb-3 md:mb-5">Colors</p>
          <h2 className="sg-title text-4xl md:text-6xl drop-shadow-xl">
            Pick your <strong className="sg-ai">style.</strong>
          </h2>
        </div>

        <div ref={pickerRef} className="flex flex-col items-center gap-4 md:gap-5" style={{ opacity: 0 }}>
          <p className="sg-title text-3xl md:text-5xl">{active.name}</p>
          <div
            role="radiogroup"
            aria-label="Phone color"
            className="flex items-center gap-3 md:gap-4 rounded-full border border-white/10 bg-black/45 backdrop-blur-xl px-5 py-3"
          >
            {FAN_COLORS.map((c) => {
              const selected = c.id === activeId;
              return (
                <button
                  key={c.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  aria-label={c.name}
                  title={c.name}
                  onClick={() => setColorId(c.id)}
                  className={`w-9 h-9 md:w-10 md:h-10 rounded-full border border-white/25 transition-transform duration-200 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                    selected ? 'ring-2 ring-white ring-offset-2 ring-offset-black scale-105' : ''
                  }`}
                  style={{ background: c.swatch }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}