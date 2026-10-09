'use client';

// Super Steady, Privacy Display, Design, Inside (patlamış görünüm) ve Build (yapılandırıcı) bölümlerinin 3D sahneleri (ortak tuvaldeki View'ların içeriği).
// Performans: ışıksız (MeshBasic) ekran dokuları bir kez 2D çizilir; sadece hedefe varılmamışsa kare istenir.

import { useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import {
  S25_HEIGHT_MM,
  S25_URL,
  S26_HEIGHT_MM,
  S26_URL,
  canvasTexture,
  roundedRectGeometry,
  splitPhoneLayers,
  useNormalizedPhone,
} from '@/lib/phoneModel';
import { PART_BY_MATERIAL, PHONE_COLORS, applyPreset } from '@/lib/phoneColor';
import { requestFrame } from '@/lib/sectionCanvas';
import { RimLight, SoftShadow, StudioEnv } from '@/components/StudioEnv';

const damp = THREE.MathUtils.damp;
const near = (a: number, b: number) => Math.abs(a - b) < 0.0005;

// Ön ısıtma: tuval kurulur kurulmaz (bölüm henüz ekranda değilken) bu sahnenin shader'larını arka planda derler
// ve dokularını GPU'ya yükler. Yoksa hepsi telefon ekrana ilk girdiğinde yapılır ve modeller geç görünür.
// Sahnenin son çocuğu olarak konur: effect'ler sırayla çalıştığı için o an tüm telefon nesneleri sahnededir.
function Warmup() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  useEffect(() => {
    const seen = new Set<THREE.Texture>();
    scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      (Array.isArray(m.material) ? m.material : [m.material]).forEach((mat) => {
        Object.values(mat).forEach((v) => {
          if (v instanceof THREE.Texture && !seen.has(v)) {
            seen.add(v);
            gl.initTexture(v);
          }
        });
      });
    });
    gl.compileAsync(scene, camera).catch(() => {});
  }, [gl, scene, camera]);
  return null;
}

function Lights() {
  return (
    <>
      {/* Stüdyo yansımaları dolguyu sağladığı için ortam ışığı azaltıldı */}
      <StudioEnv intensity={0.9} />
      <ambientLight intensity={1.3} />
      <directionalLight position={[3, 4, 5]} intensity={3} />
      <directionalLight position={[-4, -2, -4]} intensity={1.6} color="#06b6d4" />
      <RimLight />
    </>
  );
}

// Telefon ekranının boyutu (normalize modelde) ve önünde duracağı derinlik
function useScreenSpec(phone: THREE.Object3D) {
  return useMemo(() => {
    const size = phone.userData.size as THREE.Vector3;
    return { w: size.x * 0.92, h: 0.955, z: size.z / 2 + 0.0015, r: size.x * 0.1, hole: size.x * 0.03 };
  }, [phone]);
}

// Ön kamera deliği (punch-hole): ekranın üst ortasında siyah daire ve ince lens halkası.
// Ekran dokusunun hemen önünde durur; telefonla birlikte döner.
const holeMat = new THREE.MeshBasicMaterial({ color: '#000000', toneMapped: false });
const ringMat = new THREE.MeshBasicMaterial({ color: '#1c2230', toneMapped: false });
const circleGeo = new THREE.CircleGeometry(1, 32);
function PunchHole({ spec }: { spec: { h: number; z: number; hole: number } }) {
  const y = spec.h / 2 - spec.hole * 2.1;
  return (
    <group position={[0, y, spec.z + 0.0005]}>
      <mesh geometry={circleGeo} material={ringMat} scale={spec.hole * 1.25} />
      <mesh geometry={circleGeo} material={holeMat} scale={spec.hole} position={[0, 0, 0.0002]} />
    </group>
  );
}

// ---------------- Privacy Display ----------------

export type PrivacyState = { angle: number; on: boolean };

