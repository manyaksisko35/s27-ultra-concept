'use client';

import { useEffect, useRef } from 'react';
import { playSound } from '@/lib/sound';

// Şarj yarışı: scroll ile 0'dan 30 dakikaya kadar zaman ilerler, iki pil aynı anda dolar.
// S26 Ultra: Samsung'a göre 60W ile ~30 dakikada %75 (resmi).
// S25 Ultra: Samsung 30 dakika için rakam yayınlamıyor; eğri 45W kullanıcı ölçümlerine (~%60) göre tahmini.

const MINUTES = 30;
const PHONES = [
  { name: 'Galaxy S26 Ultra', watt: '60W', tech: 'Super Fast Charging 3.0', at30: 75, main: true },
  { name: 'Galaxy S25 Ultra', watt: '45W', tech: 'Super Fast Charging 2.0', at30: 60, main: false },
];

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

// Hızlı şarj eğrisi: başta hızlı, sona doğru yavaşlar; t=30 dk'da tam olarak at30'a ulaşır
const charge = (minutes: number, at30: number) => at30 * (1 - Math.pow(1 - minutes / MINUTES, 1.8));

export default function ChargeSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const timeRef = useRef<HTMLSpanElement>(null);
  const fillRefs = useRef<(HTMLDivElement | null)[]>([]);
  const pctRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    let chimed = false;
    let raf = 0;
    const update = () => {
      raf = 0;
      const sec = sectionRef.current;
      if (!sec) return;
      const vh = window.innerHeight;
      const p = clamp01(-sec.getBoundingClientRect().top / Math.max(1, sec.offsetHeight - vh));
      const minutes = MINUTES * clamp01((p - 0.1) / 0.75);

      // 30. dakikada (şarj yarışı bitince) çan sesi; geri sarılırsa tekrar çalabilir
      if (minutes >= MINUTES && !chimed) {
        chimed = true;
        playSound('chime');
      } else if (minutes < MINUTES * 0.8) chimed = false;
      if (timeRef.current) timeRef.current.textContent = String(Math.floor(minutes)).padStart(2, '0');
      PHONES.forEach((ph, i) => {
        const pct = charge(minutes, ph.at30);
        const fill = fillRefs.current[i];
        if (fill) fill.style.transform = `scaleY(${pct / 100})`;
        const label = pctRefs.current[i];
        if (label) label.textContent = String(Math.round(pct));
      });
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    // 300svh: 30 dakikalık şarj scroll'a yayılır
    <section ref={sectionRef} id="charging" className="relative z-10 w-full h-[300svh] bg-[#030303]">
      <div className="sg-ambient amb-violet sticky top-0 h-svh w-full flex flex-col items-center justify-center gap-5 lg:gap-8 px-6 pt-20 pb-6">
        <div className="text-center">
          <p className="sg-eyebrow mb-2 lg:mb-4">Charging</p>
          <h2 className="sg-title text-3xl lg:text-6xl">
            <strong className="sg-ai">60W.</strong> Up to 75% in 30 minutes.
          </h2>
        </div>

        {/* Zaman sayacı */}
        <p className="text-white/60 text-sm lg:text-base">
          <span ref={timeRef} className="text-4xl lg:text-6xl font-extralight text-white tabular-nums">
            00
          </span>{' '}
          min on the charger
        </p>

        {/* Piller */}
        <div className="flex items-end justify-center gap-10 lg:gap-24">
          {PHONES.map((ph, i) => (
            <div key={ph.name} className="flex flex-col items-center gap-3">
              <p className="text-3xl lg:text-5xl font-semibold tabular-nums">
                <span
                  ref={(el) => {
                    pctRefs.current[i] = el;
                  }}
                >
                  0
                </span>
                <span className="text-lg lg:text-2xl text-white/50">%</span>
              </p>
              <div className="relative">
                <div className="mx-auto w-8 lg:w-10 h-2 rounded-t-md bg-white/25" />
                <div className="relative w-24 lg:w-32 h-[30svh] lg:h-[38svh] rounded-2xl border-2 border-white/25 p-1.5 overflow-hidden">
                  <div
                    ref={(el) => {
                      fillRefs.current[i] = el;
                    }}
                    className={`h-full w-full rounded-xl origin-bottom will-change-transform ${
                      ph.main ? 'bg-gradient-to-t from-cyan-500 to-violet-400' : 'bg-white/35'
                    }`}
                    style={{ transform: 'scaleY(0)' }}
                  />
                </div>
              </div>
              <div className="text-center">
                <p className={`text-sm lg:text-lg ${ph.main ? 'font-semibold' : 'font-light text-white/60'}`}>
                  {ph.name}
                </p>
                <p className="text-xs lg:text-sm text-white/45">
                  {ph.watt} {ph.tech}
                </p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-[0.65rem] lg:text-xs text-white/35 text-center max-w-xl">
          S26 Ultra: Samsung&apos;s figure (about 75% in 30 min with a 60W adapter). S25 Ultra: Samsung doesn&apos;t
          publish a 30-minute figure; its curve is an estimate based on 45W charging. Results vary with adapter,
          temperature and usage.
        </p>
      </div>
    </section>
  );
}
