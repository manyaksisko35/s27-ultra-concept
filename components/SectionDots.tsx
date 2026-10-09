'use client';

import { scrollToId } from '@/lib/lenis';
import { SECTIONS, useActiveSection } from '@/lib/sections';

// Sağ kenarda bölüm noktaları: hangi bölümde olduğunu gösterir, tıklayınca o bölüme gider.
// Üstüne gelince bölüm adı solda belirir. Masaüstü ve tablette görünür (mobilde ekranı kalabalıklaştırmasın).
export default function SectionDots() {
  const active = useActiveSection();

  return (
    <nav aria-label="Sections" className="hidden md:flex fixed right-4 lg:right-6 top-1/2 -translate-y-1/2 z-40 flex-col items-end gap-2.5">
      {SECTIONS.map((s) => {
        const isActive = s.id === active;
        return (
          <a
            key={s.id}
            href={`#${s.id}`}
            aria-label={s.label}
            aria-current={isActive ? 'true' : undefined}
            onClick={(e) => {
              e.preventDefault();
              scrollToId(s.id, s.offset ?? 0);
            }}
            className="group/dot relative flex items-center justify-end h-3 w-8"
          >
            <span className="pointer-events-none absolute right-6 whitespace-nowrap rounded-full bg-black/85 border border-white/10 px-3 py-1 text-xs opacity-0 translate-x-1 transition-all duration-200 group-hover/dot:opacity-100 group-hover/dot:translate-x-0">
              {s.label}
            </span>
            <span
              className={`block rounded-full transition-all duration-300 ${
                isActive
                  ? 'w-1.5 h-5 bg-gradient-to-b from-cyan-300 to-violet-400'
                  : 'w-1.5 h-1.5 bg-white/30 group-hover/dot:bg-white/80'
              }`}
            />
          </a>
        );
      })}
    </nav>
  );
}
