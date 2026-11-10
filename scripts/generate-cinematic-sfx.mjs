// scripts/generate-cinematic-sfx.mjs — Generates a 48.0-second (44.1 kHz, 16-bit Stereo WAV)
// Hollywood Sound Design & SFX track (NO voiceover) timed frame-accurately to NoFatigueShorts3D.
import fs from 'node:fs';
import path from 'node:path';

const SAMPLE_RATE = 44100;
const DURATION = 48.0;
const NUM_SAMPLES = Math.floor(SAMPLE_RATE * DURATION);

const left = new Float32Array(NUM_SAMPLES);
const right = new Float32Array(NUM_SAMPLES);

// Deterministic pseudo-random noise
let seed = 1337;
function rand() {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646 * 2 - 1;
}

function addSample(idx, l, r = l) {
  if (idx >= 0 && idx < NUM_SAMPLES) {
    left[idx] += l;
    right[idx] += r;
  }
}

// 1. Sub-bass cinematic impact boom
function addSubImpact(startSec, durSec = 1.6, startFreq = 68, endFreq = 26, amp = 0.55) {
  const s0 = Math.floor(startSec * SAMPLE_RATE);
  const len = Math.floor(durSec * SAMPLE_RATE);
  let phase = 0;
  for (let i = 0; i < len; i++) {
    const u = i / len;
    const env = Math.pow(1 - u, 2.2) * Math.min(1, i / (0.008 * SAMPLE_RATE));
    const freq = startFreq + (endFreq - startFreq) * Math.pow(u, 0.45);
    phase += (2 * Math.PI * freq) / SAMPLE_RATE;
    // subtle saturation harmonics
    const sig = Math.tanh(Math.sin(phase) * 1.6) * amp * env;
    addSample(s0 + i, sig, sig);
  }
}

// 2. Band-passed noise whoosh (with stereo pan)
function addWhoosh(startSec, durSec = 0.55, centerFreq = 520, amp = 0.25, panDir = 1) {
  const s0 = Math.floor(startSec * SAMPLE_RATE);
  const len = Math.floor(durSec * SAMPLE_RATE);
  let bp1 = 0;
  let bp2 = 0;
  for (let i = 0; i < len; i++) {
    const u = i / len;
    const env = Math.sin(Math.PI * u) ** 1.8;
    const f = centerFreq * (0.5 + 1.1 * Math.sin(Math.PI * u));
    const alpha = Math.min(0.45, (2 * Math.PI * f) / SAMPLE_RATE);
    const n = rand();
    bp1 += alpha * (n - bp1);
    bp2 += alpha * (bp1 - bp2);
    const sig = (bp1 - bp2) * amp * env * 2.8;
    const pan = 0.5 + 0.4 * panDir * (u * 2 - 1);
    addSample(s0 + i, sig * (1 - pan * 0.5), sig * (0.5 + pan * 0.5));
  }
}

// 3. Realistic lub-dub heartbeat
function addHeartbeat(beatSec, amp = 0.42) {
  // "Lub" (low, slightly longer)
  addSubImpact(beatSec, 0.14, 64, 34, amp);
  // "Dub" (slightly higher, tighter, 0.12s later)
  addSubImpact(beatSec + 0.115, 0.11, 78, 40, amp * 0.82);
}

// 4. Electrical neural snap + power-down drop
function addElectricSnap(startSec) {
  const s0 = Math.floor(startSec * SAMPLE_RATE);
  const snapLen = Math.floor(0.18 * SAMPLE_RATE);
  for (let i = 0; i < snapLen; i++) {
    const u = i / snapLen;
    const env = Math.pow(1 - u, 3.0);
    const crackle = rand() * (Math.sin(i * 0.18) > 0.2 ? 1.0 : 0.2);
    const zap = Math.sin(i * 0.35 + Math.sin(i * 0.08) * 5) * 0.6;
    const sig = (crackle * 0.55 + zap * 0.45) * env * 0.55;
    addSample(s0 + i, sig, sig * 0.9);
  }
  // Power-down pitch drop (0.75s)
  const dropLen = Math.floor(0.75 * SAMPLE_RATE);
  let ph = 0;
  for (let i = 0; i < dropLen; i++) {
    const u = i / dropLen;
    const freq = 620 * Math.pow(0.08, u);
    ph += (2 * Math.PI * freq) / SAMPLE_RATE;
    const env = (1 - u) * Math.min(1, i / 200);
    const sig = Math.sin(ph) * env * 0.28;
    addSample(s0 + i, sig * 0.9, sig);
  }
}

