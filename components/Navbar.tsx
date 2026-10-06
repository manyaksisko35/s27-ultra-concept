'use client';

import { useState } from 'react';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const links = ['Overview', 'Performance', 'Camera', 'Specs'];

  return (
    <header className="fixed top-0 inset-x-0 z-50 h-16 px-5 md:px-12 flex items-center justify-between bg-black/40 backdrop-blur-xl border-b border-white/10">
      <span className="text-base md:text-lg font-semibold tracking-[0.3em] md:tracking-[0.35em]">SAMSUNG</span>

      <nav className="hidden md:flex gap-10 text-sm text-white/65">
        {links.map((l) => (
          <a key={l} href={l === 'Specs' ? '#specs' : '#'} className="hover:text-white transition-colors">
            {l}
          </a>
        ))}
      </nav>

      <div className="flex items-center gap-3">
        <a href="#specs" className="sg-btn !py-2 !px-4 md:!px-5 !text-sm">Buy now</a>

        <button
          aria-label="Menu"
          onClick={() => setOpen((o) => !o)}
          className="md:hidden w-9 h-9 flex flex-col items-center justify-center gap-[5px]"
        >
          <span className={`w-5 h-px bg-white transition-transform ${open ? 'translate-y-[3px] rotate-45' : ''}`} />
          <span className={`w-5 h-px bg-white transition-transform ${open ? '-translate-y-[3px] -rotate-45' : ''}`} />
        </button>
      </div>

      {open && (
        <nav className="md:hidden absolute top-16 inset-x-0 bg-black/90 backdrop-blur-xl border-b border-white/10 flex flex-col px-5 py-4">
          {links.map((l) => (
            <a
              key={l}
              href={l === 'Specs' ? '#specs' : '#'}
              onClick={() => setOpen(false)}
              className="py-4 text-lg font-light text-white/80 border-b border-white/5 last:border-0"
            >
              {l}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}