'use client';

import { Suspense, useRef } from 'react';
import { View } from '@react-three/drei';
import { DesignPhones, type DesignState } from '@/components/SectionPhones';
import { requestFrame } from '@/lib/sectionCanvas';
import { smooth, useSectionProgress } from '@/lib/useSectionProgress';

// "En ince Ultra": iki 3D telefon önden başlayıp yan profile döner ve yaklaşır, kalınlık farkı görünür.
// 3D telefonlar ortak tuvalde (SectionCanvas) çizilir.
// Bilgi: Samsung (S26 Ultra 7.9 mm / 214 g, S25 Ultra 8.2 mm / 218 g)

const PHONES = [
  { name: 'Galaxy S26 Ultra', mm: '7.9 mm', g: '214 g', main: true },
  { name: 'Galaxy S25 Ultra', mm: '8.2 mm', g: '218 g', main: false },
];

export default function DesignSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const factsRef = useRef<HTMLDivElement>(null);
  const labelsRef = useRef<HTMLDivElement>(null);
  const phoneState = useRef<DesignState>({ turn: 0 });

  useSectionProgress(sectionRef, (p) => {
    phoneState.current.turn = smooth((p - 0.08) / 0.5);
    requestFrame();
    const v = String(smooth((p - 0.5) / 0.2));
    if (factsRef.current) factsRef.current.style.opacity = v;
    if (labelsRef.current) labelsRef.current.style.opacity = v;
  });

  return (
    <section ref={sectionRef} id="design" className="relative z-10 w-full h-[260svh] bg-[#030303]">
      <div className="sg-ambient amb-silver sticky top-0 h-svh w-full flex flex-col items-center justify-center gap-3 lg:gap-6 px-6 pt-20 pb-6">
        <div className="text-center">
          <p className="sg-eyebrow mb-2 lg:mb-4">Design</p>
          <h2 className="sg-title text-3xl lg:text-6xl">
            Our <strong className="sg-ai">slimmest Ultra</strong> yet.
          </h2>
          <p className="text-white/55 text-sm lg:text-lg font-light mt-2 lg:mt-3 max-w-xl mx-auto">
            A balanced design that brings elegance and comfort together and fits naturally in your hand.
          </p>
        </div>

        {/* 3D telefonlar (ortak tuvalde çizilir; bu kutu sadece yerini belirler) */}
        <div className="relative w-full max-w-3xl">
          <View className="w-full h-[34svh] lg:h-[44svh]">
            <Suspense fallback={null}>
              <DesignPhones state={phoneState} />
            </Suspense>
          </View>
          <div ref={labelsRef} className="flex justify-center gap-10 lg:gap-24 opacity-0">
            {PHONES.map((ph) => (
              <p key={ph.name} className="text-center">
                <span className={`block text-xl lg:text-3xl tabular-nums ${ph.main ? 'font-semibold' : 'font-light text-white/60'}`}>
                  {ph.mm}
                </span>
                <span className="text-[0.65rem] lg:text-sm text-white/50">{ph.name}</span>
              </p>
            ))}
          </div>
        </div>

        <div ref={factsRef} className="grid grid-cols-3 gap-2 lg:gap-4 w-full max-w-3xl opacity-0">
          {[
            { v: '7.9 mm', l: 'thin', s: '0.3 mm thinner' },
            { v: '214 g', l: 'light', s: '4 g lighter' },
            { v: '6.9"', l: 'display', s: 'same big screen' },
          ].map((f) => (
            <div key={f.v} className="sg-card !rounded-2xl p-3 lg:p-5 text-center">
              <p className="text-xl lg:text-4xl font-light tracking-tight">{f.v}</p>
              <p className="text-white/55 text-[0.65rem] lg:text-sm">{f.l}</p>
              <p className="text-cyan-200 text-[0.6rem] lg:text-xs">{f.s}</p>
            </div>
          ))}
        </div>
        <p className="text-[0.6rem] lg:text-xs text-white/35">Compared with Galaxy S25 Ultra, per Samsung.</p>
      </div>
    </section>
  );
}
