'use client';

import { Canvas } from '@react-three/fiber';
import { ContactShadows, RoundedBox, Float } from '@react-three/drei';
import { useRef, Suspense } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

function S27UltraModel() {
  const groupRef = useRef<THREE.Group>(null);
  const screenRef = useRef<THREE.Mesh>(null);
  const vaporRef = useRef<THREE.Mesh>(null);
  const chipRef = useRef<THREE.Mesh>(null);
  const chassisRef = useRef<THREE.Mesh>(null);

  useGSAP(() => {
    if (!groupRef.current || !screenRef.current || !vaporRef.current || !chipRef.current || !chassisRef.current) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '#main-scroll-container',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1,
      },
    });

    tl.to(groupRef.current.rotation, { y: -Math.PI / 5, x: 0.1, z: -0.1 }, 0)
      .to(groupRef.current.position, { x: 2, y: 0 }, 0)
      .to(screenRef.current.position, { z: 1.5 }, 0.1)
      .to(vaporRef.current.position, { z: 0.5 }, 0.1)
      .to(chipRef.current.position, { z: 0.2 }, 0.1)
      .to(chassisRef.current.position, { z: -1.0 }, 0.1);

    tl.to(groupRef.current.rotation, { y: Math.PI / 4, x: -0.15 }, 0.5)
      .to(groupRef.current.position, { x: -3, y: -0.5 }, 0.5)
      .to(screenRef.current.position, { z: 0.15 }, 0.5)
      .to(vaporRef.current.position, { z: 0.05 }, 0.5)
      .to(chipRef.current.position, { z: 0.02 }, 0.5)
      .to(chassisRef.current.position, { z: -0.15 }, 0.5);
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]} rotation={[0.2, 0, 0]}>
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        
        <RoundedBox ref={screenRef} args={[2.9, 6.1, 0.05]} radius={0.05} position={[0, 0, 0.15]}>
          <meshStandardMaterial color="#000000" metalness={0.9} roughness={0.1} />
        </RoundedBox>

        <RoundedBox ref={vaporRef} args={[2.7, 5.9, 0.02]} radius={0.1} position={[0, 0, 0.05]}>
          <meshStandardMaterial color="#ff4400" emissive="#551100" metalness={0.8} roughness={0.3} />
        </RoundedBox>

        <RoundedBox ref={chipRef} args={[1.5, 3, 0.05]} radius={0.05} position={[0, 0.5, 0.02]}>
          <meshStandardMaterial color="#0a0a0a" metalness={0.8} roughness={0.5} wireframe={true} />
        </RoundedBox>

        <RoundedBox ref={chassisRef} args={[3, 6.2, 0.2]} radius={0.2} position={[0, 0, -0.15]}>
          <meshStandardMaterial color="#404040" metalness={1} roughness={0.4} />
        </RoundedBox>

      </Float>
    </group>
  );
}

export default function Scene() {
  return (
    <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
      <Suspense fallback={null}>
        {/* İnternet bağlantısı gerektirmeyen güçlü yerel ışıklar */}
        <ambientLight intensity={2} />
        <directionalLight position={[5, 5, 5]} intensity={4} color="#ffffff" />
        <directionalLight position={[-5, -5, -5]} intensity={2} color="#00ffff" />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={5} color="#ff4400" />
        
        <S27UltraModel />
        <ContactShadows position={[0, -4, 0]} opacity={0.5} scale={20} blur={2} far={4.5} />
      </Suspense>
    </Canvas>
  );
}