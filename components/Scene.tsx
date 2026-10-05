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

    // Başlangıç değerleri timeline'dan ÖNCE
    gsap.set(g.position, { x: 0.2, y: 0.6, z: 1 });
    gsap.set(g.rotation, { x: -1, y: 0, z: 0 });
    gsap.set(g.scale, { x: 12, y: 12, z: 12 });

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

    // 2. EKRAN (TEARDOWN)
    tl.to(g.rotation, { x: 0, y: 2.7, z: 0 }, 0)
      .to(g.position, { x: 2.8, y: 0, z: 0 }, 0)
      .to(g.scale, { x: 7, y: 7, z: 7 }, 0)

      // 3. EKRAN (FEATURES)
      .to(g.rotation, { x: 0.2, y: 0.4, z: 0.02 }, 1)
      .to(g.position, { x: -3.4, y: 0.1, z: 1 }, 1)
      .to(g.scale, { x: 5, y: 5, z: 5 }, 1)

      // 4. EKRAN (CAMERA)
      .to(g.rotation, { x: 0, y: 3.5, z: 0 }, 2)
      .to(g.position, { x: 3.2, y: -2, z: 2 }, 2)
      .to(g.scale, { x: 10, y: 10, z: 10 }, 2)
      // Kamera telefonla aynı hizaya iner, perspektif eğriliği kaybolur
      .to(
        camera.position,
        {
          y: 0,
          onUpdate: () => camera.lookAt(0, 0, 0),
        },
        2
      );
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
      style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0, pointerEvents: 'none' }}
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