'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { scrollToId } from '@/lib/lenis';
import { playSound } from '@/lib/sound';

// Kamera zoom deneyimi: scroll ile 0.6x'ten 100x Space Zoom'a kadar yakınlaşılır.
// Sahne vektörel (SVG) çizilir; yakınlaşma viewBox değiştirilerek yapılır, böylece her zoomda keskin kalır
// ve tek bir öznitelik değiştiği için ucuzdur.

// Zoom durakları ve o aralıkta çalışan lens (S26 Ultra kameraları, Samsung'un ürün sayfasındaki bilgilerle)
const STOPS = [
  { zoom: 0.6, label: '0.6', lens: '50MP Ultra-wide' },
  { zoom: 1, label: '1', lens: '200MP Wide · F1.4' },
  { zoom: 3, label: '3', lens: '10MP 3x Telephoto' },
  { zoom: 5, label: '5', lens: '50MP 5x Telephoto · F2.9' },
  { zoom: 10, label: '10', lens: 'Optical quality zoom' },
  { zoom: 30, label: '30', lens: 'AI Super Resolution Zoom' },
  { zoom: 100, label: '100', lens: 'Space Zoom' },
];

// Sahne boyutu (SVG birimleri). 0.6x'te sahnenin tamamı görünür.
export const W = 1600;
export const H = 900;
const MIN_Z = STOPS[0].zoom;
// Ay: 100x'te kadrajın ~%80'ini dolduracak büyüklükte (kadraj yüksekliği 100x'te H * 0.6 / 100 = 5.4)
const MOON = { x: 1186, y: 318, r: 2.2 }; // kulenin hemen yanında: 3x-5x'te şehirle birlikte görünür
// Ay'ın yanındaki simge kule (orta zoomlarda kadrajın odağı)
const TOWER = { x: 1120, w: 46, top: 352 };

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (v: number) => {
  const t = clamp01(v);
  return t * t * (3 - 2 * t);
};

// Scroll ilerlemesi (0-1) -> zoom: duraklar arası eşit scroll payı, aralarda logaritmik geçiş
function zoomAt(p: number) {
  const seg = p * (STOPS.length - 1);
  const i = Math.min(STOPS.length - 2, Math.floor(seg));
  const f = smooth(seg - i); // her durakta kısa bir duraksama hissi
  const a = Math.log(STOPS[i].zoom);
  const b = Math.log(STOPS[i + 1].zoom);
  return Math.exp(a + (b - a) * f);
}

// Basit, sabit tohumlu rastgele sayı üreteci (sunucu ve tarayıcıda aynı sahne çıksın)
function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

