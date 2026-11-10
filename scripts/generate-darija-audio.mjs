// scripts/generate-darija-audio.mjs — Generates the 48s clear Moroccan Darija voiceover + cinematic music + SFX
// for NoFatigueShorts3D, saving `public/no-fatigue-darija.mp3` and `~/Downloads/no-fatigue-darija-audio.mp3`.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = '/home/amine-srut/Documents/3d-video-project';
const FFMPEG = path.join(ROOT, 'node_modules/@remotion/compositor-linux-x64-gnu/ffmpeg');
const TMP = '/tmp/darija_tts';
fs.mkdirSync(TMP, { recursive: true });

const SCENES = [
  {
    id: 's1',
    start: 0.15,
    maxDur: 4.7,
    text: 'دابا نتا وصلتي للتمرين رقم مية! دراعك خاصو يكون كيحرقك، ولكن والو، كتحس براسك يلاه فقتي.',
  },
  {
    id: 's2',
    start: 5.15,
    maxDur: 6.7,
    text: 'تخيل معايا لو كان دماغك ما كيحسش بالعيا؟ السر هو أن العيا ماشي مشكل ديال العضلات، هو إشارة من الدماغ، وهاد الإشارة عندك نتا طفات!',
  },
  {
    id: 's3',
    start: 12.15,
    maxDur: 9.7,
    text: 'فلاصال، غاتبقا تطريني حتى يمشيو الناس كاملين بحالهم. وفالماراطون؟ غاتجري ثنين وأربعين كيلومتر بلا ما توقف، وغاتحس براسك خارق!',
  },
  {
    id: 's4',
    start: 22.15,
    maxDur: 9.7,
    text: 'ولكن هنا كيبان الوجه المظلم! العيا ماشي ضعف، العيا جهاز إنذار كيحمي حياتك. بلا بيه، العضلات ديالك غادي يتقطعو، وقلبك غادي يسخن بزاف!',
  },
  {
    id: 's5',
    start: 32.15,
    maxDur: 9.6,
    text: 'وفوسط الجرية، رجليك غادي يتهرسو على غفلة! ما غاديش توقف حيت عييتي، غاتوقف حيت الجسم ديالك تحطم.',
  },
  {
    id: 's6',
    start: 42.15,
    maxDur: 5.6,
    text: 'المرة الجاية ملي تحس بالعيا، شكر دماغك، راه يلاه عتق ليك حياتك.',
  },
];

