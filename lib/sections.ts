'use client';

import { useEffect, useState } from 'react';

// Sayfadaki tüm bölümler (yukarıdan aşağıya). Menü (Navbar) ve bölüm noktaları (SectionDots) buradan beslenir.
// group: menüde hangi başlığın altında durduğu. offset: tıklanınca bölümün başından kaç ekran içeri kayılacağı
// (S Pen çıkmış, yelpaze açılmış, karşılaştırma dolmuş görünsün diye).
export type Section = { id: string; label: string; group: string; offset?: number; inMenu?: boolean };

export const SECTIONS: Section[] = [
  { id: 'overview', label: 'Overview', group: 'Overview' },
  { id: 'performance', label: 'Performance', group: 'Performance' },
  { id: 'features', label: 'Display & Chip', group: 'Performance', inMenu: false },
  { id: 'camera', label: 'Camera', group: 'Camera' },
  { id: 's-pen', label: 'S Pen', group: 'S Pen', offset: 1 },
  { id: 'colors', label: 'Colors', group: 'Colors', offset: 1 },
  { id: 'galaxy-ai', label: 'Galaxy AI', group: 'Features' },
  { id: 'zoom', label: '100x Zoom', group: 'Camera' },
  { id: 'nightography', label: 'Nightography', group: 'Camera' },
  { id: 'steady', label: 'Super Steady', group: 'Camera' },
  { id: 'privacy', label: 'Privacy Display', group: 'Features' },
  { id: 'charging', label: 'Charging', group: 'Features' },
  { id: 'design', label: 'Design', group: 'Features' },
  { id: 'inside', label: 'Inside', group: 'Features' },
  { id: 'compare', label: 'Compare', group: 'Compare', offset: 2 },
  { id: 'security', label: 'Security', group: 'Features' },
  { id: 'build', label: 'Build your Ultra', group: 'Buy', inMenu: false },
  { id: 'specs', label: 'Specs', group: 'Specs' },
];

// Menü grupları (masaüstünde soldan sağa sıra). Birden çok bölümü olan grup açılır menü olur.
export const GROUPS = ['Overview', 'Performance', 'Camera', 'S Pen', 'Colors', 'Features', 'Compare', 'Specs'].map(
  (name) => ({ name, items: SECTIONS.filter((s) => s.group === name && s.inMenu !== false) })
);

// Ekranın ortasını geçen son bölüm (scroll'a göre, karede en fazla bir kez hesaplanır)
export function useActiveSection() {
  const [active, setActive] = useState<string>(SECTIONS[0].id);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const line = window.innerHeight * 0.5;
      let current = SECTIONS[0].id;
      for (const s of SECTIONS) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= line) current = s.id;
      }
      setActive(current);
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
  return active;
}

export const sectionById = (id: string) => SECTIONS.find((s) => s.id === id);
