'use client';

import { Suspense, useRef } from 'react';
import { View } from '@react-three/drei';
import { InsidePhone, type InsideState } from '@/components/SectionPhones';
import { requestFrame } from '@/lib/sectionCanvas';
import { smooth, useSectionProgress } from '@/lib/useSectionProgress';

// Patlamış görünüm: scroll ile 3D telefon yana döner ve katmanlarına ayrılır; soldaki liste sırayla yanar.
// 3D telefon ortak tuvalde (SectionCanvas) çizilir. Bilgiler Samsung'un ürün sayfasından.
const LAYERS = [
  { title: 'Display', text: '6.9" QHD+ Dynamic AMOLED 2X, up to 2600 nits, with built-in Privacy Display.' },
  { title: 'Vapor Chamber', text: 'Redesigned to keep peak performance going under heavy loads.' },
  { title: 'Snapdragon 8 Elite Gen 5 for Galaxy', text: '3nm chip: 39% faster NPU, 24% better GPU, 19% faster CPU.' },
  { title: 'Frame', text: 'Our slimmest Ultra: 7.9 mm and 214 g.' },
  { title: '5,000 mAh battery', text: 'Up to 31 hours of video, 60W Super Fast Charging 3.0.' },
  { title: 'S Pen', text: 'Built in, always ready.' },
  { title: 'Camera system', text: '200MP F1.4 wide, 50MP ultra-wide, 50MP 5x and 10MP 3x telephoto.' },
];

export default function InsideSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const phoneState = useRef<InsideState>({ turn: 0, explode: 0 });

  useSectionProgress(sectionRef, (p) => {
    phoneState.current.turn = smooth(p / 0.2);
    phoneState.current.explode = smooth((p - 0.15) / 0.45);
    requestFrame();
    // Katmanlar ayrıldıkça liste sırayla yanar
    const n = LAYERS.length;
    itemRefs.current.forEach((el, i) => {
      if (!el) return;
      const v = smooth((p - 0.2 - (i / n) * 0.45) / 0.08);
      el.style.opacity = String(0.25 + 0.75 * v);
      el.style.transform = `translateX(${(1 - v) * -8}px)`;
    });
  });

  return (
    <section ref={sectionRef} id="inside" className="relative z-10 w-full h-[320svh] bg-[#030303]">
      <div className="sg-ambient amb-teal sticky top-0 h-svh w-full flex flex-col lg:flex-row items-center justify-center gap-2 lg:gap-12 px-6 lg:px-[8%] pt-20 pb-4">
        <div className="max-w-md w-full">
          <p className="sg-eyebrow mb-2 lg:mb-4 text-center lg:text-left">Inside</p>
          <h2 className="sg-title text-3xl lg:text-6xl mb-3 lg:mb-8 text-center lg:text-left">
            Every layer, <strong className="sg-ai">engineered.</strong>
          </h2>
          <ol className="grid grid-cols-2 lg:grid-cols-1 gap-x-4 gap-y-1.5 lg:gap-y-3">
            {LAYERS.map((l, i) => (
              <li
                key={l.title}
                ref={(el) => {
                  itemRefs.current[i] = el;
                }}
                className="opacity-25 lg:border-l lg:border-white/15 lg:pl-4"
              >
                <p className="text-[0.7rem] lg:text-base font-semibold leading-tight">{l.title}</p>
                <p className="hidden lg:block text-white/55 text-sm font-light">{l.text}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* 3D telefon (ortak tuvalde çizilir) */}
        <View className="w-full max-w-[640px] flex-1 lg:flex-none lg:h-[78svh] min-h-0">
          <Suspense fallback={null}>
            <InsidePhone state={phoneState} />
          </Suspense>
        </View>
      </div>
    </section>
  );
}