async function fetchTtsMp3(text, outFile) {
  const url = new URL('https://translate.google.com/translate_tts');
  url.searchParams.set('ie', 'UTF-8');
  url.searchParams.set('tl', 'ar');
  url.searchParams.set('client', 'tw-ob');
  url.searchParams.set('q', text);
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!res.ok) throw new Error(`TTS HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(outFile, buf);
}

function getDuration(file) {
  try {
    execFileSync(FFMPEG, ['-i', file], { stdio: 'pipe' });
  } catch (e) {
    const out = String(e.stderr || '');
    const m = /Duration:\s*(\d+):(\d+):(\d+\.\d+)/.exec(out);
    if (m) return Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]);
  }
  return 4;
}

// Write a 48-second 24kHz mono 16-bit WAV with cinematic dark-emerald synth + heartbeat + snap/fracture SFX
function generateBackdropWav(wavPath, durationSec = 48, sr = 24000) {
  const totalSamples = durationSec * sr;
  const pcm = new Int16Array(totalSamples);
  for (let i = 0; i < totalSamples; i++) {
    const t = i / sr;
    let v = 0;

    // 1. Deep cinematic sub-bass & fifth drone (A1 = 55Hz, E2 = 82.4Hz, A2 = 110Hz)
    const baseFreq = t >= 22 && t < 42 ? 49.0 : 55.0; // drops to G1 during Dark Side / Climax
    v += 0.09 * Math.sin(2 * Math.PI * baseFreq * t);
    v += 0.045 * Math.sin(2 * Math.PI * baseFreq * 1.5 * t);
    v += 0.03 * Math.sin(2 * Math.PI * baseFreq * 2 * t + Math.sin(t * 1.5) * 0.4);

    // 2. Scene 2 (9.45s): Brain signal electric snap / power-down SFX
    if (t >= 9.45 && t <= 10.15) {
      const dt = t - 9.45;
      const env = Math.exp(-dt * 9);
      const sweep = 680 - dt * 520;
      v += 0.32 * env * (Math.sin(2 * Math.PI * sweep * dt) + (Math.random() * 2 - 1) * 0.45);
    }

    // 3. Scene 3 (12s - 22s): Energetic sprint pulse (8 Hz arpeggio pulse)
    if (t >= 12 && t < 22) {
      const gate = 0.5 + 0.5 * Math.sin(2 * Math.PI * 6 * t);
      v += 0.05 * gate * Math.sin(2 * Math.PI * 220 * t);
    }

    // 4. Scene 4 (22s - 32s): Warning Red flash impact + accelerating overheating heartbeat
    if (t >= 22.0 && t <= 22.7) {
      const dt = t - 22.0;
      v += 0.35 * Math.exp(-dt * 6) * Math.sin(2 * Math.PI * 95 * dt);
    }
    if (t >= 22 && t < 32) {
      const beatPeriod = 0.52;
      const ph = (t - 22) % beatPeriod;
      if (ph < 0.09) v += 0.28 * Math.sin((ph / 0.09) * Math.PI) * Math.sin(2 * Math.PI * 62 * ph);
      if (ph > 0.14 && ph < 0.22)
        v += 0.22 * Math.sin(((ph - 0.14) / 0.08) * Math.PI) * Math.sin(2 * Math.PI * 54 * ph);
    }

    // 5. Scene 5 (34.2s): Mid-sprint leg fracture snap + sub-drop impact
    if (t >= 34.2 && t <= 35.4) {
      const dt = t - 34.2;
      const crack = dt < 0.12 ? (Math.random() * 2 - 1) * Math.exp(-dt * 28) * 0.65 : 0;
      const boom = Math.exp(-dt * 3.5) * Math.sin(2 * Math.PI * (85 - dt * 45) * dt) * 0.42;
      v += crack + boom;
    }

    // 6. Scene 6 (42s - 48s): Calm Emerald resolution pad + fade out at end
    if (t >= 42) {
      const fadeOut = t > 46.5 ? Math.max(0, (48 - t) / 1.5) : 1;
      v += 0.04 * fadeOut * Math.sin(2 * Math.PI * 220 * t);
      v += 0.03 * fadeOut * Math.sin(2 * Math.PI * 277.18 * t); // C#4 warm major third
    }

    if (t > 46.8) v *= Math.max(0, (48 - t) / 1.2);
    pcm[i] = Math.max(-32767, Math.min(32767, Math.round(v * 32767)));
  }

  const header = Buffer.alloc(44);
  const dataSize = pcm.byteLength;
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + dataSize, 4);
  header.write('WAVEfmt ', 8);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(1, 22); // mono
  header.writeUInt32LE(sr, 24);
  header.writeUInt32LE(sr * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(dataSize, 40);
  fs.writeFileSync(wavPath, Buffer.concat([header, Buffer.from(pcm.buffer)]));
}

(async () => {
  const bgWav = path.join(TMP, 'bg.wav');
  generateBackdropWav(bgWav, 48);

  const inputs = ['-y', '-i', bgWav];
  const filterParts = [];
  const mixLabels = ['[0:a]'];

  for (let i = 0; i < SCENES.length; i++) {
    const s = SCENES[i];
    const rawMp3 = path.join(TMP, `${s.id}.mp3`);
    await fetchTtsMp3(s.text, rawMp3);
    const rawDur = getDuration(rawMp3);
    // Natural crisp pace (minimum 1.12x so Google TTS sounds energetic, more if needed to fit scene window)
    const neededTempo = Math.min(1.45, Math.max(1.14, rawDur / s.maxDur));
    const delayMs = Math.round(s.start * 1000);
    inputs.push('-i', rawMp3);
    filterParts.push(
      `[${i + 1}:a]atempo=${neededTempo.toFixed(3)},volume=1.9,adelay=${delayMs}|${delayMs}[v${i}]`,
    );
    mixLabels.push(`[v${i}]`);
    console.log(`Scene ${s.id}: raw=${rawDur.toFixed(2)}s, tempo=${neededTempo.toFixed(2)}x, start=${s.start}s`);
  }

  const outMp3 = path.join(ROOT, 'public/no-fatigue-darija.mp3');
  const filter = `${filterParts.join(';')};${mixLabels.join('')}amix=inputs=${mixLabels.length}:normalize=0[out]`;
  execFileSync(FFMPEG, [...inputs, '-filter_complex', filter, '-map', '[out]', '-t', '48', '-b:a', '128k', outMp3], {
    stdio: 'inherit',
  });
  fs.copyFileSync(outMp3, '/home/amine-srut/Downloads/no-fatigue-darija-audio.mp3');
  console.log('Saved:', outMp3);
})();
