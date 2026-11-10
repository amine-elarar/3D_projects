// src/scenes/NoFatigueShorts3D.tsx — 48-second (1152 frames @ 24fps) Vertical 9:16 (1080×1920) Short:
// "What If Your Brain Couldn't Feel Fatigue?"
// 20-Year Pro Editor Edition:
// - Iconic 3D Stickman characters + Hollywood Teal & Orange 3-Point Lighting + Realistic Shadows + Depth of Field (BokehPass)
// - Frame-accurate Stereo SFX Sound Design track (public/sfx-track.wav) with NO voiceover (ready for user's own voice)
// - Live animated ECG Heartbeat & Neural Monitor in the top HUD
// - Dynamic Keyword Highlighting in Captions + Optical Cut Flashes + Sleek Progress Bar
import React, { useMemo } from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import {
  Box,
  Cyl,
  Dust3D,
  EXTRA,
  Ground,
  LightShaft,
  NightStreetSet3D,
  StickFigure3D,
  StickGrade,
  StickStage,
  StickStyleProvider,
  breathe,
  clamp,
  ease,
  lerp,
  mix,
  posesAt,
  prog,
  rng,
  shake,
  useDollyCamera,
  useOrbitCamera,
  useShotTime,
  walkPose,
  withPose,
  type Outfit,
  type Pose,
} from '../stickman';

const KEY_ORANGE = '#ff8c3b';
const FILL_TEAL = '#1a9cb8';
const RIM_CYAN = '#38bdf8';
const WARNING_RED = '#ff3b30';
const MATTE_STICKMAN: Outfit = { top: 'none', head: 'none' };

export type NoFatigueShortsProps = {
  /** Optional voiceover audio file in public/. Left undefined by default so only SFX plays. */
  voiceoverFile?: string;
  /** Sound effects track in public/ (default: 'sfx-track.wav'). Set to '' to mute SFX. */
  sfxFile?: string;
  captions?: boolean;
};

type CaptionLine = [from: number, to: number, text: string, highlight?: string];

// -------------------- Pro Editor Vertical 9:16 Captions with Keyword Highlight --------------------

const VerticalCaption: React.FC<{ lines: CaptionLine[]; accent?: string }> = ({
  lines,
  accent = KEY_ORANGE,
}) => {
  const { t } = useShotTime();
  const { height } = useVideoConfig();
  const active = lines.find(([from, to]) => t >= from && t <= to);
  if (!active) return null;
  const [from, to, text, highlight] = active;
  const enter = ease.outBack(prog(t, from, from + 0.24));
  const exit = 1 - ease.in(prog(t, to - 0.18, to));
  const fade = clamp(enter * exit);
  const wordPop = ease.outBack(prog(t, from + 0.12, from + 0.42));

  // Split text around the highlighted keyword if provided
  const parts = highlight && text.includes(highlight) ? text.split(highlight) : [text];

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: height * 0.155,
        paddingLeft: 56,
        paddingRight: 56,
        pointerEvents: 'none',
      }}
    >
      <div
        dir="rtl"
        style={{
          opacity: fade,
          transform: `translateY(${(1 - fade) * 18}px) scale(${0.94 + 0.06 * enter})`,
          background: 'linear-gradient(180deg, rgba(8, 20, 30, 0.94) 0%, rgba(4, 10, 16, 0.96) 100%)',
          border: `2.5px solid ${accent}99`,
          borderRadius: 26,
          padding: '22px 36px',
          textAlign: 'center',
          fontFamily: 'Nunito, Fredoka, system-ui, sans-serif',
          fontWeight: 900,
          fontSize: 45,
          lineHeight: 1.4,
          color: '#f8fafc',
          boxShadow: `0 18px 44px rgba(0,0,0,0.82), 0 0 32px ${accent}40`,
        }}
      >
        {parts.length > 1 && highlight ? (
          <>
            {parts[0]}
            <span
              style={{
                display: 'inline-block',
                color: '#040a10',
                background: accent,
                padding: '2px 16px',
                margin: '0 6px',
                borderRadius: 14,
                transform: `scale(${0.9 + 0.14 * wordPop})`,
                boxShadow: `0 0 24px ${accent}`,
              }}
            >
              {highlight}
            </span>
            {parts.slice(1).join(highlight)}
          </>
        ) : (
          text
        )}
      </div>
    </AbsoluteFill>
  );
};

// -------------------- Live Animated ECG & Neural Waveform HUD Badge --------------------

