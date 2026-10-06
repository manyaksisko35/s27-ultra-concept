'use client';

import { useProgress } from '@react-three/drei';
import { useEffect, useState } from 'react';

export default function Loader() {
  const { progress, active } = useProgress();
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!active && progress === 100) {
      const t = setTimeout(() => setDone(true), 400);
      return () => clearTimeout(t);
    }
  }, [active, progress]);

  return (
    <div
      className={`fixed inset-0 z-[100] bg-[#030303] flex flex-col items-center justify-center transition-opacity duration-700 ${
        done ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <span className="text-lg font-semibold tracking-[0.5em] mb-10">SAMSUNG</span>
      <p className="sg-title text-7xl tabular-nums">
        {Math.round(progress)}
        <span className="text-2xl text-white/40">%</span>
      </p>
      <div className="mt-8 w-48 h-px bg-white/10 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-cyan-400 to-violet-400 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}