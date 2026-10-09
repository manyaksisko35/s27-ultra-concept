'use client';

import { Suspense, useRef, useState } from 'react';
import { View } from '@react-three/drei';
import { BuildPhone, type BuildState } from '@/components/SectionPhones';
import { PHONE_COLORS } from '@/lib/phoneColor';
import { requestFrame } from '@/lib/sectionCanvas';
import { playSound } from '@/lib/sound';
import ARViewer from '@/components/ARViewer';

// Build your Ultra: renk ve depolama seçilir, 3D telefon anında o renge boyanır (sürükleyerek çevrilebilir),
// RAM ve fiyat güncellenir. Fiyatlar: Samsung US kilitsiz model liste fiyatları (kampanyasız).
const STORAGE = [
  { id: '256', label: '256GB', ram: '12GB', price: 1399.99 },
  { id: '512', label: '512GB', ram: '12GB', price: 1599.99 },
  { id: '1tb', label: '1TB', ram: '16GB', price: 1999.99 },
];
const usd = (v: number) => v.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

export default function BuildSection() {
  const [colorId, setColorId] = useState('sky-blue');
  const [storageId, setStorageId] = useState('512');
  const phoneState = useRef<BuildState>({ colorId: 'sky-blue', spin: 0, dragX: 0, dragY: 0 });
  const drag = useRef<{ x: number; y: number; dx: number; dy: number } | null>(null);

  const color = PHONE_COLORS.find((c) => c.id === colorId) ?? PHONE_COLORS[0];
  const storage = STORAGE.find((s) => s.id === storageId) ?? STORAGE[0];

  const pickColor = (id: string) => {
    if (id === colorId) return;
    setColorId(id);
    phoneState.current.colorId = id;
    phoneState.current.spin += 1; // yeni renkte telefon bir tur döner
    requestFrame();
    playSound('tick');
  };

  // Sürükleyerek çevirme (bırakınca yavaşça vitrin açısına döner)
  const onDown = (e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, dx: phoneState.current.dragX, dy: phoneState.current.dragY };
  };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    phoneState.current.dragY = d.dy + (e.clientX - d.x) * 0.012;
    phoneState.current.dragX = Math.max(-0.6, Math.min(0.6, d.dx + (e.clientY - d.y) * 0.006));
    requestFrame();
  };
  const onUp = () => {
    drag.current = null;
    phoneState.current.dragX = 0;
    // En yakın tam tura yaslanır, ani geri dönüş olmasın
    phoneState.current.dragY = Math.round(phoneState.current.dragY / (Math.PI * 2)) * Math.PI * 2;
    requestFrame();
  };

  return (
    <section id="build" className="sg-ambient amb-silver relative z-10 w-full min-h-svh bg-[#030303] px-6 lg:px-[8%] pt-24 lg:pt-32 pb-16">
      <div className="text-center mb-6 lg:mb-10">
        <p className="sg-eyebrow mb-2 lg:mb-4">Build your Ultra</p>
        <h2 className="sg-title text-4xl lg:text-7xl">
          Make it <strong className="sg-ai">yours.</strong>
        </h2>
      </div>

      <div className="flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-16 max-w-6xl mx-auto">
        {/* 3D telefon: sürükleyerek çevrilir */}
        <div
          className="relative w-full max-w-[520px] h-[46svh] lg:h-[64svh] cursor-grab active:cursor-grabbing touch-none select-none"
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
        >
          <View className="absolute inset-0">
            <Suspense fallback={null}>
              <BuildPhone state={phoneState} />
            </Suspense>
          </View>
          <p className="absolute bottom-1 inset-x-0 text-center text-xs text-white/40 pointer-events-none">Drag to rotate</p>
        </div>

        {/* Seçenekler */}
        <div className="w-full max-w-md">
          <p className="text-white/50 text-sm mb-1">Galaxy S26 Ultra</p>
          <p className="text-2xl lg:text-3xl font-semibold mb-6">
            {color.name} · {storage.label}
          </p>

          <p className="sg-eyebrow !text-[0.65rem] mb-3">Color</p>
          <div className="flex flex-wrap gap-3 mb-7">
            {PHONE_COLORS.map((c) => (
              <button
                key={c.id}
                onClick={() => pickColor(c.id)}
                aria-label={c.name}
                aria-pressed={c.id === colorId}
                className={`w-10 h-10 rounded-full border-2 transition-transform ${
                  c.id === colorId ? 'border-white scale-110' : 'border-white/15 hover:scale-105'
                }`}
                style={{ background: c.swatch }}
              />
            ))}
          </div>

          <p className="sg-eyebrow !text-[0.65rem] mb-3">Storage</p>
          <div className="grid grid-cols-3 gap-2 mb-7">
            {STORAGE.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setStorageId(s.id);
                  playSound('tick');
                }}
                aria-pressed={s.id === storageId}
                className={`rounded-2xl border px-3 py-3 text-left transition-colors ${
                  s.id === storageId ? 'border-cyan-300 bg-cyan-300/10' : 'border-white/15 hover:border-white/40'
                }`}
              >
                <span className="block font-semibold">{s.label}</span>
                <span className="block text-xs text-white/50">{s.ram} RAM</span>
              </button>
            ))}
          </div>

          <div className="flex items-end justify-between border-t border-white/10 pt-5 mb-5">
            <div>
              <p className="text-white/50 text-sm">Price</p>
              <p className="text-3xl lg:text-4xl font-light tabular-nums">{usd(storage.price)}</p>
            </div>
            <a href="#specs" className="sg-btn">
              Continue
            </a>
          </div>
          <ARViewer className="mb-5 w-full justify-center" />
          <p className="text-[0.65rem] text-white/35">
            Samsung US list price for unlocked models, before offers. Pink Gold is a Samsung.com exclusive. Prices and
            availability vary by country.
          </p>
        </div>
      </div>
    </section>
  );
}
