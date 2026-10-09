'use client';

import { useEffect } from 'react';

// Başlık animasyonu: tüm bölüm başlıkları (h2.sg-title) ekrana girince bulanıktan netleşerek, soldan sağa
// süpürülen bir maskeyle belirir (stil: globals.css). Başlık metnine dokunmaz; sadece data-in özniteliği ekler.
// JS yoksa ya da kullanıcı hareketi azaltmayı seçtiyse başlıklar doğrudan görünür.
export default function HeadlineReveal() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const root = document.documentElement;
    root.classList.add('reveal-ready');

    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (!e.isIntersecting) return;
          (e.target as HTMLElement).dataset.in = '1';
          io.unobserve(e.target);
        }),
      { threshold: 0.35 }
    );
    document.querySelectorAll<HTMLElement>('h2.sg-title:not([data-in])').forEach((el) => io.observe(el));
    return () => {
      io.disconnect();
      root.classList.remove('reveal-ready');
    };
  }, []);
  return null;
}
