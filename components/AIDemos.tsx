'use client';

import { useEffect, useRef, useState } from 'react';
import { playSound } from '@/lib/sound';

// Galaxy AI canlı demoları: üç sekme (Live Translate, Circle to Search, Photo Assist). Ekrandayken sırayla
// kendiliğinden oynar; sekmeye tıklanınca o demo baştan başlar. Sadece CSS geçişleri ve SVG (3D yok).

const DEMOS = [
  { id: 'translate', title: 'Live Translate', caption: 'Real-time translation of calls and conversations, on device.', steps: 6 },
  { id: 'circle', title: 'Circle to Search', caption: 'Circle anything on screen to search it instantly.', steps: 4 },
  { id: 'photo', title: 'Photo Assist', caption: 'Describe the edit in your own words and Galaxy AI does it.', steps: 5 },
] as const;

const STEP_MS = 1100; // her adım arası
const HOLD_STEPS = 3; // demo bitince bekleme (adım cinsinden)

// Yazılıyormuş gibi beliren metin (görünür olunca). Uzun metin alt satıra kayabilir.
function Typed({ text, show }: { text: string; show: boolean }) {
  return (
    <span className="relative block">
      <span className="invisible">{text}</span>
      <span
        className="absolute inset-0 transition-[clip-path] duration-700 ease-out"
        style={{ clipPath: show ? 'inset(0 0 0 0)' : 'inset(0 100% 0 0)' }}
      >
        {text}
      </span>
    </span>
  );
}

