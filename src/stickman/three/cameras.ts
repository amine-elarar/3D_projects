// src/stickman/three/cameras.ts — camera moves (no shot is ever static).
// Ported from the GrowKaz Stickman kit (engine/three-kit.js → orbit / dolly).
// Call these hooks inside <StickStage> with the shot time t (useShotTime()).
import { useLayoutEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { clamp, ease, key, lerp, type EaseFn, type Keyframe } from '../math';

export type OrbitOpts = {
  target?: [number, number, number];
  /** Metres, or [start, end] to push in / pull out during the move. */
  radius?: number | [number, number];
  height?: number | [number, number];
  /** Start / end angle in radians (0 = camera on +z looking at target). */
  from?: number;
  to?: number;
  /** Duration of the move in seconds. */
  dur?: number;
  e?: EaseFn;
};

export function applyOrbit(camera: THREE.Camera, t: number, o: OrbitOpts = {}) {
  const { target = [0, 1, 0], radius = 8, height = 3, from = -0.6, to = 0.2, dur = 5, e = ease.inOut } = o;
  const k = e(clamp(t / dur));
  const a = lerp(from, to, k);
  const r = typeof radius === 'number' ? radius : lerp(radius[0], radius[1], k);
  const h = typeof height === 'number' ? height : lerp(height[0], height[1], k);
  camera.position.set(target[0] + Math.sin(a) * r, h, target[2] + Math.cos(a) * r);
  camera.lookAt(...target);
}

export type DollyKey = { pos: [number, number, number]; look: [number, number, number]; fov?: number };

export function applyDolly(camera: THREE.Camera, t: number, keys: Keyframe<DollyKey>[]) {
  const v = key(t, keys);
  camera.position.set(...v.pos);
  camera.lookAt(...v.look);
  if (v.fov && camera instanceof THREE.PerspectiveCamera) {
    camera.fov = v.fov;
    camera.updateProjectionMatrix();
  }
}

/** Orbit the default camera around a target. */
export function useOrbitCamera(t: number, o: OrbitOpts) {
  const camera = useThree((s) => s.camera);
  useLayoutEffect(() => {
    applyOrbit(camera, t, o);
  });
}

/** Keyframed fly-through: useDollyCamera(t, [[0, {pos, look}], [4, {pos, look, fov}]]). */
export function useDollyCamera(t: number, keys: Keyframe<DollyKey>[]) {
  const camera = useThree((s) => s.camera);
  useLayoutEffect(() => {
    applyDolly(camera, t, keys);
  });
}