// Ekrandaki mesajlaşma ekranı (gizli kalması gereken içerik), bir kez çizilir
function drawChat(ctx: CanvasRenderingContext2D) {
  const W = 540;
  const H = 1170;
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#111a2c');
  g.addColorStop(1, '#080b13');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  // Durum çubuğu iki yanda (ortada ön kamera deliği var)
  ctx.font = '600 24px sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.65)';
  ctx.fillText('9:41', 40, 50);
  ctx.textAlign = 'right';
  ctx.fillText('5G  85%', W - 40, 50);
  ctx.textAlign = 'center';
  ctx.font = '700 28px sans-serif';
  ctx.fillStyle = '#fff';
  ctx.fillText('Messages', W / 2, 96);
  ctx.textAlign = 'left';

  const box = (x: number, y: number, w: number, h: number, r: number, fill: string) => {
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    ctx.fill();
  };
  box(30, 125, 480, 120, 28, 'rgba(255,255,255,0.12)');
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.font = '400 24px sans-serif';
  ctx.fillText('Bank · now', 55, 167);
  ctx.fillStyle = '#fff';
  ctx.font = '700 28px sans-serif';
  ctx.fillText('Verification code: 482 913', 55, 215);

  const bubbles: [boolean, string[]][] = [
    [false, ['Did you send the contract?']],
    [true, ['Yes, check your mail.', 'Password is Sunset-27']],
    [false, ['Got it! Salary meeting', 'at 3?']],
    [true, ['Perfect, see you there.']],
  ];
  let y = 295;
  ctx.font = '500 27px sans-serif';
  bubbles.forEach(([mine, lines]) => {
    const h = 30 + lines.length * 38;
    const w = 40 + Math.max(...lines.map((l) => ctx.measureText(l).width));
    const x = mine ? W - 30 - w : 30;
    box(x, y, w, h, 30, mine ? 'rgba(34,211,238,0.85)' : 'rgba(255,255,255,0.13)');
    ctx.fillStyle = mine ? '#04121a' : '#fff';
    lines.forEach((l, i) => ctx.fillText(l, x + 20, y + 46 + i * 38));
    y += h + 24;
  });
  box(30, H - 120, 480, 70, 35, 'rgba(255,255,255,0.1)');
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.fillText('Message', 60, H - 75);
}

export function PrivacyPhone({ state }: { state: React.RefObject<PrivacyState> }) {
  const phone = useNormalizedPhone(S26_URL);
  const spec = useScreenSpec(phone);
  const group = useRef<THREE.Group>(null);
  const tex = useMemo(() => canvasTexture(540, 1170, drawChat), []);
  const geo = useMemo(() => roundedRectGeometry(spec.w, spec.h, spec.r), [spec]);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }), [tex]);
  useEffect(
    () => () => {
      tex.dispose();
      geo.dispose();
      mat.dispose();
    },
    [tex, geo, mat]
  );

  useFrame((_, rawDt) => {
    const g = group.current;
    const s = state.current;
    if (!g || !s) return;
    const dt = Math.min(rawDt, 0.1);
    const target = THREE.MathUtils.degToRad(-s.angle);
    g.rotation.y = damp(g.rotation.y, target, 8, dt);
    // Gerçek açıya göre karartma: Privacy açıkken ~15°'den sonra hızla kararır, kapalıyken çok az
    const a = Math.abs(THREE.MathUtils.radToDeg(g.rotation.y));
    const t = (v: number) => Math.min(1, Math.max(0, v));
    const dim = s.on ? t((a - 14) / 24) * 0.99 : t((a - 40) / 30) * 0.15;
    // Renk lineer uzayda: algılanan parlaklık (sRGB) için üs alınır, yoksa %5 bile gözle ~%25 görünür
    mat.color.setScalar(Math.pow(1 - dim, 2.2));
    if (!near(g.rotation.y, target)) requestFrame();
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 3.4]} fov={30} />
      <Lights />
      <group ref={group} scale={1.6}>
        <primitive object={phone} />
        <mesh geometry={geo} material={mat} position={[0, 0, spec.z]} />
        <PunchHole spec={spec} />
        <SoftShadow />
      </group>
      <Warmup />
    </>
  );
}

// ---------------- Super Steady ----------------

export type SteadyState = { angle: number; bob: number };

// Kayıttaki video: gün batımı ve dağlar (kare doku; dönünce köşeler görünmesin diye ekrandan büyük kullanılır)
function drawSunset(ctx: CanvasRenderingContext2D) {
  const S = 1024;
  const g = ctx.createLinearGradient(0, 0, 0, S);
  g.addColorStop(0, '#1d3b6e');
  g.addColorStop(0.45, '#f39b6b');
  g.addColorStop(1, '#f6c48a');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, S, S);
  ctx.fillStyle = '#ffe7b0';
  ctx.beginPath();
  ctx.arc(S / 2, S * 0.5, 46, 0, Math.PI * 2);
  ctx.fill();
  const ridge = (pts: number[], fill: string) => {
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.moveTo(0, S);
    pts.forEach((y, i) => ctx.lineTo((i / (pts.length - 1)) * S, y * S));
    ctx.lineTo(S, S);
    ctx.fill();
  };
  ridge([0.55, 0.48, 0.53, 0.45, 0.535, 0.465, 0.52, 0.48], '#3b2a4a');
  ridge([0.6, 0.555, 0.595, 0.55, 0.6, 0.565], '#1f1830');
}

