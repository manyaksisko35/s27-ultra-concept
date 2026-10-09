'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, ContactShadows, Float, PerformanceMonitor } from '@react-three/drei';
import { useRef, useEffect, useMemo, useState, Suspense } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import Lenis from 'lenis';
import { FAN_CENTER, FAN_COLORS, applyPreset, getColorId, type PhoneColor } from '@/lib/phoneColor';
import { setLenis } from '@/lib/lenis';
import { RimLight, StudioEnv } from '@/components/StudioEnv';

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });
useGLTF.setDecoderPath('/draco/');

const MODEL_URL = '/model/phone-opt.glb'; // S26 Ultra (ana telefon)
const PEN_URL = '/model/spen.glb'; // Sadece S Pen + 'status_toggle' animasyonu

// S Pen ayrı bir modelden gelir ve telefonun içindeki yuvaya oturtulur.
// Telefon modelinin yüksekliği 0.8406, pen modelinin kaynak telefonu 0.1632 birim: ölçek oranı budur.
const PEN_SCALE = 0.8406 / 0.1632;
// x/y: iki telefonun merkezi hizalı; z: ekran düzlemine göre (alt ucun gövdeden taşmaması için y biraz yukarıda)
const PEN_POSITION: [number, number, number] = [-0.0145, -0.0235, 0.0306 - 0.0042 * PEN_SCALE];
const TAU = Math.PI * 2;

// Renk yelpazesi (model birimleriyle; telefonun yüksekliği 0.84)
const FAN_RADIUS = 1.0; // yelpazenin dönme noktasının telefon merkezinin ne kadar altında olduğu
const FAN_LIFT = 0.12; // seçili telefon kendi ekseninde bu kadar yukarı çıkar
const FAN_Z_STEP = 0.07; // üst üste binen telefonlar arası derinlik (telefon kalınlığı 0.0635'ten büyük olmalı)
const FAN_SIGN = 1; // yelpazenin yönü (soldan sağa sıra ters çıkarsa -1 yap)

// Ana telefonun bir kopyasını, verilen renge boyayarak oluşturur (materyaller kopyalanır, ana telefon etkilenmez)
function makeColoredClone(source: THREE.Object3D, preset: PhoneColor): THREE.Object3D {
  const copy = source.clone(true);
  copy.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh) return;
    m.material = Array.isArray(m.material) ? m.material.map((x) => x.clone()) : m.material.clone();
  });
  applyPreset(copy, preset);
  return copy;
}

