'use client';

import { Suspense, useRef } from 'react';
import { View } from '@react-three/drei';
import { SteadyPhone, type SteadyState } from '@/components/SectionPhones';
import { requestFrame } from '@/lib/sectionCanvas';
import { smooth, useSectionProgress } from '@/lib/useSectionProgress';

// Super Steady + yatay kilit: scroll ile 3D telefon 360° döner, ekrandaki video ufku düz kalır
// (ekran dokusu ters yönde döner). 3D telefon ortak tuvalde (SectionCanvas) çizilir.
// Bilgi: Samsung (gyro + ivme sensörüyle yerçekimi yönünü algılar, 360° dönse bile kadrajı düz tutar)

export default function SteadySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const angleRef = useRef<HTMLSpanElement>(null);
  const phoneState = useRef<SteadyState>({ angle: 0, bob: 0 });

  useSectionProgress(sectionRef, (p) => {
    const a = 360 * smooth((p - 0.1) / 0.75);
    // Koşarken sarsıntı: telefon hafif zıplar (ekrandaki görüntü yine düz)
    const bob = Math.sin(p * 90) * 0.035 * Math.sin(Math.PI * p);
    phoneState.current.angle = a;
    phoneState.current.bob = bob;
    requestFrame();
    if (angleRef.current) angleRef.current.textContent = `${Math.round(a)}°`;
  });

  return (
    <section ref={sectionRef} id="steady" className="relative z-10 w-full h-[260svh] bg-[#030303]">
      <div className="sg-ambient amb-sunset sticky top-0 h-svh w-full flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-24 px-6 lg:px-[12%] pt-20 pb-6">
        <div className="max-w-md text-center lg:text-left">
          <p className="sg-eyebrow mb-2 lg:mb-5">Super Steady</p>
          <h2 className="sg-title text-3xl lg:text-6xl mb-3 lg:mb-6">
            Spin it. <br />
            <strong className="sg-ai">The horizon stays put.</strong>
          </h2>
          <p className="text-white/55 text-sm lg:text-lg font-light">
            Horizontal Lock reads the direction of gravity with the gyro and acceleration sensors, keeping your video
            level even through a full 360° turn, and steady while you walk or run.
          </p>
        </div>

        <div className="flex flex-col items-center gap-2">
          {/* 3D telefon (ortak tuvalde çizilir). Kare alan: dönen telefonun her açısı sığar. */}
          <View className="w-[min(80vw,46svh)] lg:w-[min(40vw,66svh)] aspect-square">
            <Suspense fallback={null}>
              <SteadyPhone state={phoneState} />
            </Suspense>
          </View>
          <p className="text-sm text-white/60">
            Phone rotation · <span ref={angleRef} className="tabular-nums">0°</span>
          </p>
        </div>
      </div>
    </section>
  );
}
