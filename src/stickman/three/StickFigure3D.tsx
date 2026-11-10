// src/stickman/three/StickFigure3D.tsx — the iconic 3D stick figure (shares POSES with the 2D rig).
// Look: sleek matte-satin limbs (cylinders + sphere joints) that catch 3-point cinematic lighting,
// a sphere head with two glowing eyes, signature outfits, and the "rim light" back-face hull (1.2× wider)
// that creates a crisp glowing silhouette edge. Units are metres, a figure is ≈ 1.7 m tall and faces +x.
import React, { useLayoutEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useStick } from '../StyleContext';
import { shade } from '../math';
import { pose as toPose, type JointName, type PoseLike } from '../poses';
import type { Outfit } from '../outfits';

const U = 1 / 140; // 2D rig units → metres

type Limb = { a: JointName; b: JointName; r: number; core: THREE.Mesh; ol: THREE.Mesh; j: THREE.Mesh; jo: THREE.Mesh };

type FigureRig = { root: THREE.Group; setPose: (p: PoseLike) => void; dispose: () => void };

function buildFigure(outfit: Outfit, ink: string, rim: string, feature: string, s: number): FigureRig {
  const disposables: { dispose: () => void }[] = [];
  const track = <T extends { dispose: () => void }>(x: T) => (disposables.push(x), x);
  const mat = (c: string, o: THREE.MeshStandardMaterialParameters = {}) =>
    track(new THREE.MeshStandardMaterial({ color: new THREE.Color(c), roughness: 0.55, metalness: 0.15, ...o }));

  const inkM = mat(ink, { roughness: 0.5, metalness: 0.18 });
  const out = track(new THREE.MeshBasicMaterial({ color: new THREE.Color(rim), side: THREE.BackSide }));
  const root = new THREE.Group(),
    g = new THREE.Group();
  root.add(g);
  g.scale.setScalar(s * (outfit.kid ? 0.72 : 1));
  const cylGeo = track(new THREE.CylinderGeometry(1, 1, 1, 16)),
    sphGeo = track(new THREE.SphereGeometry(1, 20, 16));
  const clothes =
    outfit.top && outfit.top !== 'none'
      ? mat(outfit.top === 'labcoat' ? '#ebe7f0' : outfit.color || '#d64a33', { roughness: 0.6, metalness: 0.08 })
      : null;
  const legsM = outfit.legs ? mat(outfit.legs) : inkM;
  const limbs: Limb[] = [];
  const mk = (a: JointName, b: JointName, r: number, m: THREE.Material = inkM) => {
    const core = new THREE.Mesh(cylGeo, m),
      ol = new THREE.Mesh(cylGeo, out);
    core.castShadow = true;
    core.receiveShadow = true;
    g.add(ol, core);
    const j = new THREE.Mesh(sphGeo, m),
      jo = new THREE.Mesh(sphGeo, out);
    j.castShadow = true;
    j.receiveShadow = true;
    g.add(jo, j);
    limbs.push({ a, b, r, core, ol, j, jo });
  };
  const long = ['hoodie', 'tracksuit', 'labcoat', 'trench', 'suit'].includes(outfit.top ?? '');
  const sleeve = clothes && outfit.top !== 'dress';
  mk('sh', 'hip', clothes ? 0.085 : 0.05, clothes || inkM);
  mk('hip', 'kF', 0.045);
  mk('kF', 'fF', 0.042, legsM);
  mk('hip', 'kB', 0.045);
  mk('kB', 'fB', 0.042, legsM);
  mk('sh', 'eF', sleeve ? 0.055 : 0.04, sleeve ? clothes : inkM);
  mk('eF', 'hF', long ? 0.05 : 0.038, long && clothes ? clothes : inkM);
  mk('sh', 'eB', sleeve ? 0.055 : 0.04, sleeve ? clothes : inkM);
  mk('eB', 'hB', long ? 0.05 : 0.038, long && clothes ? clothes : inkM);

  // head: ink sphere + rim hull + eyes on the +x (facing) side
  const head = new THREE.Group();
  const hs = new THREE.Mesh(sphGeo, inkM);
  hs.scale.setScalar(26 * U);
  hs.castShadow = true;
  hs.receiveShadow = true;
  const ho = new THREE.Mesh(sphGeo, out);
  ho.scale.setScalar(26 * U * 1.08);
  head.add(ho, hs);
  const eyeM = track(new THREE.MeshBasicMaterial({ color: new THREE.Color(feature) }));
  for (const z of [-0.06, 0.06]) {
    const e = new THREE.Mesh(sphGeo, eyeM);
    e.scale.setScalar(0.022);
    e.position.set(0.17, 0.02, z);
    head.add(e);
  }
  // headwear
  const hc = outfit.headColor || '#f2c21a',
    hm = mat(hc, { roughness: 0.5 });
  if (outfit.head === 'cap' || outfit.head === 'capBack' || outfit.head === 'visor') {
    const dome = new THREE.Mesh(track(new THREE.SphereGeometry(0.195, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2)), hm);
    dome.position.y = 0.03;
    const brim = new THREE.Mesh(track(new THREE.CylinderGeometry(0.2, 0.2, 0.015, 20, 1, false, -0.9, 1.8)), hm);
    brim.position.set(outfit.head === 'capBack' ? -0.1 : 0.1, 0.04, 0);
    if (outfit.head === 'capBack') brim.rotation.y = Math.PI;
    head.add(dome, brim);
  }
  if (outfit.head === 'beanie') {
    const dome = new THREE.Mesh(track(new THREE.SphereGeometry(0.2, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2)), hm);
    dome.scale.y = 1.15;
    const pom = new THREE.Mesh(sphGeo, mat(shade(hc, 0.3)));
    pom.scale.setScalar(0.06);
    pom.position.y = 0.25;
    head.add(dome, pom);
  }
  if (outfit.head === 'fedora') {
    const brim = new THREE.Mesh(track(new THREE.CylinderGeometry(0.33, 0.33, 0.02, 24)), hm);
    brim.position.y = 0.1;
    const crown = new THREE.Mesh(track(new THREE.CylinderGeometry(0.15, 0.17, 0.17, 20)), hm);
    crown.position.y = 0.19;
    head.add(brim, crown);
  }
  if (outfit.head === 'headband') {
    const band = new THREE.Mesh(track(new THREE.TorusGeometry(0.19, 0.022, 8, 24)), hm);
    band.rotation.x = Math.PI / 2;
    band.position.y = 0.08;
    head.add(band);
  }
  if (outfit.head === 'hood') {
    const hood = new THREE.Mesh(sphGeo, mat(outfit.headColor || outfit.color || '#d64a33'));
    hood.scale.setScalar(0.23);
    hood.position.set(-0.04, 0.01, 0);
    head.add(hood);
  }
  g.add(head);

  // long coats / dresses: an open cone from the shoulders past the hips
  let coat: THREE.Mesh | null = null;
  if (clothes && (outfit.top === 'labcoat' || outfit.top === 'trench' || outfit.top === 'dress')) {
    const coatM = clothes.clone();
    coatM.side = THREE.DoubleSide;
    track(coatM);
    coat = new THREE.Mesh(track(new THREE.CylinderGeometry(0.11, 0.2, 1, 12, 1, true)), coatM);
    coat.castShadow = true;
    coat.receiveShadow = true;
    g.add(coat);
  }

  // rig point → 3D (near limbs at +z, far limbs at -z)
  const P3 = (p: [number, number], k: string) => {
    const near = /F$/.test(k) ? 0.1 : /B$/.test(k) ? -0.1 : 0;
    return new THREE.Vector3(p[0] * U, -p[1] * U, near);
  };
  const up = new THREE.Vector3(0, 1, 0),
    tmp = new THREE.Vector3();
  const setPose = (pl: PoseLike) => {
    const p = toPose(pl);
    for (const L of limbs) {
      const A = P3(p[L.a], L.a),
        B = P3(p[L.b], L.b);
      const len = A.distanceTo(B);
      tmp.copy(B).sub(A).normalize();
      for (const [m, k] of [
        [L.core, 1],
        [L.ol, 1.2],
      ] as const) {
        m.position.copy(A).add(B).multiplyScalar(0.5);
        m.quaternion.setFromUnitVectors(up, tmp);
        m.scale.set(L.r * k, len, L.r * k);
      }
      L.j.position.copy(B);
      L.j.scale.setScalar(L.r);
      L.jo.position.copy(B);
      L.jo.scale.setScalar(L.r * 1.2);
    }
    head.position.copy(P3(p.head, 'head'));
    if (coat) {
      const S0 = P3(p.sh, 'sh'),
        Hp = P3(p.hip, 'hip');
      const bottom = Hp.clone().add(new THREE.Vector3(0, outfit.top === 'dress' ? -0.3 : -0.42, 0));
      coat.position.copy(S0).add(bottom).multiplyScalar(0.5);
      coat.scale.y = S0.distanceTo(bottom);
      coat.quaternion.setFromUnitVectors(up, tmp.copy(S0).sub(bottom).normalize());
    }
  };
  setPose('stand');
  return { root, setPose, dispose: () => disposables.forEach((d) => d.dispose()) };
}

