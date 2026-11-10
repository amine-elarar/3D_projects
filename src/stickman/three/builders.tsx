// src/stickman/three/builders.tsx — low-poly set pieces for 3D shots.
// Ported from the GrowKaz Stickman kit (engine/three-kit.js builders). Units are metres.
// Colours should come from useStick().M (mood) so style switching re-themes the set.
import React, { useLayoutEffect, useMemo } from 'react';
import * as THREE from 'three';
import { rng, shade } from '../math';
import { useStick } from '../StyleContext';

type V3 = [number, number, number];

/** The kit's default material: matte standard, optional flat shading for the low-poly look. */
export const stickMat = (c: string, o: THREE.MeshStandardMaterialParameters & { flat?: boolean } = {}) => {
  const { flat, ...rest } = o;
  return new THREE.MeshStandardMaterial({ color: new THREE.Color(c), roughness: 0.9, metalness: 0, flatShading: !!flat, ...rest });
};

/** Canvas-drawn texture (sRGB), optionally repeating. */
export function canvasTex(w: number, h: number, draw: (g: CanvasRenderingContext2D, w: number, h: number) => void, repeat?: [number, number]) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d')!, w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  if (repeat) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(...repeat);
  }
  return t;
}
export const tilesTex = (base = '#3a3a48', n = 8, rep: [number, number] = [4, 4]) =>
  canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = base;
    g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(0,0,0,.25)';
    g.lineWidth = 3;
    for (let i = 0; i <= n; i++) {
      g.beginPath(); g.moveTo((i * w) / n, 0); g.lineTo((i * w) / n, h); g.stroke();
      g.beginPath(); g.moveTo(0, (i * h) / n); g.lineTo(w, (i * h) / n); g.stroke();
    }
  }, rep);
export const planksTex = (base = '#6a4332', n = 16, rep: [number, number] = [4, 4]) =>
  canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = base;
    g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(0,0,0,.28)';
    g.lineWidth = 3;
    for (let x = 0; x <= w; x += w / n) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
  }, rep);

/** Builds a Three object once (per deps), disposes it on unmount, and mounts it. */
function useBuilt<T extends THREE.Object3D>(make: () => T, deps: unknown[]): T {
  const obj = useMemo(make, deps); // eslint-disable-line react-hooks/exhaustive-deps
  useLayoutEffect(
    () => () => {
      obj.traverse((x) => {
        const m = x as THREE.Mesh;
        m.geometry?.dispose();
        ([] as THREE.Material[]).concat((m.material as THREE.Material) || []).forEach((mm) => {
          (mm as THREE.MeshStandardMaterial).map?.dispose();
          mm.dispose();
        });
      });
    },
    [obj],
  );
  return obj;
}

type Placed = { position?: V3; rotation?: V3 };

// ---------- primitives (shadow-enabled, matte) ----------
export const Box: React.FC<Placed & { size: V3; color: string; flat?: boolean }> = ({ size, color, flat, position, rotation }) => (
  <mesh position={position} rotation={rotation} castShadow receiveShadow>
    <boxGeometry args={size} />
    <meshStandardMaterial color={color} roughness={0.9} metalness={0} flatShading={flat} />
  </mesh>
);
export const Cyl: React.FC<Placed & { rTop: number; rBottom: number; h: number; color: string; seg?: number }> = ({ rTop, rBottom, h, color, seg = 16, position, rotation }) => (
  <mesh position={position} rotation={rotation} castShadow receiveShadow>
    <cylinderGeometry args={[rTop, rBottom, h, seg]} />
    <meshStandardMaterial color={color} roughness={0.9} metalness={0} />
  </mesh>
);
export const Cone: React.FC<Placed & { r: number; h: number; color: string; seg?: number }> = ({ r, h, color, seg = 8, position, rotation }) => (
  <mesh position={position} rotation={rotation} castShadow receiveShadow>
    <coneGeometry args={[r, h, seg]} />
    <meshStandardMaterial color={color} roughness={0.9} metalness={0} flatShading />
  </mesh>
);
export const Sphere: React.FC<Placed & { r: number; color: string; flat?: boolean }> = ({ r, color, flat, position }) => (
  <mesh position={position} castShadow receiveShadow>
    <sphereGeometry args={[r, flat ? 8 : 24, flat ? 6 : 16]} />
    <meshStandardMaterial color={color} roughness={0.9} metalness={0} flatShading={flat} />
  </mesh>
);

/** Floor plane. Defaults to the mood's floor colour with a tile grid. Keep floors dark. */
export const Ground: React.FC<{ w?: number; d?: number; color?: string; texture?: 'tiles' | 'planks' | 'none'; cells?: number; repeat?: [number, number]; y?: number }> = ({
  w = 60, d = 60, color, texture = 'tiles', cells = 10, repeat = [10, 10], y = 0,
}) => {
  const { M } = useStick();
  const c = color ?? M.floor;
  const obj = useBuilt(() => {
    const tex = texture === 'tiles' ? tilesTex(c, cells, repeat) : texture === 'planks' ? planksTex(c, cells, repeat) : null;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), stickMat('#ffffff', { color: new THREE.Color(c), map: tex }));
    m.rotation.x = -Math.PI / 2;
    m.position.y = y;
    m.receiveShadow = true;
    return m;
  }, [w, d, c, texture, cells, repeat.join(','), y]);
  return <primitive object={obj} />;
};

