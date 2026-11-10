// src/stickman/poses.ts — the shared stick-figure skeleton poses (used by the 3D figure, and a future 2D rig).
// Ported from the GrowKaz Stickman kit (engine/rig2d.js).
// Rig space: feet on y = 0, up is -y, the figure faces +x, base height ≈ 240 units (1 unit = 1/140 m in 3D).
// Points: head, sh (neck/shoulder), hip, eF/hF = near elbow/hand, eB/hB = far elbow/hand,
//         kF/fF = near knee/foot, kB/fB = far knee/foot.
import { clamp, ease, lerp, mixVal } from './math';

export type Pt = [number, number];
export type JointName = 'head' | 'sh' | 'hip' | 'eF' | 'hF' | 'eB' | 'hB' | 'kF' | 'fF' | 'kB' | 'fB';
export type Pose = Record<JointName, Pt>;

const POSE_TABLE = {
  stand:      ({ head: [3, -208], sh: [0, -174], hip: [0, -100], eF: [9, -137], hF: [13, -101], eB: [-7, -136], hB: [-9, -100], kF: [6, -50], fF: [3, 0], kB: [-6, -50], fB: [-11, 0] }),
  relaxed:    ({ head: [4, -207], sh: [1, -173], hip: [0, -100], eF: [12, -138], hF: [20, -106], eB: [-8, -137], hB: [-14, -104], kF: [8, -50], fF: [10, 0], kB: [-4, -50], fB: [-12, 0] }),
  talk:       ({ head: [5, -208], sh: [1, -174], hip: [0, -100], eF: [22, -132], hF: [42, -146], eB: [-7, -136], hB: [-9, -100], kF: [6, -50], fF: [3, 0], kB: [-6, -50], fB: [-11, 0] }),
  explain:    ({ head: [5, -208], sh: [1, -174], hip: [0, -100], eF: [24, -136], hF: [46, -156], eB: [16, -134], hB: [34, -148], kF: [6, -50], fF: [3, 0], kB: [-6, -50], fB: [-11, 0] }),
  point:      ({ head: [5, -208], sh: [1, -174], hip: [0, -100], eF: [34, -170], hF: [68, -172], eB: [-7, -136], hB: [-9, -100], kF: [6, -50], fF: [6, 0], kB: [-6, -50], fB: [-12, 0] }),
  pointUp:    ({ head: [4, -209], sh: [1, -174], hip: [0, -100], eF: [18, -206], hF: [22, -246], eB: [-7, -136], hB: [-9, -100], kF: [6, -50], fF: [3, 0], kB: [-6, -50], fB: [-11, 0] }),
  wave:       ({ head: [4, -209], sh: [1, -174], hip: [0, -100], eF: [28, -196], hF: [36, -236], eB: [-7, -136], hB: [-9, -100], kF: [6, -50], fF: [3, 0], kB: [-6, -50], fB: [-11, 0] }),
  cheer:      ({ head: [3, -212], sh: [0, -176], hip: [0, -100], eF: [22, -206], hF: [36, -246], eB: [-20, -206], hB: [-32, -246], kF: [10, -50], fF: [16, 0], kB: [-10, -50], fB: [-16, 0] }),
  handsOnHead:({ head: [3, -208], sh: [0, -174], hip: [0, -100], eF: [32, -196], hF: [12, -230], eB: [-28, -196], hB: [-8, -232], kF: [6, -50], fF: [3, 0], kB: [-6, -50], fB: [-11, 0] }),
  crossArms:  ({ head: [2, -208], sh: [0, -174], hip: [0, -100], eF: [16, -142], hF: [-8, -150], eB: [10, -144], hB: [14, -152], kF: [6, -50], fF: [6, 0], kB: [-6, -50], fB: [-12, 0] }),
  think:      ({ head: [6, -206], sh: [1, -173], hip: [0, -100], eF: [24, -148], hF: [16, -192], eB: [16, -134], hB: [6, -140], kF: [6, -50], fF: [3, 0], kB: [-6, -50], fB: [-11, 0] }),
  shrug:      ({ head: [3, -206], sh: [0, -172], hip: [0, -100], eF: [26, -156], hF: [40, -176], eB: [-24, -156], hB: [-38, -176], kF: [6, -50], fF: [3, 0], kB: [-6, -50], fB: [-11, 0] }),
  holdFront:  ({ head: [5, -207], sh: [1, -173], hip: [0, -100], eF: [22, -140], hF: [36, -152], eB: [16, -142], hB: [30, -154], kF: [6, -50], fF: [3, 0], kB: [-6, -50], fB: [-11, 0] }),
  phone:      ({ head: [6, -204], sh: [1, -172], hip: [0, -100], eF: [20, -138], hF: [28, -166], eB: [-7, -136], hB: [-9, -100], kF: [6, -50], fF: [3, 0], kB: [-6, -50], fB: [-11, 0] }),
  reach:      ({ head: [8, -206], sh: [4, -172], hip: [0, -100], eF: [34, -186], hF: [62, -204], eB: [-6, -136], hB: [-10, -102], kF: [10, -50], fF: [12, 0], kB: [-6, -50], fB: [-18, 0] }),
  sad:        ({ head: [12, -192], sh: [6, -166], hip: [0, -100], eF: [10, -132], hF: [12, -98], eB: [-2, -132], hB: [-2, -98], kF: [6, -50], fF: [3, 0], kB: [-6, -50], fB: [-11, 0] }),
  facepalm:   ({ head: [8, -200], sh: [2, -170], hip: [0, -100], eF: [28, -160], hF: [26, -200], eB: [-7, -136], hB: [-9, -100], kF: [6, -50], fF: [3, 0], kB: [-6, -50], fB: [-11, 0] }),
  ready:      ({ head: [12, -182], sh: [6, -148], hip: [0, -80], eF: [34, -132], hF: [56, -146], eB: [-26, -132], hB: [-46, -146], kF: [26, -44], fF: [22, 0], kB: [-24, -44], fB: [-24, 0] }),
  crouch:     ({ head: [16, -150], sh: [8, -118], hip: [0, -58], eF: [28, -88], hF: [38, -60], eB: [18, -86], hB: [26, -58], kF: [34, -54], fF: [20, 0], kB: [20, -50], fB: [-8, 0] }),
  sit:        ({ head: [4, -180], sh: [1, -146], hip: [0, -72], eF: [16, -110], hF: [38, -84], eB: [10, -110], hB: [30, -84], kF: [44, -74], fF: [46, 0], kB: [40, -72], fB: [38, 0] }),
  sitBack:    ({ head: [-8, -176], sh: [-6, -144], hip: [0, -72], eF: [2, -108], hF: [26, -86], eB: [-14, -110], hB: [-24, -80], kF: [44, -78], fF: [54, -2], kB: [40, -76], fB: [44, 0] }),
  kneel:      ({ head: [10, -168], sh: [5, -134], hip: [0, -62], eF: [24, -100], hF: [38, -76], eB: [-4, -100], hB: [-6, -66], kF: [36, -46], fF: [36, 0], kB: [-6, -4], fB: [-48, 0] }),
  lie:        ({ head: [3, -208], sh: [0, -174], hip: [0, -100], eF: [14, -136], hF: [18, -100], eB: [-12, -138], hB: [-20, -104], kF: [4, -50], fF: [2, 0], kB: [-4, -50], fB: [-6, 0] }), // use with rot: ±Math.PI/2
  dive:       ({ head: [4, -212], sh: [0, -176], hip: [0, -100], eF: [8, -218], hF: [12, -256], eB: [-6, -218], hB: [-4, -254], kF: [8, -52], fF: [10, -2], kB: [-6, -54], fB: [-14, -8] }), // with rot
  kick:       ({ head: [-4, -206], sh: [-6, -172], hip: [0, -100], eF: [8, -140], hF: [24, -124], eB: [-24, -140], hB: [-42, -128], kF: [36, -78], fF: [66, -70], kB: [-4, -50], fB: [-8, 0] }),
  jump:       ({ head: [4, -232], sh: [1, -198], hip: [0, -124], eF: [24, -226], hF: [32, -266], eB: [-18, -226], hB: [-26, -266], kF: [16, -82], fF: [6, -48], kB: [-12, -84], fB: [-22, -50] }),
  fall:       ({ head: [-10, -196], sh: [-8, -164], hip: [0, -100], eF: [24, -196], hF: [44, -222], eB: [-34, -186], hB: [-58, -204], kF: [24, -58], fF: [44, -28], kB: [-10, -54], fB: [-6, -8] }),
} satisfies Record<string, Pose>;