const LiveEcgWave: React.FC<{
  t: number;
  bpm: number;
  flatline?: boolean;
  color: string;
}> = ({ t, bpm, flatline = false, color }) => {
  const width = 280;
  const height = 42;
  const midY = height / 2;
  const freq = bpm / 60;

  const d = useMemo(() => {
    const pts: string[] = [];
    const steps = 56;
    for (let i = 0; i <= steps; i++) {
      const u = i / steps;
      const x = u * width;
      let y = midY;
      if (!flatline) {
        // Traveling ECG P-Q-R-S-T wave packet
        const phase = ((u * 2.2 - t * freq) % 1 + 1) % 1;
        let spike = 0;
        if (phase > 0.42 && phase < 0.46) {
          spike = 0.25; // Q dip
        } else if (phase >= 0.46 && phase < 0.51) {
          spike = -1.0; // R sharp upward peak
        } else if (phase >= 0.51 && phase < 0.55) {
          spike = 0.45; // S downward dip
        } else if (phase >= 0.62 && phase < 0.72) {
          spike = -0.28 * Math.sin(((phase - 0.62) / 0.1) * Math.PI); // T wave
        }
        y = midY + spike * 16;
      }
      pts.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`);
    }
    return pts.join(' ');
  }, [t, freq, flatline, midY]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginTop: 8 }}>
      <svg width={width} height={height} style={{ overflow: 'visible' }}>
        <path
          d={d}
          fill="none"
          stroke={color}
          strokeWidth={3.2}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: `drop-shadow(0 0 8px ${color})` }}
        />
      </svg>
      <div
        style={{
          fontFamily: 'Nunito, monospace',
          fontWeight: 900,
          fontSize: 24,
          color,
          minWidth: 95,
          textAlign: 'left',
          textShadow: `0 0 12px ${color}`,
        }}
      >
        {flatline ? '0 BPM' : `${bpm} BPM`}
      </div>
    </div>
  );
};

const VerticalHudBadge: React.FC<{
  topText: string;
  mainText: string;
  color?: string;
  bpm?: number;
  flatline?: boolean;
}> = ({ topText, mainText, color = KEY_ORANGE, bpm = 128, flatline = false }) => {
  const { t, dur } = useShotTime();
  const pop = ease.outBack(prog(t, 0.12, 0.5)) * (1 - ease.in(prog(t, dur - 0.35, dur - 0.06)));
  return (
    <div
      style={{
        position: 'absolute',
        top: 125,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          opacity: clamp(pop),
          transform: `scale(${0.86 + 0.14 * pop})`,
          background: 'rgba(5, 14, 22, 0.92)',
          border: `2.5px solid ${color}`,
          borderRadius: 24,
          padding: '16px 38px 14px',
          textAlign: 'center',
          boxShadow: `0 12px 32px rgba(0,0,0,0.7), 0 0 36px ${color}55`,
        }}
      >
        <div
          style={{
            fontFamily: 'Nunito, system-ui, sans-serif',
            fontWeight: 800,
            fontSize: 22,
            letterSpacing: '0.22em',
            color: '#7dd3fc',
          }}
        >
          {topText}
        </div>
        <div
          style={{
            fontFamily: 'Fredoka, Nunito, system-ui, sans-serif',
            fontWeight: 800,
            fontSize: 54,
            letterSpacing: '0.07em',
            color,
            textShadow: `0 0 24px ${color}`,
          }}
        >
          {mainText}
        </div>
        <LiveEcgWave t={t} bpm={bpm} flatline={flatline} color={color} />
      </div>
    </div>
  );
};

// -------------------- 20-Year Editor Montage Overlay (Cut Flashes + Timeline Progress Bar) --------------------

const CinematicMontageOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const progress = (frame / Math.max(1, durationInFrames - 1)) * 100;

  // Scene cut frames: 0, 120, 288, 528, 768, 821 (34.2s leg snap!), 1008
  const cutFrames = [0, 120, 227, 288, 528, 768, 821, 1008];
  let flashOpacity = 0;
  let flashColor = '#ff9a47';

  for (const cf of cutFrames) {
    const dist = frame - cf;
    if (dist >= 0 && dist <= 5) {
      flashOpacity = Math.max(flashOpacity, (1 - dist / 5) * (cf === 821 ? 0.55 : cf === 528 ? 0.42 : 0.25));
      if (cf === 528 || cf === 768 || cf === 821) {
        flashColor = WARNING_RED;
      } else if (cf === 227) {
        flashColor = RIM_CYAN;
      }
    }
  }

  const isDangerZone = frame >= 528 && frame < 1008;
  const barColor = isDangerZone ? WARNING_RED : KEY_ORANGE;

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {/* Optical flash on scene cuts & impact moments */}
      {flashOpacity > 0 ? (
        <AbsoluteFill
          style={{
            background: `radial-gradient(circle, ${flashColor} 0%, transparent 80%)`,
            opacity: flashOpacity,
            mixBlendMode: 'screen',
          }}
        />
      ) : null}

      {/* Sleek Shorts/Reels Retention Progress Bar at bottom edge */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 10,
          background: 'rgba(255, 255, 255, 0.12)',
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: '100%',
            background: `linear-gradient(90deg, ${RIM_CYAN}, ${barColor})`,
            boxShadow: `0 0 18px ${barColor}`,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

// Cinematic background bokeh pillars & gym props to accentuate Depth of Field & 3-point shadows
const CinematicGymProps: React.FC = () => {
  return (
    <group>
      {[-3.8, -1.6, 1.6, 3.8].map((x, i) => (
        <group key={i} position={[x, 0, -4.2]}>
          <Box size={[0.38, 4.5, 0.38]} color="#101d28" position={[0, 2.25, 0]} />
          <Box
            size={[0.08, 3.6, 0.08]}
            color={i % 2 === 0 ? KEY_ORANGE : RIM_CYAN}
            flat
            position={[0, 2.1, 0.2]}
          />
        </group>
      ))}
      <Cyl rTop={0.18} rBottom={0.18} h={0.08} color="#16232e" position={[-0.95, 0.18, 1.15]} rotation={[Math.PI / 2, 0, 0.3]} />
      <Cyl rTop={0.22} rBottom={0.22} h={0.09} color="#1b2a38" position={[1.1, 0.22, -1.35]} rotation={[Math.PI / 2, 0, -0.4]} />
    </group>
  );
};

// -------------------- Scene 1 (00s – 05s, 120f): Fast Push-Ups --------------------
function pushUpPose(phase: number): Pose {
  const u = 0.5 + 0.5 * Math.sin(phase);
  const shY = lerp(-38, -74, u);
  const hipY = lerp(-28, -46, u);
  const headY = shY - 18;
  const elbowY = lerp(-24, -38, u);
  return {
    head: [82, headY],
    sh: [54, shY],
    hip: [-18, hipY],
    eF: [42, elbowY],
    hF: [52, 0],
    eB: [36, elbowY],
    hB: [46, 0],
    kF: [-56, lerp(-14, -22, u)],
    fF: [-92, 0],
    kB: [-60, lerp(-14, -22, u)],
    fB: [-96, 0],
  };
}

const Scene1Inner: React.FC = () => {
  const { t, dur } = useShotTime();
  const pose = pushUpPose(t * Math.PI * 2 * 2.2);
  useOrbitCamera(t, {
    target: [0.32, 0.35, 0],
    radius: [2.55, 2.05],
    height: [0.85, 0.62],
    from: 0.55,
    to: 1.15,
    dur,
  });

  return (
    <>
      <Ground w={50} d={50} color="#09131c" texture="tiles" cells={16} repeat={[14, 14]} />
      <CinematicGymProps />
      <LightShaft w={2.6} len={5.5} color={KEY_ORANGE} opacity={0.08} position={[0.2, 2.6, 0]} />
      <StickFigure3D outfit={MATTE_STICKMAN} rim={KEY_ORANGE} pose={pose} position={[0, 0, 0]} />
      <Dust3D t={t} count={140} area={[6, 4, 6]} center={[0, 1.5, 0]} color={KEY_ORANGE} opacity={0.7} />
    </>
  );
};

const Scene1Hook: React.FC<{ captions: boolean }> = ({ captions }) => {
  const { width, height } = useVideoConfig();
  const { t } = useShotTime();
  const repCount = 90 + Math.min(10, Math.floor(t * 2.5));
  return (
    <StickStyleProvider styleId="tealOrange" mood="night">
      <StickGrade bars="none">
        <StickStage
          width={width}
          height={height}
          fov={44}
          fog={[6, 26]}
          fogColor="#050e16"
          sky={['#03090f', '#0a1f2e', '#13384c']}
          keyPos={[4, 7, 4]}
          keyColor={KEY_ORANGE}
          keyIntensity={3.4}
          fillPos={[-5, 3.5, 3]}
          fillColor={FILL_TEAL}
          fillIntensity={1.9}
          rimPos={[-2, 5.5, -5]}
          rimColor={RIM_CYAN}
          rimIntensity={3.0}
          ambient={0.85}
          dof={{ target: [0.32, 0.35, 0], aperture: 0.0022, maxblur: 0.009 }}
        >
          <Scene1Inner />
        </StickStage>
        <VerticalHudBadge
          topText="FATIGUE SIGNAL: OFF"
          mainText={`PUSH-UP #${repCount}`}
          color={KEY_ORANGE}
          bpm={132}
        />
        {captions ? (
          <VerticalCaption
            accent={KEY_ORANGE}
            lines={[
              [0.05, 2.5, 'دابا نتا وصلتي للتمرين رقم 100! دراعك خاصو يكون كيحرقك…', 'للتمرين رقم 100!'],
              [2.5, 4.95, 'ولكن والو! كتحس براسك يلاه فقتي.', 'ولكن والو!'],
            ]}
          />
        ) : null}
      </StickGrade>
    </StickStyleProvider>
  );
};

// -------------------- Scene 2 (05s – 12s, 168f): Stylized 3D Brain & Snapping Signal Wire --------------------
const StylizedBrain3D: React.FC<{ t: number }> = ({ t }) => {
  const snapK = prog(t, 4.3, 4.8);
  const signalAlive = t < 4.45;
  const pulse = signalAlive ? 0.75 + 0.25 * Math.sin(t * 10) : lerp(1, 0.15, snapK);
  const brainColor = signalAlive ? mix(FILL_TEAL, KEY_ORANGE, pulse) : '#182b38';
  const wireGap = ease.outBack(prog(t, 4.45, 5.1)) * 0.22;

  const lobes = useMemo(() => {
    const r = rng(42);
    return Array.from({ length: 18 }, (_, i) => {
      const side = i % 2 === 0 ? -1 : 1;
      const a = (Math.floor(i / 2) / 9) * Math.PI * 1.3 - 0.6;
      return {
        pos: [side * (0.11 + r() * 0.06), 1.52 + Math.sin(a) * 0.12, Math.cos(a) * 0.14] as [number, number, number],
        rad: 0.075 + r() * 0.035,
      };
    });
  }, []);

  return (
    <group>
      {/* Translucent holographic head shell */}
      <mesh position={[0, 1.5, 0]}>
        <sphereGeometry args={[0.34, 24, 18]} />
        <meshStandardMaterial color={RIM_CYAN} wireframe transparent opacity={0.22} emissive={RIM_CYAN} emissiveIntensity={0.5} />
      </mesh>
      {/* 3D PBR brain lobes */}
      {lobes.map((l, idx) => (
        <mesh key={idx} position={l.pos} castShadow receiveShadow>
          <sphereGeometry args={[l.rad, 16, 12]} />
          <meshStandardMaterial
            color={brainColor}
            roughness={0.35}
            metalness={0.2}
            emissive={brainColor}
            emissiveIntensity={signalAlive ? 0.65 : 0.08}
          />
        </mesh>
      ))}
      {/* Glowing warm orange energy pulse ring inside the brain */}
      {signalAlive ? (
        <mesh position={[0, 1.52, 0]} rotation={[Math.PI / 2, 0, t * 2]}>
          <torusGeometry args={[0.16 + (t * 0.35) % 0.14, 0.012, 12, 32]} />
          <meshBasicMaterial color={KEY_ORANGE} />
        </mesh>
      ) : null}
      {/* Glowing neural signal wire down the spine that snaps at t = 4.45s */}
      <mesh position={[-wireGap * 0.4, 1.24 + wireGap * 0.2, 0]} rotation={[0, 0, wireGap * 1.4]} castShadow>
        <cylinderGeometry args={[0.018, 0.018, 0.28, 12]} />
        <meshBasicMaterial color={signalAlive ? KEY_ORANGE : '#1e3342'} />
      </mesh>
      <mesh position={[wireGap * 0.4, 0.92 - wireGap * 0.2, 0]} rotation={[0, 0, -wireGap * 1.2]} castShadow>
        <cylinderGeometry args={[0.018, 0.018, 0.28, 12]} />
        <meshBasicMaterial color={signalAlive ? KEY_ORANGE : '#1e3342'} />
      </mesh>
      {/* Snap sparks when the wire breaks */}
      {t >= 4.4 && t <= 5.4 ? (
        <Dust3D
          t={(t - 4.4) * 6}
          count={55}
          area={[0.55, 0.55, 0.55]}
          center={[0, 1.1, 0]}
          color={KEY_ORANGE}
          size={0.045}
          opacity={1 - prog(t, 4.4, 5.4)}
        />
      ) : null}
    </group>
  );
};

const Scene2Inner: React.FC = () => {
  const { t, dur } = useShotTime();
  useDollyCamera(t, [
    [0, { pos: [0, 1.55, 3.6], look: [0, 1.45, 0], fov: 44 }],
    [2.6, { pos: [0.15, 1.52, 1.45], look: [0, 1.48, 0], fov: 36 }],
    [dur, { pos: [0.05, 1.48, 1.05], look: [0, 1.38, 0], fov: 32 }],
  ]);

  return (
    <>
      <Ground w={40} d={40} color="#07111a" texture="tiles" />
      <CinematicGymProps />
      {/* Upper torso silhouette below neck */}
      <Cyl rTop={0.08} rBottom={0.09} h={0.75} color="#121e29" position={[0, 0.65, 0]} />
      <StylizedBrain3D t={t} />
      <Dust3D t={t} count={120} area={[5, 4, 5]} center={[0, 1.5, 0]} color={RIM_CYAN} opacity={0.65} />
    </>
  );
};

const Scene2Brain: React.FC<{ captions: boolean }> = ({ captions }) => {
  const { width, height } = useVideoConfig();
  const { t } = useShotTime();
  const isOff = t >= 4.45;
  return (
    <StickStyleProvider styleId="tealOrange" mood="void">
      <StickGrade bars="none">
        <StickStage
          width={width}
          height={height}
          fov={42}
          fog={[4, 22]}
          fogColor="#040b12"
          sky={['#02070c', '#081b29', '#103147']}
          keyPos={[3.5, 6, 3.5]}
          keyColor={KEY_ORANGE}
          keyIntensity={3.2}
          fillPos={[-4.5, 3, 3]}
          fillColor={FILL_TEAL}
          fillIntensity={1.8}
          rimPos={[0, 5, -4]}
          rimColor={RIM_CYAN}
          rimIntensity={2.8}
          ambient={0.9}
          dof={{ target: [0, 1.42, 0], aperture: 0.0024, maxblur: 0.01 }}
        >
          <Scene2Inner />
        </StickStage>
        <VerticalHudBadge
          topText="NEURAL FATIGUE LINK"
          mainText={isOff ? 'SIGNAL: DISCONNECTED' : 'SIGNAL: ACTIVE'}
          color={isOff ? RIM_CYAN : KEY_ORANGE}
          bpm={118}
          flatline={isOff}
        />
        {captions ? (
          <VerticalCaption
            accent={isOff ? RIM_CYAN : KEY_ORANGE}
            lines={[
              [0.05, 2.3, 'تخيل معايا لو كان دماغك ما كيحسش بالعيا؟', 'ما كيحسش بالعيا؟'],
              [2.3, 4.5, 'السر هو أن العيا ماشي مشكل ديال العضلات… هو إشارة من الدماغ.', 'إشارة من الدماغ.'],
              [4.5, 6.95, 'وهاد الإشارة عندك نتا… طفات!', 'طفات!'],
            ]}
          />
        ) : null}
      </StickGrade>
    </StickStyleProvider>
  );
};

// -------------------- Scene 3 (12s – 22s, 240f): Peak Performance (Sprint + Teal/Orange Motion Trail) --------------------
const Scene3Inner: React.FC = () => {
  const { t, dur } = useShotTime();
  const heroX = lerp(-5.5, 6.5, prog(t, 0, dur));
  const phase = t * Math.PI * 2 * 2.1;
  const runPose = walkPose(phase, { run: true });

  useOrbitCamera(t, {
    target: [heroX, 1.05, -0.3],
    radius: [5.4, 4.2],
    height: [1.85, 1.35],
    from: -1.1,
    to: 1.25,
    dur,
  });

  return (
    <>
      <NightStreetSet3D />
      {/* Background exhausted stickmen collapsing or walking slowly (softly blurred by DoF) */}
      <StickFigure3D outfit={EXTRA} rim={FILL_TEAL} pose={breathe('kneel', t, 0.6, 1)} position={[-3.2, 0, -1.8]} />
      <StickFigure3D outfit={EXTRA} rim={FILL_TEAL} pose={breathe('handsOnHead', t, 0.6, 2)} position={[0.4, 0, -2.0]} />
      <StickFigure3D outfit={EXTRA} rim={FILL_TEAL} pose={walkPose(t * 2.2)} position={[3.6, 0, -1.7]} />

      {/* Glowing Teal & Orange motion trail (afterimages behind the sprinting hero) */}
      {[1, 2, 3, 4].map((ghost) => (
        <StickFigure3D
          key={ghost}
          outfit={{ top: 'hoodie', color: mix('#102838', KEY_ORANGE, 1 - ghost * 0.2) }}
          rim={ghost % 2 === 0 ? RIM_CYAN : KEY_ORANGE}
          pose={walkPose(phase - ghost * 0.45, { run: true })}
          position={[heroX - ghost * 0.52, 0, -0.3]}
          s={1 - ghost * 0.03}
        />
      ))}

      {/* Main matte-black stickman sprinting with glowing warm orange rim */}
      <StickFigure3D outfit={MATTE_STICKMAN} rim={KEY_ORANGE} pose={runPose} position={[heroX, 0, -0.3]} />
      <Dust3D t={t * 1.8} count={180} area={[18, 5, 9]} center={[heroX, 2.2, 0]} color={KEY_ORANGE} opacity={0.75} />
    </>
  );
};

const Scene3Peak: React.FC<{ captions: boolean }> = ({ captions }) => {
  const { width, height } = useVideoConfig();
  const { t, dur } = useShotTime();
  const heroX = lerp(-5.5, 6.5, prog(t, 0, dur));
  const dynamicBpm = 152 + Math.floor(prog(t, 0, dur) * 18);
  return (
    <StickStyleProvider styleId="tealOrange" mood="night">
      <StickGrade bars="none">
        <StickStage
          width={width}
          height={height}
          fov={46}
          fog={[12, 48]}
          fogColor="#05101a"
          sky={['#030911', '#0a2032', '#143c54']}
          keyPos={[heroX + 4, 9, 5]}
          keyColor={KEY_ORANGE}
          keyIntensity={3.4}
          fillPos={[heroX - 5, 4, 4]}
          fillColor={FILL_TEAL}
          fillIntensity={1.9}
          rimPos={[heroX - 2, 6, -5]}
          rimColor={RIM_CYAN}
          rimIntensity={3.0}
          ambient={0.95}
          dof={{ target: [heroX, 1.05, -0.3], aperture: 0.002, maxblur: 0.0085 }}
        >
          <Scene3Inner />
        </StickStage>
        <VerticalHudBadge topText="MARATHON: 42.2 KM" mainText="UNSTOPPABLE" color={KEY_ORANGE} bpm={dynamicBpm} />
        {captions ? (
          <VerticalCaption
            accent={KEY_ORANGE}
            lines={[
              [0.05, 3.6, 'فلاصال، غاتبقا تطريني حتى يمشيو الناس كاملين بحالهم.', 'كاملين بحالهم.'],
              [3.6, 7.2, 'وفالماراطون؟ غاتجري 42 كيلومتر بلا ما توقف…', '42 كيلومتر'],
              [7.2, 9.95, 'وغاتحس براسك خارق!', 'خارق!'],
            ]}
          />
        ) : null}
      </StickGrade>
    </StickStyleProvider>
  );
};

// -------------------- Scene 4 (22s – 32s, 240f): The Dark Side / Cost (Warning Red/Orange + Cracks + Overheating Heart) --------------------
const GlowingCracksAndHeart3D: React.FC<{ t: number }> = ({ t }) => {
  const heartBeat = 1 + 0.28 * Math.sin(t * 18);
  const crackAppear = prog(t, 0.8, 3.2);
  return (
    <group>
      {/* Overheating glowing red heart in chest */}
      <mesh position={[0.06, 0.78, 0.05]} scale={[heartBeat, heartBeat, heartBeat]}>
        <sphereGeometry args={[0.065, 16, 12]} />
        <meshBasicMaterial color={WARNING_RED} />
      </mesh>
      {/* Glowing cracks across arms, torso, and legs */}
      {crackAppear > 0 ? (
        <group scale={[1, crackAppear, 1]}>
          <mesh position={[0.05, 0.68, 0.06]} rotation={[0, 0, 0.35]}>
            <boxGeometry args={[0.018, 0.26, 0.018]} />
            <meshBasicMaterial color={WARNING_RED} />
          </mesh>
          <mesh position={[0.16, 1.05, 0.14]} rotation={[0, 0, -0.55]}>
            <boxGeometry args={[0.016, 0.24, 0.016]} />
            <meshBasicMaterial color={WARNING_RED} />
          </mesh>
          <mesh position={[0.06, 0.56, 0.13]} rotation={[0, 0, 0.22]}>
            <boxGeometry args={[0.018, 0.28, 0.018]} />
            <meshBasicMaterial color={WARNING_RED} />
          </mesh>
          <mesh position={[-0.05, 0.34, -0.11]} rotation={[0, 0, -0.25]}>
            <boxGeometry args={[0.018, 0.25, 0.018]} />
            <meshBasicMaterial color={WARNING_RED} />
          </mesh>
        </group>
      ) : null}
    </group>
  );
};

const Scene4Inner: React.FC = () => {
  const { t, dur } = useShotTime();
  const redShift = prog(t, 0.4, 1.4);
  const flash = t < 1.4 && Math.sin(t * 28) > 0;
  const activeRim = flash ? RIM_CYAN : mix(KEY_ORANGE, WARNING_RED, redShift);

  const strainPose = breathe(
    posesAt(t, [
      [0, 'ready'],
      [1.8, 'handsOnHead'],
      [4.5, 'crouch'],
      [7.0, 'handsOnHead'],
    ]),
    t * 2.5,
    1.5,
    3,
  );

  const [sx, sy] = shake(t, 0.075, 4.2, 11);
  useDollyCamera(t, [
    [0, { pos: [0.2 + sx, 1.35 + sy, 3.6], look: [0, 1.05 + sy, 0], fov: 44 }],
    [dur, { pos: [-0.35 + sx, 1.2 + sy, 2.55], look: [0, 1.0 + sy, 0], fov: 40 }],
  ]);

  return (
    <>
      <Ground w={50} d={50} color="#0c1117" texture="tiles" cells={14} repeat={[12, 12]} />
      <CinematicGymProps />
      <LightShaft w={3.2} len={6.5} color={WARNING_RED} opacity={0.09} position={[0, 3.0, -0.5]} />
      <StickFigure3D outfit={MATTE_STICKMAN} rim={activeRim} pose={strainPose} position={[0, 0, 0]} />
      <GlowingCracksAndHeart3D t={t} />
      <Dust3D t={t * 1.6} count={180} area={[8, 4.5, 6]} center={[0, 1.8, 0]} color={WARNING_RED} opacity={0.8} />
    </>
  );
};

const Scene4DarkSide: React.FC<{ captions: boolean }> = ({ captions }) => {
  const { width, height } = useVideoConfig();
  const { t, dur } = useShotTime();
  const overheatBpm = 178 + Math.floor(prog(t, 0, dur) * 34);
  return (
    <StickStyleProvider styleId="ember" mood="storm">
      <StickGrade bars="none">
        <StickStage
          width={width}
          height={height}
          fov={44}
          fog={[4.5, 22]}
          fogColor="#0d080c"
          sky={['#060409', '#160b14', '#2b121e']}
          keyPos={[3.5, 7, 3.5]}
          keyColor={WARNING_RED}
          keyIntensity={3.5}
          fillPos={[-5, 3.5, 3.5]}
          fillColor={FILL_TEAL}
          fillIntensity={1.7}
          rimPos={[-2, 6, -5]}
          rimColor={KEY_ORANGE}
          rimIntensity={2.9}
          ambient={0.85}
          dof={{ target: [0, 1.05, 0], aperture: 0.0022, maxblur: 0.009 }}
        >
          <Scene4Inner />
        </StickStage>
        <VerticalHudBadge
          topText="SAFETY ALARM: DISABLED"
          mainText="CRITICAL OVERHEAT"
          color={WARNING_RED}
          bpm={overheatBpm}
        />
        {captions ? (
          <VerticalCaption
            accent={WARNING_RED}
            lines={[
              [0.05, 3.2, 'ولكن هنا كيبان الوجه المظلم! العيا راه جهاز إنذار كيحمي حياتك.', 'الوجه المظلم!'],
              [3.2, 6.8, 'بلا بيه، العضلات ديالك غادي يتقطعو…', 'يتقطعو…'],
              [6.8, 9.95, 'وقلبك غادي يسخن بزاف!', 'يسخن بزاف!'],
            ]}
          />
        ) : null}
      </StickGrade>
    </StickStyleProvider>
  );
};

// -------------------- Scene 5 (32s – 42s, 240f): Climax — Slow-Mo Leg Fracture & High-Angle Pullback --------------------
const FractureParticles: React.FC<{ t: number; origin: [number, number, number] }> = ({ t, origin }) => {
  const seeds = useMemo(() => {
    const r = rng(99);
    return Array.from({ length: 65 }, () => [
      (r() - 0.5) * 2.4,
      0.4 + r() * 1.8,
      (r() - 0.5) * 2.0,
      0.03 + r() * 0.045,
    ]);
  }, []);
  if (t < 0) return null;
  const dt = Math.min(t, 4);
  return (
    <group position={origin}>
      {seeds.map(([vx, vy, vz, sz], i) => {
        const x = vx * dt * 0.55;
        const y = Math.max(0.03, vy * dt * 0.5 - 0.7 * dt * dt * 0.25);
        const z = vz * dt * 0.55;
        return (
          <mesh key={i} position={[x, y, z]} rotation={[dt * 2, dt * 3, 0]} castShadow>
            <octahedronGeometry args={[sz, 0]} />
            <meshBasicMaterial color={i % 2 === 0 ? WARNING_RED : KEY_ORANGE} />
          </mesh>
        );
      })}
    </group>
  );
};

const collapsedOnGround: Pose = {
  head: [68, -22],
  sh: [38, -26],
  hip: [-14, -22],
  eF: [52, -12],
  hF: [78, -6],
  eB: [24, -14],
  hB: [48, -8],
  kF: [-46, -28],
  fF: [-78, -8],
  kB: [-52, -16],
  fB: [-86, -4],
};

const Scene5Inner: React.FC = () => {
  const { t, dur } = useShotTime();
  const snapTime = 2.2;
  const effectiveT = t < snapTime ? t : snapTime + (t - snapTime) * 0.28;

  const sprintPose = walkPose(effectiveT * Math.PI * 2 * 1.8, { run: true });
  const bucklePose = withPose('kneel', { head: [26, -138], sh: [16, -110], kF: [42, -26], kB: [-18, -18] });
  const figurePose =
    t < snapTime
      ? sprintPose
      : posesAt(
          t - snapTime,
          [
            [0, bucklePose],
            [0.9, 'fall'],
            [2.1, collapsedOnGround],
          ],
          0.85,
        );

  useDollyCamera(t, [
    [0, { pos: [0.4, 1.1, 3.1], look: [0, 0.85, 0], fov: 44 }],
    [snapTime, { pos: [0.2, 1.0, 2.7], look: [0, 0.65, 0], fov: 42 }],
    [dur, { pos: [0, 5.6, 4.4], look: [0, 0.25, 0], fov: 46 }],
  ]);

  const fadeRed = mix(WARNING_RED, '#3b1515', prog(t, 5.5, dur));

  return (
    <>
      <Ground w={50} d={50} color="#090d14" texture="tiles" cells={16} repeat={[14, 14]} />
      <CinematicGymProps />
      <LightShaft w={2.8} len={6.5} color={fadeRed} opacity={0.08 * (1 - prog(t, 6.5, dur))} position={[0, 3.2, 0]} />
      <StickFigure3D outfit={MATTE_STICKMAN} rim={fadeRed} pose={figurePose} position={[0, 0, 0]} />
      <FractureParticles t={t - snapTime} origin={[0.1, 0.35, 0]} />
      <Dust3D t={effectiveT} count={140} area={[8, 5, 8]} center={[0, 1.8, 0]} color={KEY_ORANGE} opacity={0.65} />
    </>
  );
};

const Scene5Climax: React.FC<{ captions: boolean }> = ({ captions }) => {
  const { width, height } = useVideoConfig();
  const { t, dur } = useShotTime();
  const fadeBlack = ease.in(prog(t, dur - 1.4, dur));
  const snapped = t >= 2.2;
  return (
    <StickStyleProvider styleId="ember" mood="storm">
      <StickGrade bars="none">
        <StickStage
          width={width}
          height={height}
          fov={44}
          fog={[4, 24]}
          fogColor="#09080f"
          sky={['#040408', '#120a14', '#22101c']}
          keyPos={[3, 8, 3]}
          keyColor={WARNING_RED}
          keyIntensity={3.1}
          fillPos={[-5, 4, 3]}
          fillColor={FILL_TEAL}
          fillIntensity={1.6}
          rimPos={[0, 6, -5]}
          rimColor={KEY_ORANGE}
          rimIntensity={2.6}
          ambient={0.85}
          dof={{ target: [0, 0.55, 0], aperture: 0.0022, maxblur: 0.009 }}
        >
          <Scene5Inner />
        </StickStage>
        <VerticalHudBadge
          topText="STRUCTURAL FAILURE"
          mainText="BODY BROKE"
          color={WARNING_RED}
          bpm={210}
          flatline={snapped}
        />
        {captions ? (
          <VerticalCaption
            accent={WARNING_RED}
            lines={[
              [0.05, 3.0, 'وفوسط الجرية، رجليك غادي يتهرسو على غفلة!', 'يتهرسو على غفلة!'],
              [3.0, 6.2, 'ما غاديش توقف حيت عييتي…', 'حيت عييتي…'],
              [6.2, 9.6, 'غاتوقف حيت الجسم ديالك تحطم.', 'تحطم.'],
            ]}
          />
        ) : null}
        {fadeBlack > 0 ? <AbsoluteFill style={{ backgroundColor: '#000', opacity: fadeBlack }} /> : null}
      </StickGrade>
    </StickStyleProvider>
  );
};

// -------------------- Scene 6 (42s – 48s, 144f): Outro — Warm Teal & Orange Recovery & Sliding Letterbox Bars --------------------
const Scene6Inner: React.FC = () => {
  const { t, dur } = useShotTime();
  const risePose = breathe(
    posesAt(
      t,
      [
        [0, collapsedOnGround],
        [1.1, 'kneel'],
        [2.5, 'stand'],
        [3.8, 'relaxed'],
      ],
      0.9,
    ),
    t,
    0.8,
    2,
  );
  const rimCol = mix(FILL_TEAL, KEY_ORANGE, ease.inOut(prog(t, 0.3, 2.5)));

  useOrbitCamera(t, {
    target: [0, 0.95, 0],
    radius: [4.2, 5.0],
    height: [1.35, 1.65],
    from: -0.35,
    to: 0.35,
    dur,
  });

  return (
    <>
      <Ground w={50} d={50} color="#08131c" texture="tiles" cells={16} repeat={[14, 14]} />
      <CinematicGymProps />
      <LightShaft w={3.0} len={6.5} color={KEY_ORANGE} opacity={0.08} position={[0, 3.2, -0.5]} />
      <StickFigure3D outfit={MATTE_STICKMAN} rim={rimCol} pose={risePose} position={[0, 0, 0]} />
      <Dust3D t={t * 0.6} count={140} area={[8, 4.5, 8]} center={[0, 1.8, 0]} color={KEY_ORANGE} opacity={0.7} />
    </>
  );
};

const Scene6Outro: React.FC<{ captions: boolean }> = ({ captions }) => {
  const { width, height } = useVideoConfig();
  const { t, dur } = useShotTime();
  const barSlide = ease.inOut(prog(t, 2.2, 4.8));
  const barHeight = barSlide * 220;
  const fadeOut = ease.in(prog(t, dur - 0.9, dur));

  return (
    <StickStyleProvider styleId="tealOrange" mood="dusk">
      <StickGrade bars="none">
        <StickStage
          width={width}
          height={height}
          fov={44}
          fog={[5, 26]}
          fogColor="#06121c"
          sky={['#040c14', '#0d2536', '#184359']}
          keyPos={[4, 7.5, 4]}
          keyColor={KEY_ORANGE}
          keyIntensity={3.3}
          fillPos={[-5, 4, 3.5]}
          fillColor={FILL_TEAL}
          fillIntensity={1.9}
          rimPos={[-2, 6, -5]}
          rimColor={RIM_CYAN}
          rimIntensity={2.9}
          ambient={0.95}
          dof={{ target: [0, 0.95, 0], aperture: 0.0022, maxblur: 0.009 }}
        >
          <Scene6Inner />
        </StickStage>
        <VerticalHudBadge
          topText="PROTECTIVE SIGNAL"
          mainText="THANK YOUR BRAIN"
          color={KEY_ORANGE}
          bpm={72}
        />
        {captions ? (
          <VerticalCaption
            accent={KEY_ORANGE}
            lines={[
              [0.05, 3.1, 'المرة الجاية ملي تحس بالعيا، شكر دماغك…', 'شكر دماغك…'],
              [3.1, 5.8, 'راه يلاه عتق ليك حياتك.', 'عتق ليك حياتك.'],
            ]}
          />
        ) : null}
        {/* Sliding vertical letterbox bars */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: barHeight, background: '#000' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: barHeight, background: '#000' }} />
        {fadeOut > 0 ? <AbsoluteFill style={{ backgroundColor: '#000', opacity: fadeOut }} /> : null}
      </StickGrade>
    </StickStyleProvider>
  );
};

// -------------------- Master 48-Second Vertical (1080×1920) Composition --------------------
export const NoFatigueShorts3D: React.FC<NoFatigueShortsProps> = ({
  voiceoverFile,
  sfxFile = 'sfx-track.wav',
  captions = true,
}) => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#000',
        scale: 0.9
      }}
    >
      {/* Cinematic Stereo SFX Track (No voiceover — ready for your own voice recording) */}
      {sfxFile ? <Audio src={staticFile(sfxFile)} volume={0.85} /> : null}
      {voiceoverFile ? <Audio src={staticFile(voiceoverFile)} /> : null}

      {/* Scene 1: The Hook (00s – 05s, 0..120) */}
      <Sequence durationInFrames={120} name="01-Hook-PushUps">
        <Scene1Hook captions={captions} />
      </Sequence>

      {/* Scene 2: The Core Concept (05s – 12s, 120..288) */}
      <Sequence from={120} durationInFrames={168} name="02-Brain-Signal-Off">
        <Scene2Brain captions={captions} />
      </Sequence>

      {/* Scene 3: Peak Performance (12s – 22s, 288..528) */}
      <Sequence from={288} durationInFrames={240} name="03-Peak-Sprint-Trail">
        <Scene3Peak captions={captions} />
      </Sequence>

      {/* Scene 4: The Dark Side / Cost (22s – 32s, 528..768) */}
      <Sequence from={528} durationInFrames={240} name="04-Dark-Side-Warning-Red">
        <Scene4DarkSide captions={captions} />
      </Sequence>

      {/* Scene 5: The Climax (32s – 42s, 768..1008) */}
      <Sequence from={768} durationInFrames={240} name="05-Climax-Leg-Fracture">
        <Scene5Climax captions={captions} />
      </Sequence>

      {/* Scene 6: Outro (42s – 48s, 1008..1152) */}
      <Sequence from={1008} durationInFrames={144} name="06-Outro-Recovery">
        <Scene6Outro captions={captions} />
      </Sequence>

      {/* 20-Year Editor Montage Overlay: Optical Cut Flashes & Bottom Retention Progress Bar */}
      <CinematicMontageOverlay />
    </AbsoluteFill>
  );
};