/** Glowing window (the signature element). Unlit material so it's one of the brightest things in frame. */
export const WindowPane: React.FC<Placed & { w: number; h: number; glowColor?: string; frame?: string; cols?: number; rows?: number; power?: number; lit?: boolean; interior?: boolean }> = ({
  w, h, glowColor, frame = '#2b1a12', cols = 4, rows = 5, power = 0.85, lit = true, interior = false, position, rotation,
}) => {
  const { M } = useStick();
  const glow = glowColor ?? M.practical;
  const obj = useBuilt(() => {
    const t = canvasTex(256, Math.round((256 * h) / w), (g, W, H) => {
      if (lit) {
        const gr = g.createLinearGradient(0, 0, 0, H);
        gr.addColorStop(0, glow);
        gr.addColorStop(1, shade(glow, -0.45));
        g.fillStyle = gr;
      } else g.fillStyle = '#1a1c2a';
      g.fillRect(0, 0, W, H);
      if (interior) {
        // silhouettes of a counter, bottles and a lamp seen through the glass
        g.fillStyle = 'rgba(30,18,14,.75)';
        g.fillRect(0, H * 0.6, W, 8);
        for (let k = 0; k < 7; k++) g.fillRect(14 + k * 34, H * 0.6 - 30 - (k % 3) * 8, 14, 30 + (k % 3) * 8);
        g.beginPath(); g.arc(W * 0.7, H * 0.9, W * 0.12, 0, 7); g.fill();
      }
      g.fillStyle = frame;
      for (let i = 0; i <= cols; i++) g.fillRect((i * W) / cols - 5, 0, 10, H);
      for (let j = 0; j <= rows; j++) g.fillRect(0, (j * H) / rows - 5, W, 10);
    });
    return new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: t, color: new THREE.Color(power, power * 0.95, power * 0.85) }));
  }, [w, h, glow, frame, cols, rows, power, lit, interior]);
  return <primitive object={obj} position={position} rotation={rotation} />;
};

let shaftTexCache: THREE.Texture | null = null;
const shaftTex = () =>
  (shaftTexCache ||= canvasTex(64, 256, (g, W, H) => {
    const gr = g.createLinearGradient(0, 0, 0, H);
    gr.addColorStop(0, 'rgba(255,255,255,1)');
    gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr;
    g.fillRect(0, 0, W, H);
    const gx = g.createLinearGradient(0, 0, W, 0);
    gx.addColorStop(0, 'rgba(0,0,0,1)'); gx.addColorStop(0.2, 'rgba(0,0,0,0)'); gx.addColorStop(0.8, 'rgba(0,0,0,0)'); gx.addColorStop(1, 'rgba(0,0,0,1)');
    g.globalCompositeOperation = 'destination-out';
    g.fillStyle = gx;
    g.fillRect(0, 0, W, H);
  }));

/** Soft additive light shaft / god ray (e.g. from a window onto the floor). */
export const LightShaft: React.FC<Placed & { w: number; len: number; color?: string; opacity?: number }> = ({ w, len, color, opacity = 0.05, position, rotation }) => {
  const { M } = useStick();
  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[w, len]} />
      <meshBasicMaterial color={color ?? M.practical} map={shaftTex()} transparent opacity={opacity} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
    </mesh>
  );
};

/** Building with an emissive lit-window grid on its front (+z) face. Sits on y = 0. */
export const Building: React.FC<{ w: number; h: number; d: number; color?: string; win?: string; lit?: number; seed?: number; position?: V3; rotationY?: number }> = ({
  w, h, d, color, win, lit = 0.55, seed = 3, position = [0, 0, 0], rotationY = 0,
}) => {
  const { M } = useStick();
  const col = color ?? shade(M.wall, -0.2);
  const wc = win ?? M.practical;
  const obj = useBuilt(() => {
    const r = rng(seed);
    const cols = Math.max(2, Math.round(w / 1.6)),
      rows = Math.max(2, Math.round(h / 2.2));
    const t = canvasTex(cols * 32, rows * 40, (g, W, H) => {
      g.fillStyle = col;
      g.fillRect(0, 0, W, H);
      for (let i = 0; i < cols; i++)
        for (let j = 0; j < rows; j++) {
          g.fillStyle = r() < lit ? wc : shade(col, -0.35);
          g.fillRect(i * 32 + 8, j * 40 + 10, 16, 22);
        }
    });
    const front = new THREE.MeshStandardMaterial({ map: t, emissiveMap: t, emissive: new THREE.Color('#ffffff'), emissiveIntensity: 0.55, roughness: 1 });
    const side = stickMat(col);
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), [side, side, side, side, front, side]);
    m.castShadow = m.receiveShadow = true;
    m.position.y = h / 2;
    const g = new THREE.Group();
    g.add(m);
    return g;
  }, [w, h, d, col, wc, lit, seed]);
  return <primitive object={obj} position={position} rotation={[0, rotationY, 0]} />;
};