export type PoseName = keyof typeof POSE_TABLE;
export const POSES: Record<PoseName, Pose> = POSE_TABLE as Record<PoseName, Pose>;
export type PoseLike = PoseName | Pose;

// ---------- pose helpers ----------
export const pose = (p: PoseLike): Pose => (typeof p === 'string' ? (POSES[p] ?? POSES.stand) : p);
export const blendPose = (a: PoseLike, b: PoseLike, k: number): Pose => mixVal(pose(a), pose(b), ease.inOut(k));

/** posesAt(t, [[0,'stand'],[1.2,'talk'],[3,'point']], 0.35) → holds each pose, blends over `blend` seconds. */
export function posesAt(t: number, keys: [number, PoseLike][], blend = 0.35): Pose {
  let cur: PoseLike = keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [ti, pi] = keys[i];
    if (t < ti) break;
    const k = clamp((t - ti) / blend);
    if (k < 1) return blendPose(cur, pi, k);
    cur = pi;
  }
  return pose(cur);
}

/** Small idle life (breathing + sway) on top of any pose, so nobody is frozen. Use a different seed per character. */
export function breathe(p: PoseLike, t: number, amt = 1, seed = 0): Pose {
  const P = pose(p);
  const b = Math.sin(t * 2.1 + seed) * 1.6 * amt,
    s = Math.sin(t * 0.9 + seed * 2) * 1.2 * amt;
  const q = { ...P };
  for (const k of ['head', 'sh', 'eF', 'hF', 'eB', 'hB'] as const) q[k] = [P[k][0] + s * (k === 'head' ? 1.2 : 0.6), P[k][1] + b];
  return q;
}