export function SteadyPhone({ state }: { state: React.RefObject<SteadyState> }) {
  const phone = useNormalizedPhone(S26_URL);
  const spec = useScreenSpec(phone);
  const group = useRef<THREE.Group>(null);
  // Ekran, kare dokunun ortasından piksel oranı korunarak alınır; kare kenarı ekranın köşegeni kadar,
  // böylece doku hangi açıda dönerse dönsün ekranın köşeleri doku içinde kalır
  const geo = useMemo(() => roundedRectGeometry(spec.w, spec.h, spec.r, Math.hypot(spec.w, spec.h) * 1.02), [spec]);
  const tex = useMemo(() => {
    const t = canvasTexture(1024, 1024, drawSunset);
    t.center.set(0.5, 0.5);
    return t;
  }, []);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }), [tex]);
  const texRef = useRef<THREE.Texture | null>(null); // her karede döndürülen doku (ref üzerinden)
  useEffect(() => {
    texRef.current = tex;
    return () => {
      tex.dispose();
      geo.dispose();
      mat.dispose();
    };
  }, [tex, geo, mat]);

  useFrame((_, rawDt) => {
    const g = group.current;
    const s = state.current;
    const t = texRef.current;
    if (!g || !s || !t) return;
    const dt = Math.min(rawDt, 0.1);
    // Yatay tutulan telefon (π/2) + scroll ile 360° dönüş; ekrandaki görüntü ters döner, ufuk düz kalır
    const target = Math.PI / 2 + THREE.MathUtils.degToRad(s.angle);
    g.rotation.z = damp(g.rotation.z, target, 8, dt);
    g.position.y = damp(g.position.y, s.bob, 8, dt);
    t.rotation = -g.rotation.z;
    if (!near(g.rotation.z, target) || !near(g.position.y, s.bob)) requestFrame();
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 3.4]} fov={30} />
      <Lights />
      <group ref={group} scale={1.55} rotation={[0, 0, Math.PI / 2]}>
        <primitive object={phone} />
        <mesh geometry={geo} material={mat} position={[0, 0, spec.z]} />
        <PunchHole spec={spec} />
      </group>
      <Warmup />
    </>
  );
}

// ---------------- Design: en ince Ultra ----------------

export type DesignState = { turn: number };

function ProfilePhone({ url, heightMm, x, state }: { url: string; heightMm: number; x: number; state: React.RefObject<DesignState> }) {
  const phone = useNormalizedPhone(url);
  const group = useRef<THREE.Group>(null);
  const scale = 1.7 * (heightMm / S26_HEIGHT_MM);

  useFrame((_, rawDt) => {
    const g = group.current;
    const s = state.current;
    if (!g || !s) return;
    const dt = Math.min(rawDt, 0.1);
    // Önden başlar, yan profile (90°) döner; yan yana yaklaşırlar, kalınlık farkı görünür
    const rotY = (Math.PI / 2) * s.turn + 0.12 * s.turn;
    const px = x * (1 - 0.72 * s.turn);
    g.rotation.y = damp(g.rotation.y, rotY, 7, dt);
    g.position.x = damp(g.position.x, px, 7, dt);
    if (!near(g.rotation.y, rotY) || !near(g.position.x, px)) requestFrame();
  });

  return (
    <group ref={group} position={[x, 0, 0]} scale={scale}>
      <primitive object={phone} />
      <SoftShadow width={0.6} />
    </group>
  );
}

export function DesignPhones({ state }: { state: React.RefObject<DesignState> }) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 4.2]} fov={30} />
      <Lights />
      <ProfilePhone url={S26_URL} heightMm={S26_HEIGHT_MM} x={-0.55} state={state} />
      <ProfilePhone url={S25_URL} heightMm={S25_HEIGHT_MM} x={0.55} state={state} />
      <Warmup />
    </>
  );
}

// ---------------- Build your Ultra: yapılandırıcı ----------------

// colorId: seçili renk; spin: renk her değiştiğinde artar (telefon bir tur döner);
// dragX/dragY: kullanıcının sürükleyerek verdiği dönüş (radyan)
export type BuildState = { colorId: string; spin: number; dragX: number; dragY: number };

