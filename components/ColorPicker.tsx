'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { PHONE_COLORS, getColorId, getServerColorId, setColorId, subscribeColor } from '@/lib/phoneColor';

type Props = {
  // inline: Hero içinde, floating: sayfa boyunca altta yüzen küçük çubuk (sadece masaüstü)
  variant?: 'inline' | 'floating';
};

export default function ColorPicker({ variant = 'inline' }: Props) {
  const activeId = useSyncExternalStore(subscribeColor, getColorId, getServerColorId);
  const active = PHONE_COLORS.find((c) => c.id === activeId) ?? PHONE_COLORS[0];

  // Yüzen çubuk: hero'dan çıkınca görünür, animasyonlu bölümler bitince kaybolur
  const [visible, setVisible] = useState(variant === 'inline');
  useEffect(() => {
    if (variant !== 'floating') return;
    const update = () => {
      const main = document.getElementById('main-scroll-container');
      if (!main) return;
      const bottom = main.getBoundingClientRect().bottom;
      setVisible(window.scrollY > window.innerHeight * 0.7 && bottom > window.innerHeight * 0.9);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [variant]);

  const wrapper =
    variant === 'floating'
      ? `hidden md:flex fixed bottom-6 left-1/2 -translate-x-1/2 z-40 transition-opacity duration-500 ${
          visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`
      : 'flex pointer-events-auto';

  return (
    <div
      role="radiogroup"
      aria-label="Phone color"
      className={`${wrapper} items-center gap-4 rounded-full border border-white/10 bg-black/75 px-4 py-2.5`}
    >
      <div className="flex items-center gap-2.5">
        {PHONE_COLORS.map((c) => {
          const selected = c.id === activeId;
          return (
            <button
              key={c.id}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={c.name}
              title={c.name}
              onClick={() => setColorId(c.id)}
              className={`w-6 h-6 rounded-full border border-white/25 transition-transform duration-200 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                selected ? 'ring-2 ring-white ring-offset-2 ring-offset-black scale-105' : ''
              }`}
              style={{ background: c.swatch }}
            />
          );
        })}
      </div>
      <span className="sg-eyebrow !text-[0.65rem] min-w-[5.5rem] text-left text-white/70">{active.name}</span>
    </div>
  );
}