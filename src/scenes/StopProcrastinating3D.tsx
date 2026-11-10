// src/scenes/StopProcrastinating3D.tsx — 60-second (1440 frames @ 24fps) 8-scene video:
// "How to Stop Procrastinating and Take Action" in the GrowKaz Emerald 3D Stickman style.
//
// Works standalone without audio (includes synced cinematic captions & HUD graphics),
// and also supports an optional `voiceoverFile` in `public/` (e.g. "voiceover.mp3") via <Audio>.
import React from 'react';
import * as THREE from 'three';
import {
  AbsoluteFill,
  Audio,
  Sequence,
  staticFile,
  useVideoConfig,
  Solid,
} from 'remotion';
import {
  BedroomSet3D,
  Box,
  Cyl,
  Dust3D,
  Ground,
  HERO,
  LabSet3D,
  LightShaft,
  NightStreetSet3D,
  Sphere,
  StadiumSet3D,
  StickFigure3D,
  StickGrade,
  StickStage,
  StickStyleProvider,
  breathe,
  clamp,
  ease,
  lerp,
  posesAt,
  prog,
  shade,
  shake,
  useDollyCamera,
  useOrbitCamera,
  useShotTime,
  useStick,
  walkPose,
  withPose,
} from '../stickman';

export type StopProcrastinatingProps = {
  /** Optional filename inside `public/`, e.g. "voiceover.mp3". Leave empty for silent render. */
  voiceoverFile?: string;
  /** Show synced bottom captions (default true). */
  captions?: boolean;
};

// -------------------- Shared 2D Overlays (Captions, Badge, Flash, CTA) --------------------