export function Skyline() {
  const { buildings, stars } = useMemo(() => {
    const r = rng(27);
    const buildings: { x: number; w: number; h: number; windows: { x: number; y: number }[] }[] = [];
    let x = -10;
    while (x < W + 10) {
      const w = 40 + r() * 70;
      const h = 90 + r() * (r() > 0.85 ? 330 : 190);
      const windows: { x: number; y: number }[] = [];
      for (let wy = H - 120 - h + 14; wy < H - 130; wy += 16) {
        for (let wx = x + 8; wx < x + w - 10; wx += 13) if (r() > 0.62) windows.push({ x: wx, y: wy });
      }
      buildings.push({ x, w, h, windows });
      x += w + 2 + r() * 8;
    }
    // Simge kule: diğer binaların önünde, tepesinde anten ve kırmızı ikaz ışığı
    const tw: { x: number; y: number }[] = [];
    for (let wy = TOWER.top + 16; wy < H - 130; wy += 14)
      for (let wx = TOWER.x + 7; wx < TOWER.x + TOWER.w - 8; wx += 11) if (r() > 0.45) tw.push({ x: wx, y: wy });
    buildings.push({ x: TOWER.x, w: TOWER.w, h: H - 120 - TOWER.top, windows: tw });
    const stars = Array.from({ length: 140 }, () => ({ x: r() * W, y: r() * 430, s: 0.6 + r() * 1.4 }));
    return { buildings, stars };
  }, []);

  return (
    <>
      <defs>
        <linearGradient id="zs-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#050816" />
          <stop offset="0.55" stopColor="#0b1530" />
          <stop offset="1" stopColor="#1b2448" />
        </linearGradient>
        <radialGradient id="zs-halo">
          <stop offset="0" stopColor="#dbe7ff" stopOpacity="0.3" />
          <stop offset="1" stopColor="#dbe7ff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="zs-moon" cx="0.4" cy="0.38" r="0.7">
          <stop offset="0" stopColor="#fbf8ef" />
          <stop offset="0.7" stopColor="#d9d4c6" />
          <stop offset="1" stopColor="#a9a497" />
        </radialGradient>
        <linearGradient id="zs-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#141c38" />
          <stop offset="1" stopColor="#05070f" />
        </linearGradient>
      </defs>

      <rect width={W} height={H} fill="url(#zs-sky)" />
      {stars.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.s} fill="#fff" opacity={0.25 + (i % 5) * 0.12} />
      ))}

      {/* Ay ve kraterleri */}
      <circle cx={MOON.x} cy={MOON.y} r={MOON.r * 4} fill="url(#zs-halo)" />
      <g>
        <circle cx={MOON.x} cy={MOON.y} r={MOON.r} fill="url(#zs-moon)" />
        {[
          [-0.35, -0.3, 0.22],
          [0.28, -0.12, 0.16],
          [-0.05, 0.32, 0.26],
          [0.45, 0.35, 0.1],
          [-0.55, 0.15, 0.12],
          [0.1, -0.55, 0.09],
          [0.55, -0.45, 0.07],
        ].map(([dx, dy, cr], i) => (
          <circle
            key={i}
            cx={MOON.x + dx * MOON.r}
            cy={MOON.y + dy * MOON.r}
            r={cr * MOON.r}
            fill="#8f8a7e"
            opacity={0.45}
          />
        ))}
      </g>

      {/* Şehir silüeti ve ışıklı pencereler */}
      {buildings.map((b, i) => (
        <g key={i}>
          <rect x={b.x} y={H - 120 - b.h} width={b.w} height={b.h} fill={i % 3 ? '#0a0f1f' : '#0d1428'} />
          {b.windows.map((w, j) => (
            <rect key={j} x={w.x} y={w.y} width={6} height={8} fill={j % 7 ? '#f6d58b' : '#9fd3ff'} opacity={0.75} />
          ))}
        </g>
      ))}

      <rect x={TOWER.x + TOWER.w / 2 - 1} y={TOWER.top - 34} width={2} height={34} fill="#0d1428" />
      <circle cx={TOWER.x + TOWER.w / 2} cy={TOWER.top - 35} r={2.2} fill="#ff4d4d" />

      {/* Su ve yansımalar */}
      <rect y={H - 120} width={W} height={120} fill="url(#zs-water)" />
      {buildings
        .filter((_, i) => i % 2 === 0)
        .map((b, i) => (
          <rect key={i} x={b.x + b.w * 0.3} y={H - 112 + (i % 4) * 9} width={b.w * 0.4} height={2} fill="#f6d58b" opacity={0.18} />
        ))}
    </>
  );
}

