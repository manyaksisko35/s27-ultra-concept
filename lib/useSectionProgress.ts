import { useEffect, useRef, type RefObject } from 'react';

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const smooth = (v: number) => {
  const t = clamp01(v);
  return t * t * (3 - 2 * t);
};

// Sabitlenen (sticky) bir bölümün scroll ilerlemesini (0-1) verir: 0 = bölüm ekranı doldurdu, 1 = sabit kısım bitti.
// onProgress karede en fazla bir kez, sadece değer değişince çağrılır; DOM'a doğrudan yazmak içindir (state yok).
export function useSectionProgress(ref: RefObject<HTMLElement | null>, onProgress: (p: number) => void) {
  const cb = useRef(onProgress);
  useEffect(() => {
    cb.current = onProgress;
  });

  useEffect(() => {
    let raf = 0;
    let last = -1;
    const update = () => {
      raf = 0;
      const el = ref.current;
      if (!el) return;
      const p = clamp01(-el.getBoundingClientRect().top / Math.max(1, el.offsetHeight - window.innerHeight));
      if (p === last) return;
      last = p;
      cb.current(p);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const onResize = () => {
      last = -1;
      onScroll();
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [ref]);
}
