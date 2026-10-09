'use client';

import { useState } from 'react';
import { scrollToId } from '@/lib/lenis';
import { GROUPS, sectionById, useActiveSection } from '@/lib/sections';

// Üst menü: bölümler gruplanır (Camera, Features açılır menü). Bölüm listesi lib/sections.ts'te.
export default function Navbar() {
  const [open, setOpen] = useState(false);
  const activeId = useActiveSection();
  const activeGroup = sectionById(activeId)?.group;

  const go = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setOpen(false);
    scrollToId(id, sectionById(id)?.offset ?? 0);
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

      <nav className="hidden lg:flex gap-7 xl:gap-9 text-sm h-full">
        {GROUPS.map((g) => {
          const isActive = activeGroup === g.name;
          const first = g.items[0];
          const multi = g.items.length > 1;
          return (
            <div key={g.name} className="relative group/nav h-full flex items-center">
              <a
                href={`#${first.id}`}
                onClick={(e) => go(e, first.id)}
                className={`relative py-1 flex items-center gap-1 transition-colors ${
                  isActive ? 'text-white' : 'text-white/60 hover:text-white'
                }`}
              >
                {g.name}
                {multi && (
                  <svg width="9" height="9" viewBox="0 0 10 10" className="opacity-60 transition-transform group-hover/nav:rotate-180">
                    <path d="M1 3l4 4 4-4" stroke="currentColor" strokeWidth="1.4" fill="none" />
                  </svg>
                )}
                <span
                  className={`absolute left-0 -bottom-0.5 h-px bg-white transition-all duration-300 ${
                    isActive ? 'w-full opacity-100' : 'w-0 opacity-0'
                  }`}
                />
              </a>

              {/* Açılır menü (üstüne gelince) */}
              {multi && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-1 opacity-0 invisible translate-y-1 group-hover/nav:opacity-100 group-hover/nav:visible group-hover/nav:translate-y-0 transition-all duration-200">
                  <div className="min-w-48 rounded-2xl border border-white/10 bg-[#0b0b0d] p-2 shadow-2xl">
                    {g.items.map((s) => (
                      <a
                        key={s.id}
                        href={`#${s.id}`}
                        onClick={(e) => go(e, s.id)}
                        className={`block rounded-xl px-4 py-2.5 whitespace-nowrap transition-colors ${
                          activeId === s.id ? 'bg-white/10 text-white' : 'text-white/65 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        {s.label}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="flex items-center gap-3">
        <a href="#build" onClick={(e) => go(e, 'build')} className="sg-btn !py-2 !px-4 md:!px-5 !text-sm">
          Buy now
        </a>

        <button
          aria-label="Menu"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="lg:hidden w-9 h-9 flex flex-col items-center justify-center gap-[5px]"
        >
          <span className={`w-5 h-px bg-white transition-transform ${open ? 'translate-y-[3px] rotate-45' : ''}`} />
          <span className={`w-5 h-px bg-white transition-transform ${open ? '-translate-y-[3px] -rotate-45' : ''}`} />
        </button>
      </div>

      {/* Mobil menü: gruplar başlık, alt bölümler girintili */}
      {open && (
        <nav className="lg:hidden absolute top-16 inset-x-0 max-h-[calc(100svh-4rem)] overflow-y-auto bg-black/95 border-b border-white/10 flex flex-col px-5 py-2">
          {GROUPS.map((g) => (
            <div key={g.name} className="border-b border-white/5 last:border-0 py-1">
              {g.items.length > 1 ? (
                <>
                  <p className={`pt-3 pb-1 sg-eyebrow !text-[0.65rem] ${activeGroup === g.name ? '!text-white' : ''}`}>{g.name}</p>
                  {g.items.map((s) => (
                    <a
                      key={s.id}
                      href={`#${s.id}`}
                      onClick={(e) => go(e, s.id)}
                      className={`block py-2.5 pl-3 text-base font-light ${activeId === s.id ? 'text-white' : 'text-white/60'}`}
                    >
                      {s.label}
                    </a>
                  ))}
                </>
              ) : (
                <a
                  href={`#${g.items[0].id}`}
                  onClick={(e) => go(e, g.items[0].id)}
                  className={`block py-3 text-lg font-light ${activeGroup === g.name ? 'text-white' : 'text-white/60'}`}
                >
                  {g.name}
                </a>
              )}
            </div>
          ))}
        </nav>
      )}
    </header>
  );
}