export function BuildPhone({ state }: { state: React.RefObject<BuildState> }) {
  const phone = useNormalizedPhone(S26_URL);
  const group = useRef<THREE.Group>(null);
  const painted = useRef<string | null>(null);

  useFrame((_, rawDt) => {
    const g = group.current;
    const s = state.current;
    if (!g || !s) return;
    const dt = Math.min(rawDt, 0.1);

    if (painted.current !== s.colorId) {
      // İlk boyamada renk parçalarının materyalleri bu kopyaya özel kopyalanır (ana sahnedeki telefon etkilenmez)
      if (painted.current === null) {
        g.traverse((o) => {
          const m = o as THREE.Mesh;
          if (!m.isMesh) return;
          const own = (mat: THREE.Material) => (PART_BY_MATERIAL[mat.name] ? mat.clone() : mat);
          m.material = Array.isArray(m.material) ? m.material.map(own) : own(m.material);
        });
      }
      const preset = PHONE_COLORS.find((c) => c.id === s.colorId);
      if (preset) applyPreset(g, preset);
      painted.current = s.colorId;
    }

    // Arkası 3/4 açıyla gösterilir (renk en iyi orada görünür); renk değişince bir tur döner, sürüklenince takip eder
    const rotY = Math.PI + 0.45 + s.spin * Math.PI * 2 + s.dragY;
    const rotX = 0.08 + s.dragX;
    g.rotation.y = damp(g.rotation.y, rotY, 6, dt);
    g.rotation.x = damp(g.rotation.x, rotX, 6, dt);
    if (!near(g.rotation.y, rotY) || !near(g.rotation.x, rotX)) requestFrame();
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 3.6]} fov={30} />
      <Lights />
      <group ref={group} scale={1.6} rotation={[0.08, Math.PI + 0.45, 0]}>
        <primitive object={phone} />
        <SoftShadow />
      </group>
      <Warmup />
    </>
  );
}

// ---------------- Inside: patlamış görünüm ----------------

// turn: telefonun yandan bakışa dönmesi (0-1); explode: katmanların ayrılması (0-1)
export type InsideState = { turn: number; explode: number };

// Katmanlar önden arkaya: (Z konumu, ayrıldığındaki uzaklık). Telefon yüksekliği 1 birim.
export const INSIDE_LAYERS = [
  { key: 'display', z: 0.32 },
  { key: 'vapor', z: 0.21 },
  { key: 'board', z: 0.1 },
  { key: 'frame', z: 0 },
  { key: 'battery', z: -0.11 },
  { key: 'back', z: -0.24 },
] as const;
const LAYER_Z = Object.fromEntries(INSIDE_LAYERS.map((l) => [l.key, l.z])) as Record<string, number>;

function label(text: string, sub: string, bg: string, fg: string) {
  return canvasTexture(512, 256, (ctx) => {
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 512, 256);
    ctx.fillStyle = fg;
    ctx.textAlign = 'center';
    ctx.font = '700 64px sans-serif';
    ctx.fillText(text, 256, 130);
    ctx.font = '500 34px sans-serif';
    ctx.globalAlpha = 0.7;
    ctx.fillText(sub, 256, 190);
  });
}

