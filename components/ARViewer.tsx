"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { playSound } from "@/lib/sound";

// "View in your room": Galaxy S26 Ultra'yı gerçek boyutunda (163.6 mm) artırılmış gerçeklikte gösterir.
// Android: Scene Viewer / WebXR, iPhone: Quick Look (USDZ'yi model-viewer anında üretir).
// Bilgisayarda: modeli sürükleyip çevirme + "telefonundan aç" yönergesi.
// model-viewer (Google, Apache-2.0) sadece pencere açılınca yüklenir: public/vendor/model-viewer.min.js
const SCRIPT_SRC = "/vendor/model-viewer.min.js";
const MODEL_SRC = "/model/s26-ar.glb"; // gerçek boyutta, Sky Blue, ekranı yukarı bakan AR modeli

let loading: Promise<void> | null = null;
function loadModelViewer() {
  if (typeof window === "undefined") return Promise.resolve();
  if (customElements.get("model-viewer")) return Promise.resolve();
  loading ??= new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.type = "module";
    s.src = SCRIPT_SRC;
    s.onload = () => resolve();
    s.onerror = () => {
      loading = null;
      reject(new Error("model-viewer could not be loaded"));
    };
    document.head.appendChild(s);
  });
  return loading;
}

type ModelViewerEl = HTMLElement & {
  canActivateAR?: boolean;
  activateAR?: () => void;
};

export default function ARViewer({ className = "" }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [canAR, setCanAR] = useState(false);
  const [mobile, setMobile] = useState(false); // telefon/tablet: AR butonu her zaman gösterilir
  const [error, setError] = useState(false);
  const viewerRef = useRef<ModelViewerEl | null>(null);

  // Pencere açılınca kütüphaneyi yükle
  useEffect(() => {
    if (!open) return;
    let alive = true;
    loadModelViewer()
      .then(() => alive && setReady(true))
      .catch(() => alive && setError(true));
    return () => {
      alive = false;
    };
  }, [open]);

  // AR desteği: model-viewer AR modunu arka planda, kendi zamanlamasıyla belirler; o yüzden bir kez değil,
  // birkaç saniye boyunca tekrar tekrar kontrol edilir (bulunca durur)
  useEffect(() => {
    const el = viewerRef.current;
    if (!ready || !el) return;
    let tries = 0;
    const check = () => {
      tries++;
      if (el.canActivateAR) {
        setCanAR(true);
        window.clearInterval(id);
      } else if (tries > 40) window.clearInterval(id);
    };
    const id = window.setInterval(check, 300);
    el.addEventListener("load", check);
    el.addEventListener("ar-status", check);
    return () => {
      window.clearInterval(id);
      el.removeEventListener("load", check);
      el.removeEventListener("ar-status", check);
    };
  }, [ready]);

  const startAR = () => {
    playSound("tick");
    viewerRef.current?.activateAR?.();
  };
  const showAR = canAR || mobile;

  // Esc ile kapanır; açıkken sayfa kaymaz
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <button
        onClick={() => {
          // Telefon/tablet mi? (iPadOS kendini Mac gibi tanıtır: dokunmatik Mac = iPad)
          const ipad = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
          setMobile(/android|iphone|ipad|ipod/i.test(navigator.userAgent) || ipad);
          setOpen(true);
          playSound("tick");
        }}
        className={`inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-2.5 text-sm hover:bg-white/10 transition-colors ${className}`}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          aria-hidden
        >
          <path d="M12 2l8 4.5v9L12 20l-8-4.5v-9L12 2z" />
          <path d="M12 11l8-4.5M12 11L4 6.5M12 11v9" />
        </svg>
        View in your room
      </button>

      {/* Pencere sayfanın köküne taşınır: bölümün kendi katman sırası (z-10) yüzünden ortak 3D tuvalin (z-20)
          altında kalmasın */}
      {open &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Galaxy S26 Ultra in AR"
            className="fixed inset-0 z-[90] bg-black/85 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setOpen(false)}
          >
            <div className="relative w-full max-w-3xl rounded-[28px] border border-white/10 bg-[#0b0c10] overflow-hidden">
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
              >
                ✕
              </button>

              <div className="relative h-[58svh] max-h-[560px]">
                {ready && (
                  <model-viewer
                    ref={(el: HTMLElement | null) => {
                      viewerRef.current = el as ModelViewerEl | null;
                    }}
                    src={MODEL_SRC}
                    alt="Galaxy S26 Ultra in Sky Blue"
                    // React 19 özel elemanlarda eşleşen özelliği (el.ar) doğrudan atar: "" yanlış sayılır, true olmalı
                    ar
                    ar-modes="webxr scene-viewer quick-look"
                    ar-scale="fixed"
                    ar-placement="floor"
                    camera-controls=""
                    auto-rotate=""
                    touch-action="pan-y"
                    shadow-intensity="1"
                    exposure="1.1"
                    environment-image="neutral"
                    camera-orbit="30deg 65deg auto"
                    interaction-prompt="none"
                    style={{
                      width: "100%",
                      height: "100%",
                      background: "transparent",
                    }}
                  >
                    {/* model-viewer'ın kendi AR butonu gizlenir; aşağıdaki kendi butonumuz kullanılır */}
                    <span slot="ar-button" style={{ display: "none" }} />
                  </model-viewer>
                )}
                {ready && showAR && (
                  <button
                    onClick={startAR}
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 sg-btn whitespace-nowrap"
                  >
                    Place it in your room
                  </button>
                )}
                {!ready && !error && (
                  <div className="absolute inset-0 flex items-center justify-center text-white/50 text-sm">
                    Loading 3D model…
                  </div>
                )}
                {error && (
                  <div className="absolute inset-0 flex items-center justify-center text-white/50 text-sm px-6 text-center">
                    The 3D viewer could not be loaded. Please check your
                    connection and try again.
                  </div>
                )}
              </div>

              <div className="border-t border-white/10 px-6 py-5">
                <p className="text-lg font-semibold mb-1">
                  See it at real size.
                </p>
                <p className="text-white/55 text-sm font-light">
                  {showAR
                    ? "Tap “Place it in your room” and point your camera at a table or the floor. The phone appears at its true size: 163.6 × 78.1 mm."
                    : "Drag to rotate. Open this page on your phone (Android with ARCore or iPhone) to place Galaxy S26 Ultra on your desk at its true size."}
                </p>
                {mobile && !canAR && (
                  <p className="text-white/35 text-xs font-light mt-2">
                    If the camera doesn&apos;t open: on Android install &quot;Google Play Services for AR&quot;; on iPhone
                    use Safari or Chrome.
                  </p>
                )}
                <p className="hidden">
                </p>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