// 5. Bone/Crystal Fracture Snap + Slow-Mo Time Drop (Scene 5 at 34.2s)
function addFractureClimax(startSec) {
  // Sharp transient crack
  const s0 = Math.floor(startSec * SAMPLE_RATE);
  const crackLen = Math.floor(0.24 * SAMPLE_RATE);
  for (let i = 0; i < crackLen; i++) {
    const u = i / crackLen;
    const env = Math.pow(1 - u, 2.6);
    const burst = (rand() * 0.7 + Math.sin(i * 0.42) * 0.5) * env * 0.65;
    addSample(s0 + i, burst, burst);
  }
  // Massive sub-bass slow-mo drop
  addSubImpact(startSec, 2.8, 90, 22, 0.68);
  // Secondary body collapse thud 1.1s later
  addSubImpact(startSec + 1.15, 0.9, 55, 25, 0.45);
  addWhoosh(startSec + 0.05, 1.4, 280, 0.3, -1);
}

// 6. Warning Alarm Braaam Stinger (Scene 4)
function addWarningPulse(startSec, durSec = 0.65, amp = 0.22) {
  const s0 = Math.floor(startSec * SAMPLE_RATE);
  const len = Math.floor(durSec * SAMPLE_RATE);
  let p1 = 0,
    p2 = 0;
  for (let i = 0; i < len; i++) {
    const u = i / len;
    const env = Math.sin(Math.PI * u) ** 1.4;
    const f1 = 146.83 * (1 - 0.04 * u); // D3
    const f2 = 155.56 * (1 - 0.04 * u); // Eb3 (dissonant minor second tension!)
    p1 += (2 * Math.PI * f1) / SAMPLE_RATE;
    p2 += (2 * Math.PI * f2) / SAMPLE_RATE;
    // Saw-like brassy harmonics
    const wave =
      (Math.sin(p1) + 0.45 * Math.sin(p1 * 2) + 0.25 * Math.sin(p1 * 3) +
        Math.sin(p2) + 0.45 * Math.sin(p2 * 2)) * 0.28;
    const sig = Math.tanh(wave * 1.8) * amp * env;
    addSample(s0 + i, sig * 0.95, sig * 1.05);
  }
}

// ==================== BUILD THE 48-SECOND SOUND DESIGN TIMELINE ====================

// Continuous subtle dark cinematic room atmosphere across all 48s
for (let i = 0; i < NUM_SAMPLES; i++) {
  const t = i / SAMPLE_RATE;
  const drone =
    (Math.sin(2 * Math.PI * 36.7 * t) * 0.5 +
      Math.sin(2 * Math.PI * 55.0 * t + Math.sin(t * 0.6)) * 0.35 +
      Math.sin(2 * Math.PI * 73.4 * t) * 0.15) *
    0.045;
  left[i] += drone;
  right[i] += drone * 0.95;
}

// --- SCENE 1 (00s - 05s): Fast Push-Ups + Hook Impact ---
addSubImpact(0.02, 1.4, 65, 28, 0.55);
addWhoosh(0.05, 0.5, 650, 0.25, 1);
// Rhythmic push-up effort whooshes (2.2 reps/sec)
for (let t = 0.45; t < 4.7; t += 1 / 2.2) {
  addWhoosh(t, 0.22, 380, 0.14, 1);
  addHeartbeat(t, 0.18);
}

// --- SCENE 2 (05s - 12s): Camera Dolly into 3D Brain & Signal Snap at 9.45s ---
addSubImpact(5.0, 1.2, 58, 30, 0.45);
addWhoosh(4.9, 0.65, 720, 0.28, -1);
// Neural hum while signal is active (5.0s -> 9.45s)
{
  const s0 = Math.floor(5.0 * SAMPLE_RATE);
  const s1 = Math.floor(9.45 * SAMPLE_RATE);
  for (let i = s0; i < s1; i++) {
    const t = i / SAMPLE_RATE;
    const pulse = 0.6 + 0.4 * Math.sin((t - 5.0) * 10);
    const sig =
      (Math.sin(2 * Math.PI * 110 * t) * 0.5 + Math.sin(2 * Math.PI * 220 * t) * 0.3) *
      0.065 *
      pulse;
    addSample(i, sig, sig);
  }
}
// Signal wire snaps at t = 5 + 4.45 = 9.45s!
addElectricSnap(9.45);
addSubImpact(9.46, 1.1, 75, 26, 0.52);

