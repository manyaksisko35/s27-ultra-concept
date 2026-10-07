import type Lenis from 'lenis';

let instance: Lenis | null = null;

export function setLenis(l: Lenis | null) {
  instance = l;
}

// offsetVh: bölümün başından itibaren kaç ekran yüksekliği aşağı kaydırılacağı
export function scrollToId(id: string, offsetVh = 0) {
  const el = document.getElementById(id);
  if (!el) return;

  const target = el.getBoundingClientRect().top + window.scrollY + window.innerHeight * offsetVh;
  const dist = Math.abs(target - window.scrollY);
  // Uzak mesafede süre uzar, telefon animasyonu hızlı sarmasın
  const duration = Math.min(2.6, Math.max(1.1, 0.9 + dist / (window.innerHeight * 6)));

  if (instance) {
    instance.scrollTo(target, { duration });
  } else {
    window.scrollTo({ top: target, behavior: 'smooth' });
  }
}