export function InsidePhone({ state }: { state: React.RefObject<InsideState> }) {
  const phone = useNormalizedPhone(S26_URL);
  const size = phone.userData.size as THREE.Vector3;
  const parts = useMemo(() => splitPhoneLayers(phone), [phone]);
  const partsRef = useRef<ReturnType<typeof splitPhoneLayers> | null>(null); // her karede kaydırılır (ref üzerinden)
  useEffect(() => {
    partsRef.current = parts;
  }, [parts]);
  const group = useRef<THREE.Group>(null);
  const extra = useRef<Record<string, THREE.Object3D | null>>({});
  const pen = useRef<THREE.Group>(null);

  // İç parçalar (modelde iç donanım yok; basit, ucuz geometrilerle temsil edilir)
  const mats = useMemo(
    () => ({
      vapor: new THREE.MeshStandardMaterial({ color: '#c8834f', metalness: 0.8, roughness: 0.35 }),
      board: new THREE.MeshStandardMaterial({ color: '#0e1712', metalness: 0.3, roughness: 0.6 }),
      chip: new THREE.MeshBasicMaterial({ map: label('SNAPDRAGON', '8 Elite Gen 5 for Galaxy', '#c9ced6', '#111'), toneMapped: false }),
      battery: new THREE.MeshStandardMaterial({ color: '#22262e', metalness: 0.2, roughness: 0.7 }),
      batteryLabel: new THREE.MeshBasicMaterial({ map: label('5,000 mAh', 'Li-ion battery', '#22262e', '#e6f6ff'), toneMapped: false }),
      pen: new THREE.MeshStandardMaterial({ color: '#9fb6c8', metalness: 0.4, roughness: 0.4 }),
      penTip: new THREE.MeshStandardMaterial({ color: '#1a1c20', roughness: 0.6 }),
    }),
    []
  );
  useEffect(
    () => () => {
      Object.values(mats).forEach((m) => {
        (m as THREE.MeshBasicMaterial).map?.dispose();
        m.dispose();
      });
    },
    [mats]
  );

  const w = size.x;
  useFrame(({ camera }, rawDt) => {
    const g = group.current;
    const s = state.current;
    const parts = partsRef.current;
    if (!g || !s || !parts) return;
    const dt = Math.min(rawDt, 0.1);
    const e = s.explode;

    // Yan-önden bakış: katmanlar arasındaki boşluk görünsün
    const rotY = -1.0 * s.turn;
    const rotX = 0.28 * s.turn;
    // Dar alanda (mobil) küçülür; açıldıkça biraz daha küçülür ki ayrılan katmanlar kadraja sığsın
    const aspect = (camera as THREE.PerspectiveCamera).aspect || 1;
    const sc = Math.min(1.3, 0.55 + aspect * 0.75) * (1 - 0.18 * e);
    g.rotation.y = damp(g.rotation.y, rotY, 7, dt);
    g.rotation.x = damp(g.rotation.x, rotX, 7, dt);
    g.scale.setScalar(damp(g.scale.x, sc, 7, dt));
    let moving = !near(g.rotation.y, rotY) || !near(g.rotation.x, rotX) || !near(g.scale.x, sc);

    const move = (o: THREE.Object3D | null | undefined, z: number) => {
      if (!o) return;
      o.position.z = damp(o.position.z, z, 7, dt);
      if (!near(o.position.z, z)) moving = true;
    };
    move(parts.front, LAYER_Z.display * e);
    move(parts.mid, 0);
    move(parts.back, LAYER_Z.back * e);
    ['vapor', 'board', 'battery'].forEach((k) => {
      const o = extra.current[k];
      if (o) o.visible = e > 0.02; // kapalıyken gövdenin içinde, gizli
      move(o, LAYER_Z[k] * e);
    });
    // S Pen alttan dışarı kayar
    if (pen.current) {
      const py = -0.22 - 0.5 * e;
      pen.current.position.y = damp(pen.current.position.y, py, 7, dt);
      pen.current.visible = e > 0.02;
      if (!near(pen.current.position.y, py)) moving = true;
    }
    if (moving) requestFrame();
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 3.8]} fov={30} />
      <Lights />
      <group ref={group} scale={1.2}>
        <primitive object={phone} />

        {/* Buhar odası (soğutma) */}
        <mesh
          ref={(o) => {
            extra.current.vapor = o;
          }}
          position={[0, 0.16, 0]}
          material={mats.vapor}
        >
          <boxGeometry args={[w * 0.72, 0.34, 0.004]} />
        </mesh>

        {/* Ana kart + işlemci */}
        <group
          ref={(o) => {
            extra.current.board = o;
          }}
          position={[0, 0.2, 0]}
        >
          <mesh material={mats.board}>
            <boxGeometry args={[w * 0.82, 0.3, 0.006]} />
          </mesh>
          <mesh material={mats.chip} position={[0, -0.02, 0.0045]}>
            <planeGeometry args={[w * 0.42, w * 0.21]} />
          </mesh>
        </group>

        {/* Pil */}
        <group
          ref={(o) => {
            extra.current.battery = o;
          }}
          position={[0, -0.16, 0]}
        >
          <mesh material={mats.battery}>
            <boxGeometry args={[w * 0.8, 0.5, 0.012]} />
          </mesh>
          <mesh material={mats.batteryLabel} position={[0, 0, 0.0065]}>
            <planeGeometry args={[w * 0.6, w * 0.3]} />
          </mesh>
        </group>

        {/* S Pen (yuvasından alttan çıkar) */}
        <group ref={pen} position={[-w * 0.3, -0.22, -0.01]}>
          <mesh material={mats.pen}>
            <cylinderGeometry args={[0.0085, 0.0085, 0.42, 16]} />
          </mesh>
          <mesh material={mats.penTip} position={[0, -0.225, 0]}>
            <coneGeometry args={[0.0085, 0.03, 16]} />
          </mesh>
        </group>
      </group>
      <Warmup />
    </>
  );
}
