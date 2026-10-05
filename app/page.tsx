'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import Scene from '@/components/Scene';
import Hero from '@/components/Hero';
import TearDown from '@/components/TearDown';
import Features from '@/components/Features';

export default function Home() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
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
    <main id="main-scroll-container" className="relative w-full">
      {/* 3D Canvas - Tailwind'den bağımsız kesin boyutlandırma */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0, pointerEvents: 'none' }}>
        <Scene />
      </div>

      <div className="relative z-10">
        <Hero />
        <TearDown />
        <Features />
      </div>
      
      <div className="h-screen w-full bg-[#030303]"></div>
    </main>
  );
}