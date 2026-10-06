'use client';

import { Canvas, useThree } from '@react-three/fiber';
import { useGLTF, ContactShadows, Float } from '@react-three/drei';
import { useRef, useEffect, Suspense } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });

function RealPhoneModel() {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF('/model/phone.glb');
  const { camera } = useThree();

  // Smooth scroll (Lenis) <-> ScrollTrigger senkronu
  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.1 });
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);

    useGSAP(() => {
    const g = groupRef.current;
    if (!g) return;

    type Pose = { pos: [number, number, number]; rot: [number, number, number]; s: number };

    const build = (c: { hero: Pose; s2: Pose; s3: Pose; s4: Pose }) => {
      gsap.set(g.position, { x: c.hero.pos[0], y: c.hero.pos[1], z: c.hero.pos[2] });
      gsap.set(g.rotation, { x: c.hero.rot[0], y: c.hero.rot[1], z: c.hero.rot[2] });
      gsap.set(g.scale, { x: c.hero.s, y: c.hero.s, z: c.hero.s });

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
    };

    const mm = gsap.matchMedia();

    // Masaüstü: mevcut değerlerin aynısı
    mm.add('(min-width: 768px)', () => {
      build({
        hero: { pos: [0.2, 0.6, 1], rot: [-1, 0, 0], s: 12 },
        s2: { pos: [2.8, 0, 0], rot: [0, 2.7, 0], s: 7 },
        s3: { pos: [-3.4, 0.1, 1], rot: [0.2, 0.4, 0.02], s: 5 },
        s4: { pos: [3.2, -2, 2], rot: [0, 3.5, 0], s: 10 },
      });
    });

    // Mobil: telefon üstte, yazı altta. Değerler başlangıç tahmini, ince ayar gerekir.
    mm.add('(max-width: 767px)', () => {
      build({
        hero: { pos: [0, 0.3, 0], rot: [-1, 0, 0], s: 5 },
        s2: { pos: [0, 2.25, 0], rot: [0, 2.7, 0], s: 2.6 },
        s3: { pos: [0, 1.8, 0], rot: [0.2, 0.4, 0.02], s: 3.6 },
        s4: { pos: [0, 0.5, 1], rot: [0, 3.5, 0], s: 5.5 },
      });
    });

    return () => mm.revert();
  }, []);

  return (
    <group ref={groupRef}>
      <Float speed={1.2} rotationIntensity={0.02} floatIntensity={0.05}>
        <primitive object={scene} />
      </Float>
    </group>
  );
}

useGLTF.preload('/model/phone.glb');

export default function Scene() {
  return (
    <Canvas
      camera={{ position: [0, -2, 9], fov: 45 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, powerPreference: 'high-performance', alpha: true }}
      style={{ width: '100%', height: '100%', position: 'fixed', top: 0, left: 0, pointerEvents: 'none' }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={2.5} />
        <directionalLight position={[5, 5, 5]} intensity={4.5} color="#ffffff" />
        <directionalLight position={[-5, -5, -5]} intensity={2.5} color="#06b6d4" />
        <spotLight position={[0, -5, 10]} intensity={6} angle={0.5} penumbra={1} color="#ffffff" />

        <RealPhoneModel />

        <ContactShadows position={[0, -5, 0]} opacity={0.5} scale={20} blur={3} far={5} frames={1} resolution={512} />
      </Suspense>
    </Canvas>
  );
}