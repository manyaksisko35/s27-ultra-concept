// Ses tasarımı: tüm sesler Web Audio ile anında sentezlenir (dosya indirilmez). Varsayılan KAPALI;
// kullanıcı açarsa tercihi hatırlanır. Ses motoru ilk kullanıcı etkileşiminde başlatılır (tarayıcı kuralı).
export type SoundName = 'tick' | 'shutter' | 'pen' | 'chime';

const KEY = 's27-sound';
let ctx: AudioContext | null = null;
let enabled = false;
const listeners = new Set<() => void>();
const lastPlayed: Partial<Record<SoundName, number>> = {};

// Kaydedilmiş tercih (localStorage engelliyse sessizce varsayılana döner)
if (typeof window !== 'undefined') {
  try {
    enabled = window.localStorage.getItem(KEY) === 'on';
  } catch {
    enabled = false;
  }
}

function ensureCtx() {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

// Tercih "açık" kayıtlıysa, ses motoru ilk dokunuş/tıklamada hazırlanır
if (typeof window !== 'undefined') {
  const prime = () => enabled && ensureCtx();
  window.addEventListener('pointerdown', prime, { once: true, passive: true });
  window.addEventListener('keydown', prime, { once: true });
}

export const isSoundOn = () => enabled;
export const isSoundOnServer = () => false;
export const subscribeSound = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};
export function setSoundOn(on: boolean) {
  enabled = on;
  try {
    window.localStorage.setItem(KEY, on ? 'on' : 'off');
  } catch {
    // depolama yoksa sadece bu oturum için geçerli
  }
  if (on) ensureCtx();
  listeners.forEach((l) => l());
}

// Kısa ton (zarf: hızlı atak, üstel sönüm)
function tone(c: AudioContext, t: number, freq: number, dur: number, gain: number, type: OscillatorType = 'sine') {
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(c.destination);
  o.start(t);
  o.stop(t + dur + 0.02);
}

// Filtrelenmiş gürültü patlaması (deklanşör / mekanik tık)
function noise(c: AudioContext, t: number, dur: number, gain: number, freq: number) {
  const len = Math.max(1, Math.floor(c.sampleRate * dur));
  const buf = c.createBuffer(1, len, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 2;
  const src = c.createBufferSource();
  src.buffer = buf;
  const f = c.createBiquadFilter();
  f.type = 'bandpass';
  f.frequency.value = freq;
  f.Q.value = 1.2;
  const g = c.createGain();
  g.gain.value = gain;
  src.connect(f).connect(g).connect(c.destination);
  src.start(t);
}

export function playSound(name: SoundName) {
  if (!enabled) return;
  const c = ensureCtx();
  if (!c) return;
  // Aynı ses art arda çok hızlı çalmasın (ör. hızlı scroll'da zoom durakları)
  const now = performance.now();
  if (now - (lastPlayed[name] ?? 0) < 90) return;
  lastPlayed[name] = now;

  const t = c.currentTime + 0.01;
  switch (name) {
    case 'tick':
      tone(c, t, 1750, 0.05, 0.05);
      break;
    case 'shutter': // iki parçalı mekanik deklanşör
      noise(c, t, 0.05, 0.5, 2600);
      noise(c, t + 0.07, 0.07, 0.35, 1800);
      break;
    case 'pen': // S Pen yuvadan çıkış "klik"i
      tone(c, t, 3200, 0.025, 0.06, 'triangle');
      noise(c, t, 0.02, 0.25, 5000);
      tone(c, t + 0.07, 2400, 0.03, 0.05, 'triangle');
      break;
    case 'chime': // şarj tamam: yükselen arpej
      [1046.5, 1318.5, 1568, 2093].forEach((f, i) => tone(c, t + i * 0.09, f, 0.45, 0.045));
      break;
  }
}