/** Round low-poly tree silhouette. */
export const Tree3D: React.FC<{ x: number; z: number; s?: number; color?: string }> = ({ x, z, s = 1, color }) => {
  const { M } = useStick();
  const c = color ?? shade(M.dark, 0.08);
  return (
    <group position={[x, 0, z]}>
      <Cyl rTop={0.12 * s} rBottom={0.16 * s} h={2.2 * s} color={c} seg={8} position={[0, 1.1 * s, 0]} />
      {([[0, 3, 0, 1.1], [-0.6, 2.5, 0.3, 0.8], [0.6, 2.6, -0.2, 0.85]] as const).map(([dx, dy, dz, r], i) => (
        <Sphere key={i} r={r * s} color={c} flat position={[dx * s, dy * s, dz * s]} />
      ))}
    </group>
  );
};
export const Pine3D: React.FC<{ x: number; z: number; s?: number; color?: string }> = ({ x, z, s = 1, color }) => {
  const { M } = useStick();
  return <Cone r={0.7 * s} h={4 * s} color={color ?? shade(M.dark, 0.08)} seg={7} position={[x, 2 * s, z]} />;
};

/** Instanced crowd on tiered stands: rows along x, stepping back in z and up in y. */
export const Crowd3D: React.FC<{ rows?: number; perRow?: number; width?: number; step?: number; rise?: number; colors?: string[]; seed?: number; z0?: number; y0?: number }> = ({
  rows = 12, perRow = 80, width = 60, step = 0.8, rise = 0.5, colors = ['#3a3358', '#4a4068', '#2e2a48', '#5a4a70'], seed = 4, z0 = 0, y0 = 0,
}) => {
  const obj = useBuilt(() => {
    const r = rng(seed);
    const mesh = new THREE.InstancedMesh(new THREE.CapsuleGeometry(0.16, 0.45, 3, 6), stickMat('#ffffff'), rows * perRow);
    const m4 = new THREE.Matrix4(),
      col = new THREE.Color();
    let i = 0;
    for (let j = 0; j < rows; j++)
      for (let k = 0; k < perRow; k++) {
        m4.makeTranslation(-width / 2 + (k + r() * 0.5) * (width / perRow), y0 + j * rise + 0.5, z0 - j * step);
        mesh.setMatrixAt(i, m4);
        mesh.setColorAt(i, col.set(colors[Math.floor(r() * colors.length)]));
        i++;
      }
    mesh.castShadow = true;
    const g = new THREE.Group();
    g.add(mesh);
    return g;
  }, [rows, perRow, width, step, rise, colors.join(','), seed, z0, y0]);
  return <primitive object={obj} />;
};

let dotTexCache: THREE.Texture | null = null;
const dotTex = () =>
  (dotTexCache ||= canvasTex(64, 64, (g, W, H) => {
    const gr = g.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W / 2);
    gr.addColorStop(0, 'rgba(255,255,255,1)');
    gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr;
    g.fillRect(0, 0, W, H);
  }));

/**
 * Floating dust motes (atmosphere in nearly every shot). Deterministic: positions come from the seed and t.
 * `area` = [width, height, depth] of the box centred at `center`.
 */
export const Dust3D: React.FC<{ t: number; count?: number; area?: V3; center?: V3; color?: string; size?: number; speed?: number; opacity?: number; seed?: number }> = ({
  t, count = 160, area = [12, 4, 8], center = [0, 2, 0], color = '#ffe9d2', size = 0.05, speed = 0.12, opacity = 0.7, seed = 3,
}) => {
  const seeds = useMemo(() => {
    const r = rng(seed);
    return Array.from({ length: count }, () => [r(), r(), r(), r() * 6.28, 0.4 + r() * 1.2]);
  }, [count, seed]);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    return g;
  }, [count]);
  useLayoutEffect(() => () => geo.dispose(), [geo]);
  useLayoutEffect(() => {
    const p = geo.attributes.position as THREE.BufferAttribute;
    const [W, H, D] = area;
    seeds.forEach(([x, y, z, ph, s], i) => {
      const yy = (((y * H + t * speed * s) % H) + H) % H; // drift upward, wrap
      p.setXYZ(i, center[0] - W / 2 + x * W + Math.sin(t * 0.5 + ph) * 0.15, center[1] - H / 2 + yy, center[2] - D / 2 + z * D + Math.cos(t * 0.4 + ph) * 0.1);
    });
    p.needsUpdate = true;
  });
  return (
    <points geometry={geo}>
      <pointsMaterial color={color} map={dotTex()} size={size} sizeAttenuation transparent opacity={opacity} depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
};
