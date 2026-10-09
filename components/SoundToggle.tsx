'use client';

import { useEffect, useRef, useSyncExternalStore } from 'react';
import { isSoundOn, isSoundOnServer, playSound, setSoundOn, subscribeSound } from '@/lib/sound';
import { useActiveSection } from '@/lib/sections';

// Sol altta ses aç/kapa düğmesi (varsayılan kapalı) + bölüme bağlı ses ipuçları (S Pen bölümüne girince "klik").
export default function SoundToggle() {
  const on = useSyncExternalStore(subscribeSound, isSoundOn, isSoundOnServer);
  const active = useActiveSection();
  const prev = useRef(active);

  useEffect(() => {
    if (active === 's-pen' && prev.current !== 's-pen') playSound('pen');
    prev.current = active;
  }, [active]);

  return (
    <button
      onClick={() => {
        setSoundOn(!on);
        if (!on) playSound('tick');
      }}
      aria-pressed={on}
      aria-label={on ? 'Sound on' : 'Sound off'}
      title={on ? 'Sound on' : 'Sound off'}
      className="fixed left-4 bottom-4 lg:left-6 lg:bottom-6 z-40 w-10 h-10 rounded-full border border-white/15 bg-black/75 flex items-center justify-center text-white/80 hover:text-white hover:border-white/40 transition-colors"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
        <path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" stroke="none" />
        {on ? (
          <>
            <path d="M16 9.5a3.5 3.5 0 010 5" />
            <path d="M18.5 7a7 7 0 010 10" />
          </>
        ) : (
          <path d="M16 9l5 6M21 9l-5 6" />
        )}
      </svg>
    </button>
  );
}
