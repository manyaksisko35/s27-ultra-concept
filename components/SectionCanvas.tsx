'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { View } from '@react-three/drei';
import { useEffect, useState } from 'react';
import { setRequestFrame } from '@/lib/sectionCanvas';

// Super Steady, Privacy Display, Design, Inside ve Build bölümlerinin 3D telefonları için TEK ortak tuval.
// Her bölüm kendi <View> alanını çizer (drei View: sadece ekrandaki alan, scissor ile).
// Ayrı ayrı Canvas açmak her biri için ayrı WebGL bağlamı ve GPU yükü demekti.
const SECTION_IDS = ['steady', 'privacy', 'design', 'inside', 'build'];

// Talep üzerine çizim köprüsü + her karede tuvali temizleme (View'lar kaydıkça arkada iz kalmasın)
function Bridge({ active }: { active: boolean }) {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    setRequestFrame(() => invalidate());
    return () => setRequestFrame(() => {});
  }, [invalidate]);
  useEffect(() => {
    if (active) invalidate();
  }, [active, invalidate]);
  // Öncelik 0: View'lardan (öncelik 1+) önce çalışır
  useFrame(({ gl }) => {
    gl.setScissorTest(false);
    gl.clear(true, true);
  }, 0);
  return null;
}

export default function SectionCanvas() {
  const [mounted, setMounted] = useState(false); // sayfa yüklenince boşta bir anda (ya da bölümlere yaklaşınca) bir kez kurulur
  const [active, setActive] = useState(false); // bölümlerden biri ekrandayken çizilir

  useEffect(() => {
    const els = SECTION_IDS.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    // Erken kurulum: sayfa açıldıktan biraz sonra, tarayıcı boştayken. Böylece modeller ve shader'lar
    // kullanıcı bu bölümlere gelmeden hazır olur (Warmup).
    let cancelIdle = () => {};
    const timer = window.setTimeout(() => {
      if ('requestIdleCallback' in window) {
        const id = window.requestIdleCallback(() => setMounted(true), { timeout: 3000 });
        cancelIdle = () => window.cancelIdleCallback(id);
      } else setMounted(true);
    }, 2500);
    const near = new Set<Element>();
    const mountIo = new IntersectionObserver((es) => es.some((e) => e.isIntersecting) && setMounted(true), {
      rootMargin: '200% 0px',
    });
    const activeIo = new IntersectionObserver(
      (es) => {
        es.forEach((e) => (e.isIntersecting ? near.add(e.target) : near.delete(e.target)));
        setActive(near.size > 0);
      },
      { rootMargin: '50% 0px' }
    );
    els.forEach((el) => {
      mountIo.observe(el);
      activeIo.observe(el);
    });
    return () => {
      window.clearTimeout(timer);
      cancelIdle();
      mountIo.disconnect();
      activeIo.disconnect();
    };
  }, []);

  if (!mounted) return null;
  return (
    <Canvas
      frameloop={active ? 'demand' : 'never'}
      dpr={[1, 1.25]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      // Bölümlerin üstünde, saydam; tıklamaları engellemez. Kullanılmazken gizli (eski kare görünmesin).
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 20,
        pointerEvents: 'none',
        visibility: active ? 'visible' : 'hidden',
      }}
    >
      <Bridge active={active} />
      <View.Port />
    </Canvas>
  );
}
