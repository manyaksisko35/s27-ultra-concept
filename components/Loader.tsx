'use client';

import { useProgress } from '@react-three/drei';
import { useEffect, useState } from 'react';

// Yükleme ekranı: telefonun arka silüeti (gövde, kameralar) yükleme yüzdesine göre çizgiyle çizilir.
// Bitince içi dolar, ardından ekran yavaşça kaybolur.
const LENSES = [
  { cx: 30, cy: 34 },
  { cx: 30, cy: 62 },
  { cx: 30, cy: 90 },
];

export default function Loader() {
  const { progress, active } = useProgress();
  const [complete, setComplete] = useState(false); // çizim bitti, içi doluyor
  const [done, setDone] = useState(false); // ekran kayboluyor

  useEffect(() => {
    if (!active && progress === 100) {
      const t1 = setTimeout(() => setComplete(true), 150);
      const t2 = setTimeout(() => setDone(true), 1100);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [active, progress]);

  const p = progress / 100;
  // Her parça kendi sırasında çizilir: önce gövde, sonra kameralar, en son flaş
  const part = (start: number, end: number) => Math.min(1, Math.max(0, (p - start) / (end - start)));
  const stroke = (t: number) => ({ strokeDasharray: 1, strokeDashoffset: 1 - t, transition: 'stroke-dashoffset 0.35s ease-out' });

  return (
    <div
      className={`fixed inset-0 z-[100] bg-[#030303] flex flex-col items-center justify-center transition-opacity duration-700 ${
        done ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      aria-busy={!complete}
      aria-label="Loading"
    >
      <svg viewBox="0 0 100 200" className="h-[34svh] max-h-80 mb-8 overflow-visible">
        <defs>
          <linearGradient id="ld-stroke" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#67e8f9" />
            <stop offset="1" stopColor="#a78bfa" />
          </linearGradient>
          <linearGradient id="ld-fill" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#1b2533" />
            <stop offset="1" stopColor="#0d1118" />
          </linearGradient>
        </defs>

        {/* Soluk taslak: yükleme başında da silüet görünsün, renkli çizgi bunun üstünden ilerler */}
        <g fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1">
          <rect x="4" y="4" width="92" height="192" rx="12" />
          {LENSES.map((l, i) => (
            <circle key={i} cx={l.cx} cy={l.cy} r="10.5" />
          ))}
          <circle cx="50" cy="34" r="3" />
          <circle cx="50" cy="52" r="2.2" />
        </g>

        {/* Gövde */}
        <rect
          x="4" y="4" width="92" height="192" rx="12"
          pathLength={1}
          fill={complete ? 'url(#ld-fill)' : 'transparent'}
          stroke="url(#ld-stroke)" strokeWidth="1.2"
          style={{ ...stroke(part(0, 0.6)), transition: 'stroke-dashoffset 0.35s ease-out, fill 0.6s ease' }}
        />
        {/* Kameralar */}
        {LENSES.map((l, i) => (
          <g key={i}>
            <circle cx={l.cx} cy={l.cy} r="10.5" pathLength={1} fill="none" stroke="url(#ld-stroke)" strokeWidth="1.1" style={stroke(part(0.55 + i * 0.1, 0.7 + i * 0.1))} />
            <circle
              cx={l.cx} cy={l.cy} r="5"
              fill="#05070b"
              style={{ opacity: complete ? 1 : 0, transition: `opacity 0.4s ease ${0.1 * i}s` }}
            />
          </g>
        ))}
        {/* Flaş ve lazer AF */}
        <circle cx="50" cy="34" r="3" pathLength={1} fill="none" stroke="url(#ld-stroke)" strokeWidth="1" style={stroke(part(0.88, 0.95))} />
        <circle cx="50" cy="52" r="2.2" pathLength={1} fill="none" stroke="url(#ld-stroke)" strokeWidth="1" style={stroke(part(0.92, 1))} />
        {/* Logo */}
        <text
          x="50" y="168" textAnchor="middle" fontSize="6.5" letterSpacing="2.4" fill="#fff"
          style={{ opacity: complete ? 0.7 : 0, transition: 'opacity 0.6s ease 0.2s' }}
        >
          SAMSUNG
        </text>
      </svg>

      <p className="text-sm tracking-[0.4em] text-white/50 tabular-nums">
        {complete ? 'GALAXY S26 ULTRA' : `${Math.round(progress)}%`}
      </p>
    </div>
  );
}