function Bubble({ mine, show, text, translation, showT }: { mine?: boolean; show: boolean; text: string; translation: string; showT: boolean }) {
  return (
    <div
      className={`max-w-[85%] rounded-2xl px-4 py-2.5 transition-all duration-500 ${
        mine ? 'self-end rounded-br-sm bg-cyan-400/90 text-black' : 'self-start rounded-bl-sm bg-white/12'
      } ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}
    >
      <p className="text-sm lg:text-base font-medium">{text}</p>
      <p className={`text-xs lg:text-sm italic ${mine ? 'text-black/60' : 'text-white/55'}`}>
        <Typed text={translation} show={showT} />
      </p>
    </div>
  );
}

function TranslateDemo({ step }: { step: number }) {
  return (
    <div className="h-full flex flex-col gap-3 justify-center px-4 lg:px-10">
      <div className="flex items-center justify-between text-xs text-white/50 mb-1">
        <span>Türkçe</span>
        <span className="text-cyan-300">● Live Translate</span>
        <span>English</span>
      </div>
      <Bubble show={step >= 1} showT={step >= 2} text="Merhaba, bu akşam iki kişilik masa ayırtabilir miyim?" translation="Hi, can I book a table for two tonight?" />
      <Bubble mine show={step >= 3} showT={step >= 4} text="Of course! Is 8 pm okay for you?" translation="Tabii ki! Saat 20.00 uygun mu?" />
      <Bubble show={step >= 5} showT={step >= 6} text="Harika, teşekkürler!" translation="Great, thank you!" />
    </div>
  );
}

function CircleDemo({ step }: { step: number }) {
  return (
    <div className="relative h-full">
      <svg viewBox="0 0 400 300" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
        <rect width="400" height="300" fill="#e9dccb" />
        <rect y="200" width="400" height="100" fill="#cbb79e" />
        {/* masa üstünde güneş gözlüğü ve kahve */}
        <rect x="250" y="150" width="46" height="56" rx="6" fill="#f5f1ea" />
        <rect x="296" y="164" width="12" height="22" rx="6" fill="none" stroke="#f5f1ea" strokeWidth="5" />
        <ellipse cx="273" cy="152" rx="23" ry="5" fill="#6b4226" />
        <g transform="translate(110 178)">
          <ellipse cx="0" cy="0" rx="30" ry="21" fill="#1b2433" />
          <ellipse cx="72" cy="0" rx="30" ry="21" fill="#1b2433" />
          <path d="M28 -4 Q36 -12 44 -4" stroke="#b08d57" strokeWidth="4" fill="none" />
          <path d="M-30 -6 L-52 -14 M102 -6 L124 -14" stroke="#b08d57" strokeWidth="4" />
          <ellipse cx="-8" cy="-7" rx="10" ry="5" fill="#ffffff" opacity="0.25" />
          <ellipse cx="64" cy="-7" rx="10" ry="5" fill="#ffffff" opacity="0.25" />
        </g>
        {/* parmakla çizilen daire */}
        <path
          d="M95 150 C 60 152, 52 205, 110 214 C 170 222, 226 214, 228 184 C 230 150, 170 140, 120 146"
          fill="none"
          stroke="#ffffff"
          strokeWidth="5"
          strokeLinecap="round"
          pathLength={1}
          style={{ strokeDasharray: 1, strokeDashoffset: step >= 1 ? 0 : 1, transition: 'stroke-dashoffset 0.9s ease-in-out' }}
        />
      </svg>
      {/* Sonuç kartı */}
      <div
        className={`absolute inset-x-3 lg:inset-x-8 bottom-3 rounded-2xl bg-[#111318] border border-white/10 p-4 transition-all duration-500 ${
          step >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
      >
        <p className="text-xs text-white/50 mb-1">Search results</p>
        <p className="font-semibold">Aviator sunglasses, gold frame</p>
        <div className={`mt-2 flex gap-2 transition-opacity duration-500 ${step >= 3 ? 'opacity-100' : 'opacity-0'}`}>
          {['Shop · 24 results', 'Similar styles', 'How to clean'].map((t) => (
            <span key={t} className="rounded-full bg-white/10 px-3 py-1 text-xs">
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function PhotoDemo({ step }: { step: number }) {
  const erased = step >= 3;
  return (
    <div className="relative h-full">
      <svg viewBox="0 0 400 300" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="pa-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#7fb6e8" />
            <stop offset="1" stopColor="#d9ecf7" />
          </linearGradient>
        </defs>
        <rect width="400" height="300" fill="url(#pa-sky)" />
        <path d="M0 190 L90 120 L170 175 L250 105 L400 190 L400 300 L0 300 Z" fill="#5d7f6a" />
        <rect y="230" width="400" height="70" fill="#d8c79a" />
        {/* plajdaki kişi (fotoğrafın konusu) */}
        <g transform="translate(120 175)">
          <circle cx="0" cy="0" r="10" fill="#7a4a32" />
          <rect x="-9" y="10" width="18" height="34" rx="6" fill="#e2574c" />
          <rect x="-8" y="44" width="7" height="22" fill="#2f3a4b" />
          <rect x="1" y="44" width="7" height="22" fill="#2f3a4b" />
        </g>
        {/* silinecek nesne: çöp kutusu */}
        <g
          transform="translate(280 205)"
          style={{ opacity: erased ? 0 : 1, transition: 'opacity 0.8s ease', filter: erased ? 'blur(6px)' : 'none' }}
        >
          <rect x="-16" y="0" width="32" height="40" rx="3" fill="#3d4450" />
          <rect x="-19" y="-5" width="38" height="7" rx="2" fill="#2b3038" />
        </g>
        {/* seçim çerçevesi ve ışıltı */}
        <rect
          x="256" y="192" width="48" height="58" rx="8" fill="none" stroke="#fff" strokeWidth="2" strokeDasharray="6 5"
          style={{ opacity: step >= 2 && !erased ? 1 : 0, transition: 'opacity 0.3s' }}
        />
        {[
          [262, 196],
          [298, 210],
          [270, 238],
          [292, 244],
        ].map(([x, y], i) => (
          <path
            key={i}
            d={`M${x} ${y - 7} L${x + 2} ${y - 2} L${x + 7} ${y} L${x + 2} ${y + 2} L${x} ${y + 7} L${x - 2} ${y + 2} L${x - 7} ${y} L${x - 2} ${y - 2} Z`}
            fill="#fff"
            style={{ opacity: step === 3 ? 1 : 0, transition: `opacity 0.4s ease ${i * 0.08}s` }}
          />
        ))}
      </svg>
      {/* Komut kutusu */}
      <div className="absolute inset-x-3 lg:inset-x-8 bottom-3 rounded-full bg-[#111318]/90 border border-white/10 px-4 py-2.5 flex items-center gap-3">
        <span className="sg-ai text-sm font-semibold">✦</span>
        <span className="text-sm flex-1">
          <Typed text="Remove the trash can" show={step >= 1} />
        </span>
        <span className={`text-xs transition-opacity ${step >= 4 ? 'opacity-100 text-cyan-300' : 'opacity-0'}`}>Done</span>
      </div>
    </div>
  );
}

export default function AIDemos() {
  const [demo, setDemo] = useState(0);
  const [step, setStep] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  // Sadece ekrandayken oynar
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const t = window.setTimeout(() => {
      if (step < DEMOS[demo].steps + HOLD_STEPS) setStep((s) => s + 1);
      else {
        setDemo((d) => (d + 1) % DEMOS.length);
        setStep(0);
      }
    }, step === 0 ? 500 : STEP_MS);
    return () => window.clearTimeout(t);
  }, [visible, demo, step]);

  const pick = (i: number) => {
    playSound('tick');
    setDemo(i);
    setStep(0);
  };

  const d = DEMOS[demo];
  return (
    <div ref={boxRef} className="relative max-w-6xl mb-10 lg:mb-14">
      <div className="flex gap-2 mb-4 overflow-x-auto" role="tablist">
        {DEMOS.map((x, i) => (
          <button
            key={x.id}
            role="tab"
            aria-selected={i === demo}
            onClick={() => pick(i)}
            className={`relative shrink-0 rounded-full px-4 py-2 text-sm transition-colors overflow-hidden ${
              i === demo ? 'bg-white text-black font-semibold' : 'bg-white/8 text-white/70 hover:text-white'
            }`}
          >
            {x.title}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-4 lg:gap-8 items-center">
        <div className="relative h-[300px] lg:h-[380px] rounded-[28px] overflow-hidden border border-white/10 bg-[#0b0d12]">
          {demo === 0 && <TranslateDemo step={step} />}
          {demo === 1 && <CircleDemo step={step} />}
          {demo === 2 && <PhotoDemo step={step} />}
        </div>
        <div>
          <h3 className="text-3xl lg:text-5xl font-semibold mb-3">{d.title}</h3>
          <p className="text-white/55 text-lg font-light mb-5">{d.caption}</p>
          {/* Demo ilerleme çubuğu */}
          <div className="h-0.5 w-40 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-300 to-violet-400 transition-[width] duration-700"
              style={{ width: `${Math.min(100, (step / (d.steps + HOLD_STEPS)) * 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
