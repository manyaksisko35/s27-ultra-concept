'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { View } from '@react-three/drei';
import { PrivacyPhone, type PrivacyState } from '@/components/SectionPhones';
import { requestFrame } from '@/lib/sectionCanvas';
import { playSound } from '@/lib/sound';

// Privacy Display demosu: scroll ile 3D telefon yana döner (bakış açısı artar); Privacy Display açıkken
// ekran yandan bakınca kararır, kapalıyken görünür kalır. 3D telefon ortak tuvalde (SectionCanvas) çizilir.
// Bilgi: Samsung'un ürün sayfası ve destek sayfası (samsung.com/uk/support/... how-to-use-privacy-display...)

const MAX_ANGLE = 55; // derece

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (v: number) => {
  const t = clamp01(v);
  return t * t * (3 - 2 * t);
};

// Scroll ilerlemesi -> bakış açısı: düz bak, yana dön, bekle, geri dön
function angleAt(p: number) {
  if (p < 0.12) return 0;
  if (p < 0.45) return MAX_ANGLE * smooth((p - 0.12) / 0.33);
  if (p < 0.65) return MAX_ANGLE;
  return MAX_ANGLE * (1 - smooth((p - 0.65) / 0.25));
}

export default function PrivacySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const phoneState = useRef<PrivacyState>({ angle: 0, on: true });
  const angleTextRef = useRef<HTMLSpanElement>(null);
  const viewerRef = useRef<HTMLSpanElement>(null);
  const [on, setOn] = useState(true);
  const onRef = useRef(on);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const sec = sectionRef.current;
      if (!sec) return;
      const vh = window.innerHeight;
      const p = clamp01(-sec.getBoundingClientRect().top / Math.max(1, sec.offsetHeight - vh));
      const a = angleAt(p);

      phoneState.current.angle = a;
      phoneState.current.on = onRef.current;
      requestFrame();
      if (angleTextRef.current) angleTextRef.current.textContent = `${Math.round(a)}°`;
      if (viewerRef.current) viewerRef.current.textContent = a < 14 ? 'What you see' : 'What people beside you see';
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    onRef.current = on;
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [on]);

  return (
    // 300svh: telefon yana döner, bir süre bekler, geri döner
    <section ref={sectionRef} id="privacy" className="relative z-10 w-full h-[300svh] bg-[#030303]">
      <div className="sg-ambient amb-cyan sticky top-0 h-svh w-full flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-20 px-6 lg:px-[12%] pt-20 pb-6">
        <div className="max-w-md text-center lg:text-left">
          <p className="sg-eyebrow mb-2 lg:mb-5">Privacy Display</p>
          <h2 className="sg-title text-3xl lg:text-6xl mb-3 lg:mb-6">
            Clear for you. <br />
            <strong className="sg-ai">Dark for everyone else.</strong>
          </h2>
          <p className="text-white/55 text-sm lg:text-lg font-light mb-4 lg:mb-8">
            A first on Galaxy: the display itself limits how light spreads to the sides. Look straight on and
            everything is crisp; from beside you, the screen goes dark. Use it for the whole screen, chosen apps,
            notifications or PIN entry.
          </p>

          <button
            onClick={() => {
              setOn((v) => !v);
              playSound('tick');
            }}
            aria-pressed={on}
            className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-black/75 pl-2 pr-5 py-2 text-sm"
          >
            <span className={`relative w-11 h-6 rounded-full transition-colors ${on ? 'bg-cyan-400' : 'bg-white/20'}`}>
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                  on ? 'translate-x-5' : ''
                }`}
              />
            </span>
            Privacy Display {on ? 'On' : 'Off'}
          </button>
        </div>

        <div className="flex flex-col items-center gap-3 lg:gap-5">
          {/* 3D telefon (ortak tuvalde çizilir; bu kutu sadece yerini belirler) */}
          <View className="w-[min(80vw,420px)] lg:w-[min(36vw,520px)] h-[44svh] lg:h-[66svh]">
            <Suspense fallback={null}>
              <PrivacyPhone state={phoneState} />
            </Suspense>
          </View>
          <p className="text-sm text-white/60">
            <span ref={viewerRef}>What you see</span> · <span ref={angleTextRef} className="tabular-nums">0°</span>
          </p>
        </div>
      </div>
    </section>
  );
}