// --- SCENE 3 (12s - 22s): Peak Performance Sprint + Motion Trail Whooshes ---
addSubImpact(12.0, 1.5, 70, 30, 0.55);
addWhoosh(11.9, 0.7, 880, 0.32, 1);
// Fast sprinting footfalls & wind whooshes
for (let t = 12.35; t < 21.7; t += 0.48) {
  addWhoosh(t, 0.26, 620 + ((t * 100) % 240), 0.16, t % 0.96 < 0.48 ? 1 : -1);
  addSubImpact(t, 0.12, 85, 42, 0.18);
}

// --- SCENE 4 (22s - 32s): The Dark Side / Warning Red + Accelerating Heartbeat ---
addSubImpact(22.0, 1.8, 82, 26, 0.62);
addElectricSnap(22.05);
// Alarm Braaam pulses
for (let t = 22.1; t < 31.5; t += 1.6) {
  addWarningPulse(t, 0.75, 0.22);
}
// Accelerating overheating heartbeat (from 0.45s interval down to 0.28s interval)
for (let t = 22.2, step = 0.44; t < 31.8; t += step, step = Math.max(0.27, step * 0.96)) {
  addHeartbeat(t, 0.45);
}

// --- SCENE 5 (32s - 42s): Climax — Sprint -> Leg Fracture at 34.2s -> Slow-Mo Collapse ---
addSubImpact(32.0, 1.1, 68, 32, 0.45);
// Rapid heartbeats leading up to the snap at 34.2s
for (let t = 32.1; t < 34.1; t += 0.26) {
  addHeartbeat(t, 0.48);
}
// T = 34.2s (t = 2.2s in Scene 5): VIOLENT LEG FRACTURE & SLOW-MO DROP!
addFractureClimax(34.2);
// Slow, faint dying heartbeats in slow-mo after the collapse
for (let t = 36.2; t < 41.2; t += 1.15) {
  addHeartbeat(t, 0.25 * (1 - (t - 36.2) / 6.0));
}

// --- SCENE 6 (42s - 48s): Calm Cinematic Outro & Letterbox Resolve ---
addSubImpact(42.0, 1.8, 54, 28, 0.42);
addWhoosh(42.0, 0.9, 420, 0.2, 1);
// Warm resolving synth pad (42.0s -> 47.8s)
{
  const s0 = Math.floor(42.0 * SAMPLE_RATE);
  const s1 = Math.floor(47.9 * SAMPLE_RATE);
  const freqs = [130.81, 196.0, 246.94, 293.66, 392.0]; // Warm Cmaj9 cinematic chord
  for (let i = s0; i < s1; i++) {
    const t = i / SAMPLE_RATE;
    const u = (i - s0) / (s1 - s0);
    const env = Math.sin(Math.PI * u) ** 1.3;
    let chord = 0;
    for (const f of freqs) {
      chord += Math.sin(2 * Math.PI * f * t + Math.sin(t * 1.5) * 0.2);
    }
    const sig = (chord / freqs.length) * 0.14 * env;
    addSample(i, sig * 0.95, sig * 1.05);
  }
}
// Calm steady heartbeat in outro
for (let t = 42.6; t < 46.8; t += 0.85) {
  addHeartbeat(t, 0.22);
}

// ==================== WRITE 16-BIT STEREO WAV FILE ====================
const outPath = path.resolve('public/sfx-track.wav');
const dataBytes = NUM_SAMPLES * 4; // 2 channels * 2 bytes
const buf = Buffer.alloc(44 + dataBytes);

buf.write('RIFF', 0);
buf.writeUInt32LE(36 + dataBytes, 4);
buf.write('WAVE', 8);
buf.write('fmt ', 12);
buf.writeUInt32LE(16, 16); // PCM chunk size
buf.writeUInt16LE(1, 20);  // PCM format
buf.writeUInt16LE(2, 22);  // 2 channels (Stereo)
buf.writeUInt32LE(SAMPLE_RATE, 24);
buf.writeUInt32LE(SAMPLE_RATE * 4, 28);
buf.writeUInt16LE(4, 32);
buf.writeUInt16LE(16, 34); // 16-bit
buf.write('data', 36);
buf.writeUInt32LE(dataBytes, 40);

let offset = 44;
for (let i = 0; i < NUM_SAMPLES; i++) {
  const cl = Math.max(-0.98, Math.min(0.98, left[i]));
  const cr = Math.max(-0.98, Math.min(0.98, right[i]));
  buf.writeInt16LE(Math.round(cl * 32767), offset);
  buf.writeInt16LE(Math.round(cr * 32767), offset + 2);
  offset += 4;
}

fs.writeFileSync(outPath, buf);
console.log(`Generated stereo cinematic SFX track: ${outPath} (${(buf.length / 1024 / 1024).toFixed(2)} MB)`);
