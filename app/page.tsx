'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import Scene from '@/components/Scene';
import Hero from '@/components/Hero';
import Teardown from '@/components/Teardown';
import Features from '@/components/Features';
import CameraSection from '@/components/CameraSection';

export default function Home() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <main id="main-scroll-container" className="relative w-full h-auto bg-[#030303]">
      {/* 3D Canvas Sabit Katman */}
      <div className="fixed top-0 left-0 w-full h-full z-0 pointer-events-none">
        <Scene />
      </div>

      {/* 4 Aşamalı HTML Scroll Bölümleri */}
      <div className="relative z-10 w-full flex flex-col pointer-events-auto">
        <Hero />
        <Teardown />
        <Features />
        <CameraSection />
      </div>
    </main>
  );
}