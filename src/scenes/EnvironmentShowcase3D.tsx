// src/scenes/EnvironmentShowcase3D.tsx — ready-to-use 3D scenes for each set in the GrowKaz Emerald style:
// 1. EmeraldLab3D (science lab)
// 2. EmeraldNightStreet3D (night street)
// 3. EmeraldStadium3D (stadium arena)
// 4. EmeraldBedroom3D (moonlit bedroom / study)
// 5. EmeraldShowcase3D (reel combining all 5 sets in sequence)
import React from 'react';
import { AbsoluteFill, Sequence, useVideoConfig } from 'remotion';
import {
  BedroomSet3D,
  Dust3D,
  FRIEND,
  HERO,
  LabSet3D,
  NightStreetSet3D,
  SCIENTIST,
  StadiumSet3D,
  StickFigure3D,
  StickGrade,
  StickStage,
  StickStyleProvider,
  breathe,
  ease,
  lerp,
  posesAt,
  prog,
  useDollyCamera,
  useOrbitCamera,
  useShotTime,
  useStick,
  walkPose,
} from '../stickman';
import { EmeraldCafe3D } from './EmeraldCafe3D';

const SceneLabel: React.FC<{ text: string }> = ({ text }) => {
  const { t, dur } = useShotTime();
  const { style } = useStick();
  const { height } = useVideoConfig();
  const a = ease.out(prog(t, 0.3, 0.9)) * (1 - ease.inOut(prog(t, dur - 0.8, dur - 0.2)));
  return (
    <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: height * 0.11 }}>
      <div
        style={{
          opacity: a,
          transform: `translateY(${(1 - a) * 16}px)`,
          fontFamily: 'Fredoka, Nunito, system-ui, sans-serif',
          fontWeight: 700,
          fontSize: height * 0.032,
          letterSpacing: '0.22em',
          color: style.ui.gold,
          textShadow: `0 0 ${height * 0.02}px ${style.ui.gold}88`,
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};

// -------------------- 1. Lab 3D --------------------
const LabShot: React.FC = () => {
  const { t, dur } = useShotTime();
  const { style } = useStick();
  const docPose = breathe(
    posesAt(t, [
      [0, 'explain'],
      [1.2, 'pointUp'],
      [2.6, 'point'],
    ]),
    t,
    1,
    1,
  );
  const heroPose = breathe(
    posesAt(t, [
      [0, 'stand'],
      [1.4, 'think'],
      [2.8, 'handsOnHead'],
    ]),
    t,
    1,
    4,
  );
  useOrbitCamera(t, { target: [0, 1.35, -1.8], radius: [7.6, 5.8], height: [2.6, 2.0], from: -0.45, to: 0.35, dur });
  return (
    <>
      <LabSet3D />
      <StickFigure3D outfit={SCIENTIST} pose={docPose} position={[-1.25, 0, -1.8]} />
      <StickFigure3D outfit={HERO} pose={heroPose} position={[1.35, 0, -1.5]} rotationY={Math.PI} />
      <Dust3D t={t} area={[12, 4.5, 7]} center={[0, 2.2, -1.5]} color={style.ui.blueprint} opacity={0.65} />
    </>
  );
};

export const EmeraldLab3D: React.FC = () => {
  const { width, height } = useVideoConfig();
  return (
    <StickStyleProvider styleId="emerald" mood="void">
      <StickGrade bars="wide">
        <StickStage width={width} height={height} fov={35} fog={[14, 48]} keyPos={[0, 9, 5]} keyIntensity={2.6} ambient={1.2}>
          <LabShot />
        </StickStage>
        <SceneLabel text="SET 02 · RESEARCH LAB" />
      </StickGrade>
    </StickStyleProvider>
  );
};

// -------------------- 2. Night Street 3D --------------------
const NightStreetShot: React.FC = () => {
  const { t, dur } = useShotTime();
  const { M } = useStick();
  const heroX = lerp(-3.8, 0.2, prog(t, 0, dur));
  const heroPose = walkPose(t * Math.PI * 2 * 0.9);
  const friendPose = breathe(
    posesAt(t, [
      [0, 'relaxed'],
      [1.2, 'wave'],
      [2.6, 'talk'],
    ]),
    t,
    1,
    3,
  );
  useDollyCamera(t, [
    [0, { pos: [-5.8, 2.2, 5.4], look: [-1.5, 1.2, -1.2], fov: 36 }],
    [dur, { pos: [3.2, 1.9, 4.6], look: [0.6, 1.25, -1.4], fov: 34 }],
  ]);
  return (
    <>
      <NightStreetSet3D />
      <StickFigure3D outfit={HERO} pose={heroPose} position={[heroX, 0, -0.5]} />
      <StickFigure3D outfit={FRIEND} pose={friendPose} position={[2.2, 0, -1.2]} rotationY={Math.PI} />
      <Dust3D t={t} area={[16, 4.5, 9]} center={[0, 2.2, 0]} color={M.practical} opacity={0.55} />
    </>
  );
};

export const EmeraldNightStreet3D: React.FC = () => {
  const { width, height } = useVideoConfig();
  return (
    <StickStyleProvider styleId="emerald" mood="night">
      <StickGrade bars="wide">
        <StickStage width={width} height={height} fov={35} fog={[14, 52]} keyPos={[-6, 10, 5]} keyIntensity={2.5} ambient={1.15}>
          <NightStreetShot />
        </StickStage>
        <SceneLabel text="SET 03 · NIGHT STREET" />
      </StickGrade>
    </StickStyleProvider>
  );
};

// -------------------- 3. Stadium 3D --------------------
const StadiumShot: React.FC = () => {
  const { t, dur } = useShotTime();
  const { M } = useStick();
  const heroPose = breathe(
    posesAt(t, [
      [0, 'ready'],
      [1.3, 'kick'],
      [2.2, 'cheer'],
    ]),
    t,
    1,
    1,
  );
  const friendPose = breathe(
    posesAt(t, [
      [0, 'stand'],
      [1.6, 'cheer'],
    ]),
    t,
    1,
    5,
  );
  useOrbitCamera(t, { target: [0, 2.2, -4], radius: [13.5, 10.5], height: [2.2, 1.5], from: -0.55, to: 0.35, dur });
  return (
    <>
      <StadiumSet3D />
      <StickFigure3D outfit={HERO} pose={heroPose} position={[-1.1, 0, 0]} />
      <StickFigure3D outfit={FRIEND} pose={friendPose} position={[1.4, 0, -0.4]} rotationY={Math.PI} />
      <Dust3D t={t} count={200} area={[22, 7, 14]} center={[0, 3.5, -2]} color={M.key} opacity={0.55} />
    </>
  );
};

export const EmeraldStadium3D: React.FC = () => {
  const { width, height } = useVideoConfig();
  return (
    <StickStyleProvider styleId="emerald" mood="night">
      <StickGrade bars="wide">
        <StickStage width={width} height={height} fov={40} fog={[22, 85]} keyPos={[-10, 16, 8]} keyIntensity={2.8} ambient={1.25} shadowSize={20}>
          <StadiumShot />
        </StickStage>
        <SceneLabel text="SET 04 · STADIUM ARENA" />
      </StickGrade>
    </StickStyleProvider>
  );
};

// -------------------- 4. Bedroom 3D --------------------
const BedroomShot: React.FC = () => {
  const { t, dur } = useShotTime();
  const { M } = useStick();
  const heroPose = breathe(
    posesAt(t, [
      [0, 'think'],
      [1.3, 'pointUp'],
      [2.5, 'cheer'],
    ]),
    t,
    0.9,
    2,
  );
  useOrbitCamera(t, { target: [-0.3, 1.25, -1.8], radius: [6.6, 5.4], height: [2.1, 1.75], from: -0.35, to: 0.38, dur });
  return (
    <>
      <BedroomSet3D />
      <StickFigure3D outfit={HERO} pose={heroPose} position={[0.2, 0, -1.2]} />
      <Dust3D t={t} count={120} area={[9, 3.8, 6]} center={[-0.5, 1.9, -1.2]} color={M.key} opacity={0.65} />
    </>
  );
};

export const EmeraldBedroom3D: React.FC = () => {
  const { width, height } = useVideoConfig();
  return (
    <StickStyleProvider styleId="emerald" mood="night">
      <StickGrade bars="wide">
        <StickStage width={width} height={height} fov={34} fog={[12, 40]} keyPos={[-5, 7, 4]} keyIntensity={2.5} ambient={1.2}>
          <BedroomShot />
        </StickStage>
        <SceneLabel text="SET 05 · MOONLIT BEDROOM" />
      </StickGrade>
    </StickStyleProvider>
  );
};

// -------------------- 5. Full 5-Set Showcase Reel --------------------
export const EmeraldShowcase3D: React.FC = () => {
  const SHOT_FRAMES = 96; // 4 seconds per set @ 24fps (total 480 frames = 20s)
  const scenes = [EmeraldCafe3D, EmeraldLab3D, EmeraldNightStreet3D, EmeraldStadium3D, EmeraldBedroom3D];
  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#000',
        translate: '-25.3px 0px',
        fontFamily: 'Helvetica'
      }}
    >
      {scenes.map((Comp, i) => (
        <Sequence key={i} from={i * SHOT_FRAMES} durationInFrames={SHOT_FRAMES}>
          <Comp />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