export default function ZoomSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const readoutRef = useRef<HTMLSpanElement>(null);
  const grainRef = useRef<HTMLDivElement>(null);
  const [stop, setStop] = useState(0); // en yakın durak (buton vurgusu ve lens adı için)

  useEffect(() => {
    let raf = 0;
    let lastP = -1;
    let lastStop = -1;
    const update = () => {
      raf = 0;
      const sec = sectionRef.current;
      const svg = svgRef.current;
      if (!sec || !svg) return;
      const vh = window.innerHeight;
      const p = clamp01(-sec.getBoundingClientRect().top / Math.max(1, sec.offsetHeight - vh));
      if (p === lastP) return;
      lastP = p;

      const z = zoomAt(p);
      // Kadraj: 0.6x'te tüm sahne; yakınlaştıkça merkez Ay'a kayar (sahne dışına taşmadan)
      const vw = (W * MIN_Z) / z;
      const vhh = (H * MIN_Z) / z;
      // Ay'a doğru yakınlaşma: düşük zoomda şehir kadrajda kalır, yükseldikçe Ay ortaya gelir
      // Yatayda Ay'a yaklaşılır; dikeyde 10x'e kadar Ay kadrajın üst kısmında, altında kule ve şehir kalır
      const k = Math.pow(MIN_Z / z, 1.2);
      const below = vhh * 0.3 * (1 - smooth(Math.log(z / 10) / Math.log(10)));
      const cx = Math.min(W - vw / 2, Math.max(vw / 2, MOON.x + (W / 2 - MOON.x) * k));
      const cy = Math.min(H - vhh / 2, Math.max(vhh / 2, MOON.y + below + (H / 2 - MOON.y - below) * k));
      svg.setAttribute('viewBox', `${cx - vw / 2} ${cy - vhh / 2} ${vw} ${vhh}`);

      if (readoutRef.current) readoutRef.current.textContent = z < 10 ? z.toFixed(1) : String(Math.round(z));
      // Dijital zoom bölgesinde (10x üstü) hafif kumlanma, gerçek kamera hissi için
      if (grainRef.current) grainRef.current.style.opacity = String(clamp01((z - 10) / 60) * 0.35);

      let nearest = 0;
      STOPS.forEach((s, i) => {
        if (Math.abs(Math.log(s.zoom / z)) < Math.abs(Math.log(STOPS[nearest].zoom / z))) nearest = i;
      });
      // Yeni zoom durağına geçince deklanşör sesi (ses açıksa)
      if (nearest !== lastStop) {
        if (lastStop !== -1) playSound('shutter');
        lastStop = nearest;
      }
      setStop(nearest);
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

  // Zoom butonu: o durağın scroll konumuna gider
  const goTo = (i: number) => {
    const sec = sectionRef.current;
    if (!sec) return;
    const vh = window.innerHeight;
    const scrollable = (sec.offsetHeight - vh) / vh; // ekran cinsinden
    scrollToId('zoom', (i / (STOPS.length - 1)) * scrollable);
  };

  return (
    // 600svh: her zoom durağına yaklaşık bir ekran scroll payı
    <section ref={sectionRef} id="zoom" className="relative z-10 w-full h-[600svh] bg-[#030303]">
      <div className="sg-ambient amb-indigo sticky top-0 h-svh w-full flex flex-col items-center justify-center px-4 md:px-[8%] pt-20 pb-6 gap-5 md:gap-7">
        <div className="text-center">
          <p className="sg-eyebrow mb-2 md:mb-4">Zoom</p>
          <h2 className="sg-title text-3xl md:text-6xl">
            From wide to <strong className="sg-ai">100x Space Zoom</strong>
          </h2>
        </div>

        {/* Vizör */}
        <div className="relative w-full max-w-5xl aspect-[4/5] sm:aspect-video rounded-[28px] overflow-hidden border border-white/10 bg-black">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="xMidYMid slice"
            className="absolute inset-0 w-full h-full"
            aria-label="Night city skyline with the moon, zooming in"
          >
            <Skyline />
          </svg>

          {/* Dijital zoom kumlanması (SVG gürültü dokusu, bir kez çizilir) */}
          <div
            ref={grainRef}
            className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-0"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
            }}
          />

          {/* Kamera arayüzü: odak çerçevesi, zoom değeri, lens */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 md:w-20 md:h-20 border border-yellow-300/70 rounded-md" />
            <div className="absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/60 text-xs md:text-sm tracking-wide whitespace-nowrap">
              {STOPS[stop].lens}
            </div>
            <div className="absolute bottom-4 left-5 text-3xl md:text-5xl font-extralight tracking-tight tabular-nums">
              <span ref={readoutRef}>0.6</span>
              <span className="text-lg md:text-2xl text-white/60">x</span>
            </div>
          </div>
        </div>

        {/* Zoom butonları (kamera uygulamasındaki gibi) */}
        <div className="flex items-center gap-1.5 md:gap-2 rounded-full border border-white/10 bg-black/75 p-1.5">
          {STOPS.map((s, i) => (
            <button
              key={s.label}
              onClick={() => goTo(i)}
              aria-label={`${s.label}x zoom`}
              className={`min-w-9 h-9 md:min-w-11 md:h-11 px-1.5 rounded-full text-xs md:text-sm transition-colors ${
                i === stop ? 'bg-white text-black font-semibold' : 'text-white/70 hover:text-white'
              }`}
            >
              {s.label}
              {i === stop ? 'x' : ''}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