function RealPhoneModel() {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF(MODEL_URL);
  const { scene: penScene, animations } = useGLTF(PEN_URL);
  const { camera } = useThree();

  // S Pen animasyonunu scroll'a bağlamak için mixer burada tutulur
  const penRef = useRef<{ mixer: THREE.AnimationMixer; duration: number } | null>(null);

  // Renk yelpazesi: ortadaki ana telefon, diğerleri renkli kopyalar
  const fanClones = useMemo(
    () => FAN_COLORS.map((c, i) => (i === FAN_CENTER ? null : makeColoredClone(scene, c))),
    [scene]
  );
  const pivotRefs = useRef<(THREE.Group | null)[]>([]); // yelpazeyi açan döndürme noktaları
  const liftRefs = useRef<(THREE.Group | null)[]>([]); // seçili telefonu öne/yukarı alan gruplar
  const fanState = useRef({ open: 0 }); // 0 = kapalı, 1 = tamamen açık

  // Modelin gerçek boyutu ve merkezi (mobilde yüzdeyle yerleştirmek için)
  const dims = useMemo(() => {
    scene.updateMatrixWorld(true);
    const b = new THREE.Box3().setFromObject(scene);
    return { size: b.getSize(new THREE.Vector3()), center: b.getCenter(new THREE.Vector3()) };
  }, [scene]);

  // Gereksiz gölge işlerini kapat, dokuları hafif keskinleştir
  // Smooth scroll (Lenis) <-> ScrollTrigger senkronu
  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.1 });
    setLenis(lenis);
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      setLenis(null);
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);

  // Ana telefon da yelpazedeki ortadaki rengine (Sky Blue) boyanır, böylece yelpazedeki rengiyle birebir aynı olur
  useEffect(() => {
    applyPreset(scene, FAN_COLORS[FAN_CENTER]);
  }, [scene]);

  // Kopyaların materyallerini sayfadan çıkınca serbest bırak
  useEffect(() => {
    return () => {
      fanClones.forEach((c) =>
        c?.traverse((o) => {
          const m = o as THREE.Mesh;
          if (!m.isMesh) return;
          (Array.isArray(m.material) ? m.material : [m.material]).forEach((mat) => mat.dispose());
        })
      );
    };
  }, [fanClones]);

  // S Pen animasyonu ('status_toggle'): pen yuvadan çıkar, ekranın önüne gelir. Scroll ile ileri-geri oynatılır.
  useEffect(() => {
    const clip = THREE.AnimationClip.findByName(animations, 'status_toggle');
    if (!clip) {
      console.warn('[Scene] status_toggle animasyonu bulunamadı');
      return;
    }
    const mixer = new THREE.AnimationMixer(penScene);
    const action = mixer.clipAction(clip);
    action.setLoop(THREE.LoopOnce, 1);
    action.clampWhenFinished = true;
    action.play();
    mixer.setTime(0);
    penRef.current = { mixer, duration: clip.duration };

    return () => {
      mixer.stopAllAction();
      mixer.uncacheRoot(penScene);
      penRef.current = null;
    };
  }, [penScene, animations]);

  // Seçili renkteki telefon yelpaze açıkken öne ve yukarı çıkar (her karede yumuşak geçişle)
  useFrame((_, dt) => {
    const sel = FAN_COLORS.findIndex((c) => c.id === getColorId());
    const open = fanState.current.open;
    liftRefs.current.forEach((g, i) => {
      if (!g) return;
      const isSel = i === sel;
      const baseY = i === FAN_CENTER ? 0 : FAN_RADIUS;
      const ty = baseY + (isSel ? FAN_LIFT : 0) * open;
      // Kopyalar baştan itibaren ana telefonun arkasında durur (aynı düzlemde olsalar üst üste titrerdi);
      // seçili olan yelpaze açıldıkça en öne gelir
      const baseZ = FAN_Z_STEP * Math.abs(i - FAN_CENTER);
      const tz = isSel ? THREE.MathUtils.lerp(baseZ, -FAN_Z_STEP * 1.5, open) : baseZ;
      g.position.y = THREE.MathUtils.damp(g.position.y, ty, 8, dt);
      g.position.z = THREE.MathUtils.damp(g.position.z, tz, 8, dt);
    });
  });

  useGSAP(() => {
    const g = groupRef.current;
    if (!g) return;

    type Pose = { pos: [number, number, number]; rot: [number, number, number]; s: number };

    const build = (c: { hero: Pose; s2: Pose; s3: Pose; s4: Pose; s5: Pose; s6: Pose }, fanStep: number) => {
      gsap.set(g.position, { x: c.hero.pos[0], y: c.hero.pos[1], z: c.hero.pos[2] });
      gsap.set(g.rotation, { x: c.hero.rot[0], y: c.hero.rot[1], z: c.hero.rot[2] });
      gsap.set(g.scale, { x: c.hero.s, y: c.hero.s, z: c.hero.s });
      penRef.current?.mixer.setTime(0);
      fanState.current.open = 0;
      const pivots = pivotRefs.current;
      pivots.forEach((pv) => {
        if (!pv) return;
        pv.rotation.z = 0;
        pv.visible = false;
      });

      // Zaman çizelgesi: her 1 birim = 1 ekran yüksekliği kadar scroll
      // 0-1: s2, 1-2: s3, 2-3: s4, 3-4: s5 (S Pen bölümüne geçiş), 4-5: S Pen çıkar (bölüm sabit),
      // 5-6: S Pen yuvasına döner + telefon renk bölümüne geçer, 6-7: yelpaze açılır, 7-8: bekleme (renk seçimi)
      const tl = gsap.timeline({
        defaults: { duration: 1, ease: 'power2.inOut' },
        scrollTrigger: {
          trigger: '#main-scroll-container',
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });

      const step = (p: Pose, at: number) =>
        tl
          .to(g.rotation, { x: p.rot[0], y: p.rot[1], z: p.rot[2] }, at)
          .to(g.position, { x: p.pos[0], y: p.pos[1], z: p.pos[2] }, at)
          .to(g.scale, { x: p.s, y: p.s, z: p.s }, at);

      step(c.s2, 0);
      step(c.s3, 1);
      step(c.s4, 2);
      tl.to(camera.position, { y: 0, onUpdate: () => camera.lookAt(0, 0, 0) }, 2);
      step(c.s5, 3);

      // S Pen: klip süresini scroll ilerlemesine bağla (ease yok, doğrusal). 4-5 çıkar, 5-6 geri girer.
      const pen = { p: 0 };
      const penUpdate = () => {
        const r = penRef.current;
        if (r) r.mixer.setTime(pen.p * (r.duration - 0.001));
      };
      tl.to(pen, { p: 1, duration: 1, ease: 'none', onUpdate: penUpdate }, 4);
      tl.to(pen, { p: 0, duration: 1, ease: 'none', onUpdate: penUpdate }, 5);
      step(c.s6, 5);

      // Yelpaze: kopyalar ana telefonun arkasından çıkıp açılır
      pivots.forEach((pv, i) => {
        if (!pv) return;
        tl.set(pv, { visible: true, immediateRender: false }, 6);
        tl.to(pv.rotation, { z: FAN_SIGN * (i - FAN_CENTER) * fanStep }, 6);
      });
      tl.to(fanState.current, { open: 1 }, 6);

      // 7-8: yelpaze açık kalır (renk seçimi için scroll payı)
      tl.to({ idle: 0 }, { idle: 1, duration: 1, ease: 'none' }, 7);
    };

    const mm = gsap.matchMedia();

    // Masaüstü: s2-s4 eskisiyle aynı, s5 S Pen, s6 renk yelpazesi (telefon arkası kameraya dönük)
    mm.add('(min-width: 768px)', () => {
      build(
        {
          hero: { pos: [0.2, 0.6, 1], rot: [-1, 0, 0], s: 12 },
          s2: { pos: [2.8, 0, 0], rot: [0, 2.7, 0], s: 7 },
          s3: { pos: [-3.4, 0.1, 1], rot: [0.2, 0.4, 0.02], s: 5 },
          s4: { pos: [3.2, -2, 2], rot: [0, 3.5, 0], s: 10 },
          s5: { pos: [-2.8, 0.75, 0], rot: [0.08, TAU + 0.35, 0], s: 4 },
          s6: { pos: [0, -0.25, 0], rot: [0, TAU + Math.PI, 0], s: 3.1 },
        },
        0.3
      );
    });

    // Mobil: telefonu ekranın yüzdesine göre yerleştir
    mm.add('(max-width: 767px)', () => {
      const fov = THREE.MathUtils.degToRad((camera as THREE.PerspectiveCamera).fov);
      const CAM_Y = -2; // Canvas'taki başlangıç kamera yüksekliği (4. ekranda 0'a iner)

      // heightFrac: telefonun ekran yüksekliğine oranı
      // centerFromTop: telefonun merkezinin ekranın üstünden uzaklığı (0 = en üst, 1 = en alt)
      const fit = (
        heightFrac: number,
        centerFromTop: number,
        z: number,
        rot: [number, number, number],
        camY: number
      ): Pose => {
        const visH = 2 * (camera.position.z - z) * Math.tan(fov / 2);
        const s = (heightFrac * visH) / dims.size.y;
        const target = new THREE.Vector3(0, camY + (0.5 - centerFromTop) * visH, z);
        const offset = dims.center.clone().multiplyScalar(s).applyEuler(new THREE.Euler(...rot));
        const p = target.sub(offset);
        return { pos: [p.x, p.y, p.z], rot, s };
      };

      build(
        {
          hero: { pos: [0, 0.3, 0], rot: [-1, 0, 0], s: 5 },
          s2: fit(0.32, 0.27, 0, [0, 2.7, 0], CAM_Y),
          s3: fit(0.36, 0.29, 0, [0.2, 0.4, 0.02], CAM_Y),
          s4: fit(0.38, 0.31, 1, [0, 3.5, 0], 0),
          // S Pen: telefon üstte, pen alttan çıkınca metin alanına fazla girmesin diye biraz küçük
          s5: fit(0.27, 0.235, 0, [0.05, TAU + 0.25, 0], 0),
          // Renk yelpazesi: başlık üstte, renk seçici altta; dar ekranda yelpaze daha kapalı açılır
          s6: fit(0.26, 0.5, 0, [0, TAU + Math.PI, 0], 0),
        },
        0.2
      );
    });

    return () => mm.revert();
  }, []);

  return (
    <group ref={groupRef}>
      <Float speed={1.2} rotationIntensity={0.02} floatIntensity={0.05}>
        <group
          ref={(el) => {
            liftRefs.current[FAN_CENTER] = el;
          }}
        >
          <primitive object={scene} />
          <group scale={PEN_SCALE} position={PEN_POSITION}>
            <primitive object={penScene} />
          </group>
        </group>
      </Float>

      {FAN_COLORS.map((c, i) => {
        const clone = fanClones[i];
        if (!clone) return null;
        return (
          <group
            key={c.id}
            ref={(el) => {
              pivotRefs.current[i] = el;
            }}
            position={[0, -FAN_RADIUS, 0]}
          >
            <group
              ref={(el) => {
                liftRefs.current[i] = el;
              }}
              position={[0, FAN_RADIUS, 0]}
            >
              <primitive object={clone} />
            </group>
          </group>
        );
      })}
    </group>
  );
}

