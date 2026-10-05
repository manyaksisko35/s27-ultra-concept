"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, RoundedBox, useGLTF } from "@react-three/drei";
import * as THREE from "three";

const IDS = ["hero", "design", "camera", "power", "specs", "launch"];

// x, y, scale, rotY, rotX  (one keyframe per section)
const KEYS: number[][] = [
  [0, -0.75, 0.9, -0.5, 0.08],
  [1.35, 0, 1, Math.PI - 0.5, 0],
  [1.15, -1.95, 2.1, Math.PI, 0.1],
  [1.35, 0, 1, 0.45, 0],
  [2.6, 0, 0.001, 1.5, 0],
  [1.35, 0, 1.1, Math.PI * 2 - 0.4, 0],
];

const smooth = (t: number) => t * t * (3 - 2 * t);

function makeScreen() {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 1066;
  const g = c.getContext("2d")!;
  const grad = g.createLinearGradient(0, 0, 512, 1066);
  grad.addColorStop(0, "#14205e");
  grad.addColorStop(0.55, "#5b3df0");
  grad.addColorStop(1, "#f58ab0");
  g.fillStyle = grad;
  g.fillRect(0, 0, 512, 1066);
  g.fillStyle = "#ffffff";
  g.textAlign = "center";
  g.font = "600 150px system-ui, sans-serif";
  g.fillText("9:41", 256, 330);
  g.font = "400 34px system-ui, sans-serif";
  g.fillText("Galaxy S27 Ultra", 256, 400);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const MODEL_URL = "/s26-ultra.glb"; // put your downloaded model in public/ with this name

function GlbBody() {
  const { scene } = useGLTF(MODEL_URL);
  const model = useMemo(() => {
    const clone = scene.clone(true);
    const box = new THREE.Box3().setFromObject(clone);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    clone.position.sub(center);
    const wrap = new THREE.Group();
    wrap.add(clone);
    wrap.scale.setScalar(3.2 / Math.max(size.x, size.y, size.z));
    return wrap;
  }, [scene]);
  return <primitive object={model} />;
}

function Phone() {
  const group = useRef<THREE.Group>(null);
  const progress = useRef(0);
  const cur = useRef({ x: 0, y: -0.75, s: 0.9, ry: -0.5, rx: 0.08 });
  const width = useThree((s) => s.size.width);
  const [hasGlb, setHasGlb] = useState(false);
  const screen = useMemo(makeScreen, []);

  useEffect(() => {
    fetch(MODEL_URL, { method: "HEAD" })
      .then((r) => setHasGlb(r.ok))
      .catch(() => setHasGlb(false));
  }, []);
  const reduce = useMemo(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches, []);

  useEffect(() => {
    const update = () => {
      const els = IDS.map((id) => document.getElementById(id));
      if (els.some((e) => !e)) return;
      const tops = els.map((e) => e!.getBoundingClientRect().top + window.scrollY);
      const y = window.scrollY + window.innerHeight * 0.5;
      let i = 0;
      while (i < tops.length - 1 && tops[i + 1] <= y) i++;
      progress.current =
        i >= tops.length - 1 ? i : i + Math.min(1, Math.max(0, (y - tops[i]) / (tops[i + 1] - tops[i])));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    const f = progress.current;
    const i = Math.min(Math.floor(f), KEYS.length - 2);
    const t = smooth(Math.min(1, Math.max(0, f - i)));
    const a = KEYS[i];
    const b = KEYS[i + 1];
    const mix = (n: number) => a[n] + (b[n] - a[n]) * t;
    const mobile = width < 768;
    const lambda = reduce ? 60 : 5;
    const c = cur.current;
    c.x = THREE.MathUtils.damp(c.x, mobile ? 0 : mix(0), lambda, dt);
    c.y = THREE.MathUtils.damp(c.y, mix(1), lambda, dt);
    c.s = THREE.MathUtils.damp(c.s, mix(2) * (mobile ? 0.8 : 1), lambda, dt);
    c.ry = THREE.MathUtils.damp(c.ry, mix(3), lambda, dt);
    c.rx = THREE.MathUtils.damp(c.rx, mix(4), lambda, dt);
    const float = reduce ? 0 : Math.sin(state.clock.elapsedTime * 0.8);
    g.position.set(c.x, c.y + float * 0.04, 0);
    g.scale.setScalar(Math.max(c.s, 0.001));
    g.rotation.set(c.rx, c.ry + float * 0.03, 0);
  });

  // To use a real model later: const { scene } = useGLTF("/s27-ultra.glb") and render <primitive object={scene} />
  return (
    <group ref={group}>
      {hasGlb && (
        <Suspense fallback={null}>
          <GlbBody />
        </Suspense>
      )}
      {!hasGlb && (
      <>
      <RoundedBox args={[1.53, 3.2, 0.16]} radius={0.14} smoothness={6}>
        <meshStandardMaterial color="#4a5062" metalness={1} roughness={0.32} />
      </RoundedBox>
      <RoundedBox args={[1.44, 3.1, 0.01]} radius={0.1} smoothness={4} position={[0, 0, 0.081]}>
        <meshBasicMaterial map={screen} toneMapped={false} />
      </RoundedBox>
      <RoundedBox args={[0.02, 0.55, 0.05]} radius={0.008} position={[0.77, 0.5, 0]}>
        <meshStandardMaterial color="#5a6178" metalness={1} roughness={0.3} />
      </RoundedBox>
      <RoundedBox args={[1.3, 0.55, 0.05]} radius={0.12} smoothness={6} position={[0, 1.15, -0.105]}>
        <meshPhysicalMaterial color="#0c0e14" metalness={0.6} roughness={0.15} clearcoat={1} />
      </RoundedBox>
      {[-0.4, 0, 0.4].map((x) => (
        <group key={x} position={[x, 1.15, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh position={[0, 0.145, 0]}>
            <cylinderGeometry args={[0.19, 0.19, 0.03, 48]} />
            <meshStandardMaterial color="#8a92aa" metalness={1} roughness={0.25} />
          </mesh>
          <mesh position={[0, 0.15, 0]}>
            <cylinderGeometry args={[0.14, 0.14, 0.035, 48]} />
            <meshPhysicalMaterial color="#050608" metalness={0.3} roughness={0.05} clearcoat={1} />
          </mesh>
        </group>
      ))}
      </>
      )}
    </group>
  );
}

export default function PhoneScene() {
  return (
    <div className="stage" aria-hidden="true">
      <Canvas camera={{ position: [0, 0, 6], fov: 35 }} dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
        <ambientLight intensity={0.35} />
        <directionalLight position={[3, 4, 5]} intensity={1.4} />
        <Environment resolution={256}>
          <Lightformer form="rect" intensity={4} position={[0, 4, 3]} scale={[10, 2, 1]} />
          <Lightformer form="rect" intensity={2} position={[-5, 0, 2]} scale={[2, 8, 1]} />
          <Lightformer form="rect" intensity={2} position={[5, 0, -2]} scale={[2, 8, 1]} />
        </Environment>
        <Phone />
      </Canvas>
    </div>
  );
}