const CaptionBar: React.FC<{ lines: [number, number, string][] }> = ({ lines }) => {
  const { t } = useShotTime();
  const { style } = useStick();
  const { height } = useVideoConfig();
  const active = lines.find(([from, to]) => t >= from && t <= to);
  if (!active) return null;
  const [from, to, text] = active;
  const fade = ease.out(prog(t, from, from + 0.22)) * (1 - ease.in(prog(t, to - 0.22, to)));
  return (
    <AbsoluteFill
      style={{
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: height * 0.095,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          opacity: fade,
          transform: `translateY(${(1 - fade) * 10}px) scale(${0.96 + 0.04 * fade})`,
          background: style.ui.card,
          border: `1.5px solid ${style.ui.cardLine}`,
          borderRadius: height * 0.016,
          padding: `${height * 0.014}px ${height * 0.032}px`,
          maxWidth: '78%',
          textAlign: 'center',
          fontFamily: 'Nunito, Fredoka, system-ui, sans-serif',
          fontWeight: 800,
          fontSize: height * 0.031,
          lineHeight: 1.3,
          color: style.ui.cream,
          boxShadow: '0 12px 32px rgba(0,0,0,0.55)',
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};

const CornerBadge: React.FC<{ label: string; sub?: string; accent?: string }> = ({ label, sub, accent }) => {
  const { t, dur } = useShotTime();
  const { style } = useStick();
  const { height, width } = useVideoConfig();
  const pop = ease.outBack(prog(t, 0.25, 0.7)) * (1 - ease.in(prog(t, dur - 0.45, dur - 0.1)));
  const col = accent ?? style.ui.gold;
  return (
    <div
      style={{
        position: 'absolute',
        top: height * 0.095,
        right: width * 0.055,
        opacity: clamp(pop),
        transform: `scale(${pop})`,
        background: style.ui.card,
        border: `2px solid ${col}`,
        borderRadius: height * 0.018,
        padding: `${height * 0.012}px ${height * 0.026}px`,
        textAlign: 'right',
        boxShadow: `0 0 ${height * 0.025}px ${col}44`,
      }}
    >
      {sub ? (
        <div
          style={{
            fontFamily: 'Nunito, system-ui, sans-serif',
            fontWeight: 800,
            fontSize: height * 0.016,
            letterSpacing: '0.18em',
            color: style.ui.text,
          }}
        >
          {sub}
        </div>
      ) : null}
      <div
        style={{
          fontFamily: 'Fredoka, Nunito, system-ui, sans-serif',
          fontWeight: 800,
          fontSize: height * 0.042,
          letterSpacing: '0.08em',
          color: col,
          textShadow: `0 0 ${height * 0.018}px ${col}88`,
        }}
      >
        {label}
      </div>
    </div>
  );
};

const FlashIn: React.FC<{ dur?: number }> = ({ dur = 0.45 }) => {
  const { t } = useShotTime();
  if (t >= dur) return null;
  const a = (1 - t / dur) ** 2;
  return <AbsoluteFill style={{ backgroundColor: '#ffffff', opacity: a, pointerEvents: 'none' }} />;
};

// -------------------- Scene 1 (0:00 – 0:07, 168f): The Trap --------------------
const Scene1Inner: React.FC = () => {
  const { t, dur } = useShotTime();
  const { style, M } = useStick();
  const slumped = withPose('sitBack', { head: [10, -170], eF: [18, -118], hF: [30, -138] });
  const heroPose = breathe(
    posesAt(t, [
      [0, slumped],
      [3.6, 'facepalm'],
    ]),
    t,
    0.7,
    1,
  );
  useDollyCamera(t, [
    [0, { pos: [-2.8, 2.25, 3.6], look: [1.2, 1.05, -2.0], fov: 36 }],
    [dur, { pos: [0.1, 1.55, 1.55], look: [1.65, 1.05, -2.1], fov: 32 }],
  ]);
  return (
    <>
      <BedroomSet3D />
      <StickFigure3D outfit={HERO} pose={heroPose} position={[1.45, 0, -1.85]} />
      <Dust3D t={t} count={130} area={[9, 3.8, 6]} center={[0, 1.9, -1.5]} color={style.ui.blueprint} opacity={0.6} />
      <Dust3D t={t} count={60} area={[6, 3.5, 4]} center={[-1.2, 1.8, -1.5]} color={M.key} opacity={0.5} seed={9} />
    </>
  );
};

const Scene1Trap: React.FC<{ captions: boolean }> = ({ captions }) => {
  const { width, height } = useVideoConfig();
  return (
    <StickStyleProvider styleId="emerald" mood="night">
      <StickGrade bars="wide">
        <StickStage width={width} height={height} fov={35} fog={[10, 36]} keyPos={[-5, 7, 4]} keyIntensity={2.3} ambient={1.1}>
          <Scene1Inner />
        </StickStage>
        <CornerBadge sub="PROCRASTINATION" label="THE TRAP" accent="#ff6f61" />
        {captions ? (
          <CaptionBar
            lines={[
              [0.1, 3.6, "Right now, there's one task you know you should be doing…"],
              [3.6, 6.9, "…but you're scrolling instead. Why?"],
            ]}
          />
        ) : null}
      </StickGrade>
    </StickStyleProvider>
  );
};

// -------------------- Scene 2 (0:07 – 0:15, 192f): The Myth of Motivation --------------------
const Clock3D: React.FC<{ t: number; position: [number, number, number]; rimColor: string; faceColor: string }> = ({
  t,
  position,
  rimColor,
  faceColor,
}) => {
  const minAngle = -t * 1.8;
  const hourAngle = -t * 0.25;
  return (
    <group position={position}>
      <Cyl rTop={1.35} rBottom={1.35} h={0.14} color={faceColor} seg={32} rotation={[Math.PI / 2, 0, 0]} />
      <mesh position={[0, 0, 0.08]}>
        <ringGeometry args={[1.22, 1.35, 36]} />
        <meshBasicMaterial color={rimColor} />
      </mesh>
      {/* Minute hand */}
      <group position={[0, 0, 0.09]} rotation={[0, 0, minAngle]}>
        <mesh position={[0, 0.45, 0]}>
          <boxGeometry args={[0.08, 0.95, 0.04]} />
          <meshBasicMaterial color={rimColor} />
        </mesh>
      </group>
      {/* Hour hand */}
      <group position={[0, 0, 0.1]} rotation={[0, 0, hourAngle]}>
        <mesh position={[0, 0.28, 0]}>
          <boxGeometry args={[0.1, 0.6, 0.04]} />
          <meshBasicMaterial color={rimColor} />
        </mesh>
      </group>
    </group>
  );
};

const Scene2Inner: React.FC = () => {
  const { t, dur } = useShotTime();
  const { style, M } = useStick();
  const heroPose = breathe(
    posesAt(t, [
      [0, 'stand'],
      [1.8, 'shrug'],
      [4.2, 'think'],
      [6.0, 'sad'],
    ]),
    t,
    1,
    2,
  );
  useOrbitCamera(t, { target: [0, 1.6, -1.2], radius: [8.8, 6.6], height: [2.5, 1.8], from: -0.7, to: 0.55, dur });
  return (
    <>
      <Ground w={70} d={70} color={shade(M.floor, -0.2)} texture="tiles" cells={16} repeat={[14, 14]} />
      {/* Towering glowing monolith wall representing the intimidating "START" */}
      <Box size={[4.6, 6.2, 0.6]} color={shade(M.wall, -0.15)} position={[0, 3.1, -3.6]} />
      <mesh position={[0, 3.1, -3.28]}>
        <planeGeometry args={[4.1, 5.6]} />
        <meshBasicMaterial color={M.practical} />
      </mesh>
      <LightShaft w={4.4} len={6.5} color={M.practical} opacity={0.07} position={[0, 3.0, -1.8]} rotation={[-0.65, 0, 0]} />
      <Clock3D t={t} position={[-3.6, 3.6, -2.8]} rimColor={style.ui.accent} faceColor={shade(M.dark, 0.1)} />
      <StickFigure3D outfit={HERO} pose={heroPose} position={[0, 0, -0.4]} />
      <Dust3D t={t} count={150} area={[14, 5, 8]} center={[0, 2.5, -1]} color={M.practical} opacity={0.6} />
    </>
  );
};

const Scene2Myth: React.FC<{ captions: boolean }> = ({ captions }) => {
  const { width, height } = useVideoConfig();
  return (
    <StickStyleProvider styleId="emerald" mood="void">
      <StickGrade bars="wide">
        <StickStage width={width} height={height} fov={35} fog={[14, 50]} keyPos={[0, 10, 4]} keyIntensity={2.6} ambient={1.1}>
          <Scene2Inner />
        </StickStage>
        <CornerBadge sub="MYTH" label="WAIT UNTIL READY?" />
        {captions ? (
          <CaptionBar
            lines={[
              [0.1, 2.8, "Because you're waiting to feel ready."],
              [2.8, 5.6, "Here's the truth: motivation doesn't come before action."],
              [5.6, 7.9, 'It comes AFTER.'],
            ]}
          />
        ) : null}
      </StickGrade>
    </StickStyleProvider>
  );
};

// -------------------- Scene 3 (0:15 – 0:24, 216f): The Brain's Friction (Boulder) --------------------
const Scene3Inner: React.FC = () => {
  const { t, dur } = useShotTime();
  const { style, M } = useStick();
  const pushX = lerp(-1.8, -0.35, ease.inOut(prog(t, 0, dur)));
  const strainPose = withPose('reach', {
    head: [18, -184],
    sh: [12, -154],
    eF: [42, -148],
    hF: [70, -156],
    eB: [36, -138],
    hB: [66, -146],
    kF: [28, -46],
    fF: [18, 0],
    kB: [-22, -46],
    fB: [-38, 0],
  });
  const heroPose = breathe(strainPose, t * 2.4, 1.4, 5);
  const [sx, sy] = shake(t, 0.045, 3.2, 7);
  useDollyCamera(t, [
    [0, { pos: [-1.4 + sx, 1.55 + sy, 5.2], look: [pushX + 0.8, 1.15 + sy, 0], fov: 35 }],
    [dur, { pos: [0.4 + sx, 1.35 + sy, 4.3], look: [pushX + 0.9, 1.15 + sy, 0], fov: 33 }],
  ]);

  return (
    <>
      <Ground w={70} d={70} color={shade(M.floor, -0.25)} texture="tiles" cells={14} repeat={[12, 12]} />
      <Box size={[40, 9, 0.5]} color={shade(M.wall, -0.3)} position={[0, 4.5, -4.2]} />
      {[-6, -2, 2, 6].map((x) => (
        <LightShaft key={x} w={2.0} len={6.5} color={style.ui.accent} opacity={0.05} position={[x, 3.2, -1.5]} rotation={[-0.3, 0, 0]} />
      ))}
      {/* Giant low-poly boulder */}
      <Sphere r={1.38} color={shade(M.wall, 0.08)} flat position={[pushX + 1.68, 1.32, 0]} />
      <StickFigure3D outfit={HERO} pose={heroPose} position={[pushX, 0, 0]} />
      <Dust3D t={t} count={160} area={[14, 4.5, 8]} center={[0, 2.2, 0]} color={style.ui.accent} opacity={0.6} />
    </>
  );
};

const Scene3Friction: React.FC<{ captions: boolean }> = ({ captions }) => {
  const { width, height } = useVideoConfig();
  return (
    <StickStyleProvider styleId="emerald" mood="storm">
      <StickGrade bars="wide">
        <StickStage width={width} height={height} fov={35} fog={[12, 44]} keyPos={[-4, 10, 5]} keyIntensity={2.5} ambient={1.05}>
          <Scene3Inner />
        </StickStage>
        <CornerBadge sub="BRAIN FRICTION" label="TOO HEAVY" accent="#ff6f61" />
        {captions ? (
          <CaptionBar
            lines={[
              [0.1, 3.0, 'Your brain hates big, blurry goals.'],
              [3.0, 6.2, "'Write the report' or 'get in shape' feels like pushing a boulder…"],
              [6.2, 8.9, '…so your brain hits the brakes.'],
            ]}
          />
        ) : null}
      </StickGrade>
    </StickStyleProvider>
  );
};

// -------------------- Scene 4 (0:24 – 0:33, 216f): The 2-Minute Rule (Lab) --------------------
const Scene4Inner: React.FC = () => {
  const { t, dur } = useShotTime();
  const { style } = useStick();
  const shrinkK = ease.outBack(prog(t, 0.35, 1.4));
  const cubeScale = lerp(2.4, 0.28, clamp(shrinkK, 0, 1.15));
  const heroPose = breathe(
    posesAt(t, [
      [0, 'handsOnHead'],
      [1.2, 'think'],
      [3.0, 'point'],
      [5.5, 'explain'],
    ]),
    t,
    1,
    3,
  );
  useDollyCamera(t, [
    [0, { pos: [-3.2, 2.2, 4.8], look: [0, 1.25, -1.0], fov: 36 }],
    [dur, { pos: [1.6, 1.55, 3.1], look: [-0.2, 1.18, -0.9], fov: 32 }],
  ]);

  return (
    <>
      <LabSet3D bench pods />
      {/* Shrinking boulder -> tiny glowing 2-minute golden action cube on the lab bench */}
      <mesh position={[0, 1.12 + (cubeScale - 0.28) * 0.4, -0.75]} rotation={[t * 0.7, t * 1.1, 0]}>
        <boxGeometry args={[cubeScale, cubeScale, cubeScale]} />
        <meshBasicMaterial color={style.ui.gold} />
      </mesh>
      <StickFigure3D outfit={HERO} pose={heroPose} position={[-1.35, 0, -1.1]} />
      <Dust3D t={t} count={160} area={[12, 4.5, 7]} center={[0, 2.2, -1.2]} color={style.ui.blueprint} opacity={0.7} />
    </>
  );
};

const Scene4TwoMinRule: React.FC<{ captions: boolean }> = ({ captions }) => {
  const { width, height } = useVideoConfig();
  return (
    <StickStyleProvider styleId="emerald" mood="void">
      <StickGrade bars="wide">
        <StickStage width={width} height={height} fov={35} fog={[14, 48]} keyPos={[0, 9, 5]} keyIntensity={2.7} ambient={1.2}>
          <Scene4Inner />
        </StickStage>
        <CornerBadge sub="THE SECRET WEAPON" label="02:00 RULE" />
        <FlashIn dur={0.45} />
        {captions ? (
          <CaptionBar
            lines={[
              [0.1, 2.9, 'To beat procrastination, shrink the starting line.'],
              [2.9, 5.8, 'Use the Two-Minute Rule:'],
              [5.8, 8.9, 'Make the first step so small it feels stupid to say no.'],
            ]}
          />
        ) : null}
      </StickGrade>
    </StickStyleProvider>
  );
};

// -------------------- Scene 5 (0:33 – 0:42, 216f): Action Triggers Momentum --------------------
const EnergyRings: React.FC<{ t: number; center: [number, number, number]; color: string }> = ({ t, center, color }) => {
  return (
    <group position={center}>
      {[0, 1, 2].map((i) => {
        const phase = (t * 0.75 + i / 3) % 1;
        const r = lerp(0.35, 2.8, phase);
        const op = (1 - phase) * 0.55;
        return (
          <mesh key={i} position={[0, phase * 1.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[r, r + 0.08, 36]} />
            <meshBasicMaterial color={color} transparent opacity={op} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
          </mesh>
        );
      })}
    </group>
  );
};

const Scene5Inner: React.FC = () => {
  const { t, dur } = useShotTime();
  const { style, M } = useStick();
  const typeA = withPose('sit', { eF: [24, -112], hF: [46, -104], eB: [18, -110], hB: [40, -100] });
  const typeB = withPose('sit', { eF: [26, -108], hF: [48, -96], eB: [20, -114], hB: [42, -106] });
  const typing = Math.sin(t * 14) > 0 ? typeA : typeB;
  const heroPose = breathe(typing, t, 0.8, 2);

  useOrbitCamera(t, { target: [1.4, 1.15, -1.9], radius: [5.6, 4.4], height: [1.5, 2.35], from: -0.45, to: 0.35, dur });
  return (
    <>
      <BedroomSet3D />
      <StickFigure3D outfit={HERO} pose={heroPose} position={[1.45, 0, -1.85]} />
      <EnergyRings t={t} center={[1.45, 0.15, -1.85]} color={style.ui.accent} />
      <Dust3D t={t} count={150} area={[10, 4, 6]} center={[0.5, 2, -1.5]} color={M.practical} opacity={0.7} />
    </>
  );
};

const Scene5Momentum: React.FC<{ captions: boolean }> = ({ captions }) => {
  const { width, height } = useVideoConfig();
  return (
    <StickStyleProvider styleId="emerald" mood="dusk">
      <StickGrade bars="wide">
        <StickStage width={width} height={height} fov={34} fog={[12, 42]} keyPos={[-4, 8, 5]} keyIntensity={2.8} ambient={1.3}>
          <Scene5Inner />
        </StickStage>
        <CornerBadge sub="STEP ONE" label="JUST START" accent="#c6ff3d" />
        {captions ? (
          <CaptionBar
            lines={[
              [0.1, 4.4, "Don't 'work out for an hour'—just tie your shoes."],
              [4.4, 8.9, "Don't 'write a chapter'—just write one ugly sentence."],
            ]}
          />
        ) : null}
      </StickGrade>
    </StickStyleProvider>
  );
};

// -------------------- Scene 6 (0:42 – 0:51, 216f): The Snowball Effect (Night Street Sprint) --------------------
const Scene6Inner: React.FC = () => {
  const { t, dur } = useShotTime();
  const { style, M } = useStick();
  const isRun = t > 2.2;
  const heroX = lerp(-6.5, 6.5, ease.inOut(prog(t, 0, dur)));
  const phase = t * Math.PI * 2 * (isRun ? 1.65 : 0.95);
  const heroPose = walkPose(phase, { run: isRun });

  useDollyCamera(t, [
    [0, { pos: [-7.5, 1.9, 4.8], look: [-4.5, 1.15, -0.5], fov: 36 }],
    [dur, { pos: [4.8, 1.65, 4.2], look: [6.0, 1.15, -0.5], fov: 34 }],
  ]);

  return (
    <>
      <NightStreetSet3D />
      <StickFigure3D outfit={HERO} pose={heroPose} position={[heroX, 0, -0.4]} />
      <Dust3D t={t} count={180} area={[20, 4.5, 9]} center={[0, 2.2, 0]} color={style.ui.accent} opacity={0.65} />
      <Dust3D t={t} count={90} area={[18, 4, 8]} center={[0, 2, 0]} color={M.practical} opacity={0.55} seed={5} />
    </>
  );
};

const Scene6Snowball: React.FC<{ captions: boolean }> = ({ captions }) => {
  const { width, height } = useVideoConfig();
  return (
    <StickStyleProvider styleId="emerald" mood="night">
      <StickGrade bars="wide">
        <StickStage width={width} height={height} fov={35} fog={[14, 52]} keyPos={[-6, 10, 5]} keyIntensity={2.7} ambient={1.2}>
          <Scene6Inner />
        </StickStage>
        <CornerBadge sub="MOMENTUM" label="80% DONE" />
        {captions ? (
          <CaptionBar
            lines={[
              [0.1, 4.2, "Once you're in motion, physics takes over."],
              [4.2, 8.9, 'Starting is 80% of the battle—momentum handles the rest.'],
            ]}
          />
        ) : null}
      </StickGrade>
    </StickStyleProvider>
  );
};

// -------------------- Scene 7 (0:51 – 0:56, 120f): The Climax (Stadium) --------------------
const Scene7Inner: React.FC = () => {
  const { t, dur } = useShotTime();
  const { M } = useStick();
  const heroPose = breathe(
    posesAt(t, [
      [0, 'ready'],
      [0.9, 'cheer'],
    ]),
    t,
    1.1,
    1,
  );
  useOrbitCamera(t, { target: [0, 2.0, -3.5], radius: [12.5, 9.5], height: [2.1, 1.45], from: -0.5, to: 0.35, dur });
  return (
    <>
      <StadiumSet3D />
      <StickFigure3D outfit={HERO} pose={heroPose} position={[0, 0, 0]} />
      <Dust3D t={t} count={220} area={[22, 7, 14]} center={[0, 3.5, -2]} color={M.key} opacity={0.65} />
    </>
  );
};

const Scene7Climax: React.FC<{ captions: boolean }> = ({ captions }) => {
  const { width, height } = useVideoConfig();
  return (
    <StickStyleProvider styleId="emerald" mood="night">
      <StickGrade bars="wide">
        <StickStage width={width} height={height} fov={40} fog={[22, 85]} keyPos={[-10, 16, 8]} keyIntensity={2.9} ambient={1.3} shadowSize={20}>
          <Scene7Inner />
        </StickStage>
        <CornerBadge sub="NO EXCUSES" label="TAKE ACTION" accent="#c6ff3d" />
        <FlashIn dur={0.35} />
        {captions ? (
          <CaptionBar
            lines={[
              [0.1, 2.4, 'Stop negotiating with your excuses.'],
              [2.4, 4.9, 'Lower the bar, start messy, and move.'],
            ]}
          />
        ) : null}
      </StickGrade>
    </StickStyleProvider>
  );
};

// -------------------- Scene 8 (0:56 – 1:00, 96f): Call to Action (Freeze / Pull-Back) --------------------
const Scene8Inner: React.FC = () => {
  const { t, dur } = useShotTime();
  const { style, M } = useStick();
  // Time-stop / slow-motion feel: t * 0.15 slows particle drift and breathing
  const slowT = t * 0.15;
  const heroPose = breathe('cheer', slowT, 0.5, 1);
  useOrbitCamera(t, { target: [0, 2.1, -3.5], radius: [9.5, 13.5], height: [1.45, 2.6], from: 0.35, to: 0.65, dur });
  return (
    <>
      <StadiumSet3D />
      <StickFigure3D outfit={HERO} pose={heroPose} position={[0, 0, 0]} />
      <EnergyRings t={slowT} center={[0, 0.2, 0]} color={style.ui.gold} />
      <Dust3D t={slowT} count={240} area={[22, 7, 14]} center={[0, 3.5, -2]} color={M.key} opacity={0.75} />
    </>
  );
};

const CtaCard: React.FC = () => {
  const { t, dur } = useShotTime();
  const { style } = useStick();
  const { height } = useVideoConfig();
  const enter = ease.outBack(prog(t, 0.25, 0.9));
  const dipOut = ease.in(prog(t, dur - 0.65, dur));
  return (
    <>
      <AbsoluteFill
        style={{
          justifyContent: 'flex-start',
          alignItems: 'center',
          paddingTop: height * 0.11,
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            opacity: clamp(enter),
            transform: `scale(${0.85 + 0.15 * enter})`,
            background: style.ui.card,
            border: `2.5px solid ${style.ui.gold}`,
            borderRadius: height * 0.022,
            padding: `${height * 0.018}px ${height * 0.044}px`,
            textAlign: 'center',
            boxShadow: `0 18px 48px rgba(0,0,0,0.75), 0 0 ${height * 0.04}px ${style.ui.gold}55`,
          }}
        >
          <div
            style={{
              fontFamily: 'Fredoka, Nunito, system-ui, sans-serif',
              fontWeight: 800,
              fontSize: height * 0.052,
              letterSpacing: '0.16em',
              color: style.ui.gold,
              textShadow: `0 0 ${height * 0.025}px ${style.ui.gold}99`,
            }}
          >
            02:00 · START NOW
          </div>
          <div
            style={{
              marginTop: height * 0.006,
              fontFamily: 'Nunito, system-ui, sans-serif',
              fontWeight: 700,
              fontSize: height * 0.022,
              letterSpacing: '0.08em',
              color: style.ui.cream,
            }}
          >
            Set a 2-minute timer and take step one.
          </div>
        </div>
      </AbsoluteFill>
      {dipOut > 0 ? <AbsoluteFill style={{ backgroundColor: '#000', opacity: dipOut }} /> : null}
    </>
  );
};

const Scene8Cta: React.FC<{ captions: boolean }> = ({ captions }) => {
  const { width, height } = useVideoConfig();
  return (
    <StickStyleProvider styleId="emerald" mood="night">
      <StickGrade bars="wide">
        <StickStage width={width} height={height} fov={40} fog={[22, 85]} keyPos={[-10, 16, 8]} keyIntensity={2.9} ambient={1.3} shadowSize={20}>
          <Scene8Inner />
        </StickStage>
        <CtaCard />
        {captions ? (
          <CaptionBar lines={[[0.1, 3.5, 'Close this video, set a 2-minute timer, and take step one—right now.']]} />
        ) : null}
      </StickGrade>
    </StickStyleProvider>
  );
};

// -------------------- Master 60-Second Composition (1440 frames @ 24fps) --------------------
export const StopProcrastinating3D: React.FC<StopProcrastinatingProps> = ({ voiceoverFile, captions = true }) => {
  return (
    <>
      <AbsoluteFill style={{ backgroundColor: '#000' }}>
        {voiceoverFile ? <Audio src={staticFile(voiceoverFile)} /> : null}
      
        {/* Scene 1: 0:00 – 0:07 (0..168) */}
        <Sequence durationInFrames={168} name="01-The-Trap">
          <Scene1Trap captions={captions} />
        </Sequence>
      
        {/* Scene 2: 0:07 – 0:15 (168..360) */}
        <Sequence from={168} durationInFrames={192} name="02-Myth-of-Motivation">
          <Scene2Myth captions={captions} />
        </Sequence>
      
        {/* Scene 3: 0:15 – 0:24 (360..576) */}
        <Sequence from={360} durationInFrames={216} name="03-Brain-Friction-Boulder">
          <Scene3Friction captions={captions} />
        </Sequence>
      
        {/* Scene 4: 0:24 – 0:33 (576..792) */}
        <Sequence from={576} durationInFrames={216} name="04-Two-Minute-Rule">
          <Scene4TwoMinRule captions={captions} />
        </Sequence>
      
        {/* Scene 5: 0:33 – 0:42 (792..1008) */}
        <Sequence from={792} durationInFrames={216} name="05-Action-Momentum">
          <Scene5Momentum captions={captions} />
        </Sequence>
      
        {/* Scene 6: 0:42 – 0:51 (1008..1224) */}
        <Sequence from={1008} durationInFrames={216} name="06-Snowball-Effect">
          <Scene6Snowball captions={captions} />
        </Sequence>
      
        {/* Scene 7: 0:51 – 0:56 (1224..1344) */}
        <Sequence from={1224} durationInFrames={120} name="07-Stadium-Climax">
          <Scene7Climax captions={captions} />
        </Sequence>
      
        {/* Scene 8: 0:56 – 1:00 (1344..1440) */}
        <Sequence from={1344} durationInFrames={96} name="08-Call-To-Action">
          <Scene8Cta captions={captions} />
        </Sequence>
      </AbsoluteFill>
      <Solid
        width={1920}
        height={1080}
        color="gray"
        style={{ position: 'absolute' }}
      />
      <Solid
        width={1920}
        height={1080}
        color="gray"
        style={{
          position: 'absolute',
          translate: '153px 109.8px'
        }}
      />
    </>
  );
};