useGLTF.preload(MODEL_URL);
useGLTF.preload(PEN_URL);

export default function Scene() {
  const [dpr, setDpr] = useState(1.25);
  // Animasyon konteyneri ekrandan çıkınca (Galaxy AI, Compare, Specs) bu sahne çizilmez; ikinci Canvas'la GPU paylaşılmaz
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const el = document.getElementById('main-scroll-container');
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Canvas
      frameloop={visible ? 'always' : 'never'}
      camera={{ position: [0, -2, 9], fov: 45 }}
      dpr={dpr}
      gl={{ antialias: true, powerPreference: 'high-performance', alpha: true }}
      style={{ width: '100%', height: '100%', position: 'fixed', top: 0, left: 0, pointerEvents: 'none' }}
    >
      {/* Cihaz yavaşlarsa çözünürlüğü düşürür, güçlüyse yükseltir */}
      <PerformanceMonitor
        onDecline={() => setDpr(1)}
        onIncline={() => setDpr(Math.min(window.devicePixelRatio, 1.5))}
      />
      <Suspense fallback={null}>
        {/* Stüdyo yansımaları (bir kez çizilir) + kenar ışığı */}
        <StudioEnv intensity={0.7} />
        <RimLight />
        <ambientLight intensity={1.8} />
        <directionalLight position={[5, 5, 5]} intensity={4.5} color="#ffffff" />
        <directionalLight position={[-5, -5, -5]} intensity={2.5} color="#06b6d4" />
        <spotLight position={[0, -5, 10]} intensity={6} angle={0.5} penumbra={1} color="#ffffff" />

        <RealPhoneModel />

        <ContactShadows position={[0, -5, 0]} opacity={0.5} scale={20} blur={3} far={5} frames={1} resolution={512} />
      </Suspense>
    </Canvas>
  );
}