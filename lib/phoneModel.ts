import { useMemo } from 'react';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';

export const S26_URL = '/model/phone-opt.glb'; // ana sahnedeki S26 Ultra
export const S25_URL = '/model/s26-opt.glb'; // dosya adı yanıltıcı: içindeki model S25 Ultra (Sketchfab, vmmaniac, CC-BY-4.0)

// Gerçek ölçüler (mm), telefonlar aynı ölçekte görünsün diye
export const S26_HEIGHT_MM = 163.6;
export const S25_HEIGHT_MM = 162.8;

// Hafifletilmiş materyaller (sadece kopyada; ana sahnedeki telefon etkilenmez):
// transmission her karede sahneyi bir kez daha çizdirir, clearcoat da ek ışık hesabı demek. Görünüm farkı çok az.
function lighten(mat: THREE.Material) {
  const phys = mat as THREE.MeshPhysicalMaterial;
  if (!phys.isMeshPhysicalMaterial || (phys.transmission === 0 && phys.clearcoat === 0)) return mat;
  const c = phys.clone();
  if (c.transmission > 0) {
    c.transmission = 0;
    c.transparent = true;
    c.opacity = Math.min(c.opacity, 0.35);
    c.depthWrite = false;
  }
  c.clearcoat = 0;
  return c;
}

// Modeli normalize eder: en uzun ekseni dikey (Y), ekranı kameraya (+Z) dönük, merkezi orijinde, yüksekliği 1 birim.
// Ana sahnedeki telefonla aynı nesneyi paylaşmamak için kopya alınır.
// Dönen nesnenin userData.size'ı normalize edilmiş boyutlardır (yükseklik 1).
export function useNormalizedPhone(url: string) {
  const { scene } = useGLTF(url);
  return useMemo(() => {
    const copy = scene.clone(true);
    copy.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      m.material = Array.isArray(m.material) ? m.material.map(lighten) : lighten(m.material);
    });
    const inner = new THREE.Group();
    inner.add(copy);
    inner.updateMatrixWorld(true);

    let box = new THREE.Box3().setFromObject(inner);
    let size = box.getSize(new THREE.Vector3());
    if (size.z > size.y && size.z > size.x) inner.rotation.x = -Math.PI / 2;
    else if (size.x > size.y) inner.rotation.z = Math.PI / 2;
    inner.updateMatrixWorld(true);

    // Ekran yüzeyi arkada kaldıysa telefonu çevir (modeller farklı kaynaklardan)
    box = new THREE.Box3().setFromObject(inner);
    const center = box.getCenter(new THREE.Vector3());
    let screen: THREE.Object3D | undefined;
    inner.traverse((o) => {
      const m = o as THREE.Mesh;
      if (screen || !m.isMesh) return;
      const names = [o.name, ...(Array.isArray(m.material) ? m.material : [m.material]).map((x) => x.name)];
      if (names.some((n) => /display|screen/i.test(n))) screen = o;
    });
    if (screen) {
      const sc = new THREE.Box3().setFromObject(screen).getCenter(new THREE.Vector3());
      if (sc.z < center.z) inner.rotation.y += Math.PI;
    }
    inner.updateMatrixWorld(true);

    box = new THREE.Box3().setFromObject(inner);
    size = box.getSize(new THREE.Vector3());
    const c = box.getCenter(new THREE.Vector3());
    const holder = new THREE.Group();
    inner.position.sub(c);
    holder.add(inner);
    holder.scale.setScalar(1 / size.y);
    holder.userData.size = size.clone().divideScalar(size.y);
    return holder;
  }, [scene]);
}

// Yuvarlak köşeli düz dikdörtgen (telefon ekranı için), UV'leri 0-1 aralığında.
// uvSquare verilirse UV'ler o kenarlı kareye göre, merkezden ve en-boy oranı korunarak üretilir
// (dönen dokuda yamulma olmasın diye: three.js dokuyu önce döndürüp sonra ölçekler).
export function roundedRectGeometry(w: number, h: number, r: number, uvSquare?: number) {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  const g = new THREE.ShapeGeometry(s, 8);
  const pos = g.attributes.position;
  const uv = g.attributes.uv;
  for (let i = 0; i < pos.count; i++) {
    if (uvSquare) uv.setXY(i, pos.getX(i) / uvSquare + 0.5, pos.getY(i) / uvSquare + 0.5);
    else uv.setXY(i, (pos.getX(i) - x) / w, (pos.getY(i) - y) / h);
  }
  uv.needsUpdate = true;
  return g;
}

// 2D çizimden doku (bir kez çizilir; ekran içerikleri için ucuz)
export function canvasTexture(w: number, h: number, draw: (ctx: CanvasRenderingContext2D) => void) {
  const cv = document.createElement('canvas');
  cv.width = w;
  cv.height = h;
  const ctx = cv.getContext('2d');
  if (ctx) draw(ctx);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

// Patlamış görünüm için modelin parçalarını derinliğe göre üç gruba ayırır (normalize edilmiş telefonda):
// ön (ekran camı), orta (çerçeve, tuşlar), arka (arka cam, kamera adası). Gruplar telefonun içine eklenir;
// parçalar dünya konumları korunarak taşınır, gruplar Z'de kaydırılarak telefon "açılır".
export function splitPhoneLayers(holder: THREE.Object3D) {
  holder.updateMatrixWorld(true);
  const size = holder.userData.size as THREE.Vector3;
  const t = size.z * 0.2;
  const front = new THREE.Group();
  const mid = new THREE.Group();
  const back = new THREE.Group();
  holder.add(front, mid, back);
  holder.updateMatrixWorld(true);
  const meshes: THREE.Mesh[] = [];
  holder.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) meshes.push(o as THREE.Mesh);
  });
  const c = new THREE.Vector3();
  meshes.forEach((m) => {
    // holder'ın üstü yok: dünya koordinatları zaten normalize birimde (yükseklik 1)
    new THREE.Box3().setFromObject(m).getCenter(c);
    (c.z > t ? front : c.z < -t ? back : mid).attach(m);
  });
  return { front, mid, back };
}