export type StickFigure3DProps = {
  outfit?: Outfit;
  /** Pose name or pose object; recompute per frame (posesAt / breathe / walkPose) for animation. */
  pose?: PoseLike;
  /** Rim (outline) colour. Defaults to the current mood's rim. */
  rim?: string;
  /** Uniform scale (1 = 1.7 m). */
  s?: number;
  position?: [number, number, number];
  /** Y rotation in radians. 0 faces +x, Math.PI faces -x. */
  rotationY?: number;
};

export const StickFigure3D: React.FC<StickFigure3DProps> = ({
  outfit = {},
  pose = 'stand',
  rim,
  s = 1,
  position,
  rotationY = 0,
}) => {
  const { style, M } = useStick();
  const rimColor = rim ?? M.rim;
  const outfitKey = JSON.stringify(outfit);
  const rig = useMemo(
    () => buildFigure(JSON.parse(outfitKey) as Outfit, style.ink, rimColor, style.feature, s),
    [outfitKey, style.ink, style.feature, rimColor, s],
  );
  useLayoutEffect(() => () => rig.dispose(), [rig]);
  // Apply the pose synchronously during the frame's commit, before Remotion advances the R3F frame.
  useLayoutEffect(() => {
    rig.setPose(pose);
  });
  return <primitive object={rig.root} position={position} rotation={[0, rotationY, 0]} />;
};
