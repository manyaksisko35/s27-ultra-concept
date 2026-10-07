'use client';

import { useEffect, useState } from 'react';
import { scrollToId } from '@/lib/lenis';

// offset: bölümün başından kaç ekran içeri kayılacağı (S Pen çıkmış, yelpaze açılmış görünsün diye)
const LINKS = [
  { label: 'Overview', id: 'overview', offset: 0 },
  { label: 'Performance', id: 'performance', offset: 0 },
  { label: 'Camera', id: 'camera', offset: 0 },
  { label: 'S Pen', id: 's-pen', offset: 1 },
  { label: 'Colors', id: 'colors', offset: 1 },
  { label: 'Compare', id: 'compare', offset: 2 },
  { label: 'Specs', id: 'specs', offset: 0 },
];

// Sayfadaki sıra (yukarıdan aşağıya). link: menüde hangi öğenin aktif görüneceği (null = hiçbiri)
const SECTIONS: { id: string; link: string | null }[] = [
  { id: 'overview', link: 'overview' },
  { id: 'performance', link: 'performance' },
  { id: 'features', link: 'performance' },
  { id: 'camera', link: 'camera' },
  { id: 's-pen', link: 's-pen' },
  { id: 'colors', link: 'colors' },
  { id: 'galaxy-ai', link: null },
  { id: 'compare', link: 'compare' },
  { id: 'specs', link: 'specs' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>('overview');

  // Hangi bölümde olduğunu bul (ekranın ortasını geçen son bölüm)
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const line = window.innerHeight * 0.5;
      let current: string | null = null;
      for (const s of SECTIONS) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= line) current = s.link;
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

  const go = (e: React.MouseEvent, id: string, offset = 0) => {
    e.preventDefault();
    setOpen(false);
    scrollToId(id, offset);
  };

  return (
    <header className="fixed top-0 inset-x-0 z-50 h-16 px-5 md:px-12 flex items-center justify-between bg-black/85 border-b border-white/10">
      <a
        href="#overview"
        onClick={(e) => go(e, 'overview')}
        className="text-base md:text-lg font-semibold tracking-[0.3em] md:tracking-[0.35em]"
      >
        SAMSUNG
      </a>

      <nav className="hidden lg:flex gap-8 xl:gap-10 text-sm">
        {LINKS.map((l) => (
          <a
            key={l.id}
            href={`#${l.id}`}
            onClick={(e) => go(e, l.id, l.offset)}
            className={`relative py-1 transition-colors ${
              active === l.id ? 'text-white' : 'text-white/60 hover:text-white'
            }`}
          >
            {l.label}
            <span
              className={`absolute left-0 -bottom-0.5 h-px bg-white transition-all duration-300 ${
                active === l.id ? 'w-full opacity-100' : 'w-0 opacity-0'
              }`}
            />
          </a>
        ))}
      </nav>

      <div className="flex items-center gap-3">
        <a href="#specs" onClick={(e) => go(e, 'specs')} className="sg-btn !py-2 !px-4 md:!px-5 !text-sm">
          Buy now
        </a>

        <button
          aria-label="Menu"
          onClick={() => setOpen((o) => !o)}
          className="lg:hidden w-9 h-9 flex flex-col items-center justify-center gap-[5px]"
        >
          <span className={`w-5 h-px bg-white transition-transform ${open ? 'translate-y-[3px] rotate-45' : ''}`} />
          <span className={`w-5 h-px bg-white transition-transform ${open ? '-translate-y-[3px] -rotate-45' : ''}`} />
        </button>
      </div>

      {open && (
        <nav className="lg:hidden absolute top-16 inset-x-0 bg-black/95 border-b border-white/10 flex flex-col px-5 py-2">
          {LINKS.map((l) => (
            <a
              key={l.id}
              href={`#${l.id}`}
              onClick={(e) => go(e, l.id, l.offset)}
              className={`py-4 text-lg font-light border-b border-white/5 last:border-0 ${
                active === l.id ? 'text-white' : 'text-white/60'
              }`}
            >
              {l.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}