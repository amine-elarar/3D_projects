// src/stickman/math.ts — deterministic timing, easing and colour helpers.
// Ported from the GrowKaz Stickman kit (engine/core.js). Never use Math.random()/Date.now()
// in scenes: use rng(seed) and the shot time `t` so every frame renders identically.

export const clamp = (x: number, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
/** 0→1 progress of t between a and b (clamped). */
export const prog = (t: number, a: number, b: number) => clamp((t - a) / (b - a));

export type EaseFn = (x: number) => number;
export const ease = {
  linear: (x: number) => clamp(x),
  in: (x: number) => clamp(x) ** 3,
  out: (x: number) => 1 - (1 - clamp(x)) ** 3,
  inOut: (x: number) => {
    x = clamp(x);
    return x < 0.5 ? 4 * x ** 3 : 1 - (-2 * x + 2) ** 3 / 2;
  },
  sine: (x: number) => -(Math.cos(Math.PI * clamp(x)) - 1) / 2,
  outBack: (x: number) => {
    x = clamp(x);
    const c1 = 1.70158,
      c3 = c1 + 1;
    return 1 + c3 * (x - 1) ** 3 + c1 * (x - 1) ** 2;
  },
  outElastic: (x: number) => {
    x = clamp(x);
    return x === 0 || x === 1 ? x : 2 ** (-10 * x) * Math.sin(((x * 10 - 0.75) * (2 * Math.PI)) / 3) + 1;
  },
} satisfies Record<string, EaseFn>;

/** Interpolates numbers, arrays and plain objects of numbers (non-numeric fields switch at k = 0.5). */
export function mixVal<T>(a: T, b: T, k: number): T {
  if (typeof a === 'number') return lerp(a, b as number, k) as T;
  if (Array.isArray(a)) return a.map((v, i) => mixVal(v, (b as unknown[])[i], k)) as T;
  const o: Record<string, unknown> = {};
  const A = a as Record<string, unknown>,
    B = b as Record<string, unknown>;
  for (const kk in A) {
    const av = A[kk];
    o[kk] = typeof av === 'number' || Array.isArray(av) ? mixVal(av, B[kk] ?? av, k) : k < 0.5 ? av : (B[kk] ?? av);
  }
  return o as T;
}

export type Keyframe<T> = [number, T] | [number, T, EaseFn];
/** key(t, [[0, 1], [2, 1.2], [4, 1]]) → eased keyframe interpolation of numbers / arrays / objects. */
export function key<T>(t: number, frames: Keyframe<T>[], fn: EaseFn = ease.inOut): T {
  if (t <= frames[0][0]) return frames[0][1];
  for (let i = 1; i < frames.length; i++) {
    const [t1, v1] = frames[i];
    if (t <= t1) {
      const [t0, v0] = frames[i - 1];
      return mixVal(v0, v1, (frames[i][2] || fn)((t - t0) / (t1 - t0)));
    }
  }
  return frames[frames.length - 1][1];
}

/** Seeded PRNG (mulberry32). Returns a function producing floats in [0, 1). */
export function rng(seed = 1) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const hash = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};
/** Smooth 1D value noise in [-1, 1]. */
export function noise(x: number, seed = 0) {
  const i = Math.floor(x),
    f = x - i,
    u = f * f * (3 - 2 * f);
  return lerp(hash(i + seed * 57), hash(i + 1 + seed * 57), u) * 2 - 1;
}
/** Camera shake offset [dx, dy]. */
export const shake = (t: number, amp = 4, freq = 1.3, seed = 3): [number, number] => [
  noise(t * freq, seed) * amp,
  noise(t * freq, seed + 9) * amp,
];

// ---------- colour ----------
const hexToRgb = (c: string): [number, number, number] => {
  let h = c.replace('#', '');
  if (h.length === 3) h = h.split('').map((x) => x + x).join('');
  const n = parseInt(h.slice(0, 6), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const toHex = (v: number[]) => '#' + v.map((x) => ('0' + Math.round(clamp(x, 0, 255)).toString(16)).slice(-2)).join('');
/** Linear mix of two hex colours. */
export const mix = (c1: string, c2: string, k: number) => {
  const a = hexToRgb(c1),
    b = hexToRgb(c2);
  return toHex(a.map((v, i) => lerp(v, b[i], k)));
};
/** shade(c, -0.3) darkens 30% toward black, shade(c, 0.3) lightens toward white. */
export const shade = (c: string, k: number) => (k < 0 ? mix(c, '#000000', -k) : mix(c, '#ffffff', k));
export const alpha = (c: string, a: number) => {
  const [r, g, b] = hexToRgb(c);
  return `rgba(${r},${g},${b},${a})`;
};
