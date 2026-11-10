// src/scenes/EmeraldCafe3D.tsx — 3D café terrace shot in the GrowKaz Emerald style.
// Uses the reusable <CafeSet3D /> set: the hero (red hoodie) sits at a table, his friend (blue tee,
// yellow cap) walks in from the right and waves; the hero raises his cup.
import React from 'react';
import { AbsoluteFill, useVideoConfig } from 'remotion';
import {
  CafeSet3D,
  Cyl,
  Dust3D,
  FRIEND,
  HERO,
  StickFigure3D,
  StickGrade,
  StickStage,
  StickStyleProvider,
  breathe,
  ease,
  lerp,
  posesAt,
  prog,
  useOrbitCamera,
  useShotTime,
  useStick,
  walkPose,
  withPose,
} from '../stickman';

const Cup: React.FC<{ position: [number, number, number] }> = ({ position }) => (
  <Cyl rTop={0.05} rBottom={0.04} h={0.09} color="#f2ece4" position={position} />
);

const Shot: React.FC = () => {
  const { t, dur } = useShotTime();
  const { M } = useStick();

  // Friend walks in from the right (≈ 1.13 m/s, matching walkPose's stride), then stops and waves.
  const WALK_END = 3;
  const walkK = prog(t, 0, WALK_END);
  const friendX = lerp(5.2, 1.8, walkK);
  const friendPose =
    t < WALK_END ? walkPose(t * Math.PI * 2 * 0.9) : breathe(posesAt(t - WALK_END, [[0, 'stand'], [0.25, 'wave']]), t, 1, 2);

  // Hero sits, then lifts his cup in a toast when his friend arrives.
  const toast = withPose('sit', { eF: [28, -126], hF: [52, -148] });
  const heroPose = breathe(posesAt(t, [[0, 'sit'], [WALK_END + 0.2, toast]], 0.45), t, 0.8, 0);
  const cupUp = ease.inOut(prog(t, WALK_END + 0.2, WALK_END + 0.65));
  const handX = -0.85 + heroPose.hF[0] / 140 + 0.03;
  const handY = -heroPose.hF[1] / 140 + 0.06;
  const cupPos: [number, number, number] = [lerp(-0.32, handX, cupUp), lerp(0.82, handY, cupUp), lerp(0.05, 0.1, cupUp)];

  useOrbitCamera(t, { target: [0.4, 0.9, 0], radius: [7.2, 5.2], height: [2.8, 1.9], from: -0.9, to: 0.35, dur });

  return (
    <>
      <CafeSet3D />
      <StickFigure3D outfit={HERO} pose={heroPose} position={[-0.85, 0, 0]} />
      <StickFigure3D outfit={FRIEND} pose={friendPose} position={[friendX, 0, 0.5]} rotationY={Math.PI} />
      <Cup position={cupPos} />
      <Dust3D t={t} area={[14, 4, 8]} center={[0, 2, 0]} color={M.practical} opacity={0.6} />
    </>
  );
};

const TitleOverlay: React.FC = () => {
  const { t, dur } = useShotTime();
  const { style } = useStick();
  const { height } = useVideoConfig();
  const a = ease.out(prog(t, 0.6, 1.4)) * (1 - ease.inOut(prog(t, dur - 1, dur - 0.4)));
  return (
    <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: height * 0.11 }}>
      <div
        style={{
          opacity: a,
          transform: `translateY(${(1 - a) * 20}px)`,
          fontFamily: 'Fredoka, Nunito, system-ui, sans-serif',
          fontWeight: 700,
          fontSize: height * 0.035,
          letterSpacing: '0.25em',
          color: style.ui.gold,
          textShadow: `0 0 ${height * 0.02}px ${style.ui.gold}88`,
        }}
      >
        GROWKAZ EMERALD · CAFÉ 3D
      </div>
    </AbsoluteFill>
  );
};

export const EmeraldCafe3D: React.FC = () => {
  const { width, height } = useVideoConfig();
  return (
    <StickStyleProvider styleId="emerald" mood="dusk">
      <StickGrade bars="wide">
        <StickStage width={width} height={height} fov={34} fog={[14, 45]} keyPos={[-8, 9, 6]} keyIntensity={2.8} ambient={1.3}>
          <Shot />
        </StickStage>
        <TitleOverlay />
      </StickGrade>
    </StickStyleProvider>
  );
};