function ik(a: Pt, b: Pt, L1: number, L2: number, dir = 1): Pt {
  const dx = b[0] - a[0],
    dy = b[1] - a[1];
  let d = Math.hypot(dx, dy);
  d = Math.min(d, L1 + L2 - 0.01);
  const ang = Math.atan2(dy, dx) - dir * Math.acos(clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1));
  return [a[0] + Math.cos(ang) * L1, a[1] + Math.sin(ang) * L1];
}

/**
 * Walk / run cycle. phase = t × 2π × 0.9 (walk) or × 1.6 (run).
 * Move the figure at a matching speed: walk ≈ 160 rig units/s (≈ 1.14 m/s), run ≈ 420 units/s (≈ 3 m/s).
 */
export function walkPose(
  phase: number,
  o: { stride?: number; lift?: number; bob?: number; arm?: number; lean?: number; run?: boolean } = {},
): Pose {
  const { stride = 26, lift = 12, bob = 3, arm = 16, lean = 2, run = false } = o;
  const st = run ? 46 : stride,
    li = run ? 34 : lift,
    bb = run ? 7 : bob,
    ar = run ? 30 : arm,
    le = run ? 14 : lean;
  const hipY = -100 + (run ? 6 : 0) - bb * (1 - Math.abs(Math.sin(phase))) + bb * 0.5;
  const hip: Pt = [0, hipY],
    sh: Pt = [le, hipY - 74],
    head: Pt = [le + 4, hipY - 108];
  const foot = (ph: number): Pt => [st * Math.sin(ph), -li * Math.max(0, Math.cos(ph))];
  const fF = foot(phase),
    fB = foot(phase + Math.PI);
  const kF = ik(hip, fF, 52, 52, 1),
    kB = ik(hip, fB, 52, 52, 1);
  const hand = (ph: number): Pt =>
    run ? [le + ar * Math.sin(ph) * 0.9 + 6, hipY - 46 - Math.cos(ph) * 10] : [le * 0.5 - ar * Math.sin(ph) + 4, hipY - 2];
  const hF = hand(phase + Math.PI),
    hB = hand(phase);
  const elbow = (h: Pt): Pt =>
    run ? [lerp(sh[0], h[0], 0.5) - 14, lerp(sh[1], h[1], 0.5) + 6] : [lerp(sh[0], h[0], 0.5) - 3, sh[1] + 38];
  return { head, sh, hip, eF: elbow(hF), hF, eB: elbow(hB), hB, kF, fF, kB, fB };
}

/** Edit a copy of a pose: withPose('sit', { hF: [34, -170] }). */
export const withPose = (base: PoseLike, patch: Partial<Pose>): Pose => ({ ...pose(base), ...patch });
