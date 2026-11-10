// src/stickman/three/sets/StadiumSet3D.tsx — reusable 3D stadium / arena set for big scale shots.
// Recommended mood: 'night' or 'dusk', keyPos: [-10, 16, 8], fog: [22, 85].
// Features turf field with pitch markings, tiered stands with instanced Crowd3D, 4 floodlight towers
// with volumetric light beams, and a giant glowing scoreboard screen.
import React from 'react';
import { useStick } from '../../StyleContext';
import { shade } from '../../math';
import { Box, Crowd3D, Cyl, Ground, LightShaft } from '../builders';

export type StadiumSet3DProps = {
  /** Include the giant glowing scoreboard at the back of the pitch (default true). */
  scoreboard?: boolean;
};

const FloodlightTower: React.FC<{ x: number; z: number; aimX: number; metal: string; glow: string }> = ({ x, z, aimX, metal, glow }) => (
  <group position={[x, 0, z]}>
    <Cyl rTop={0.18} rBottom={0.32} h={16} color={metal} position={[0, 8, 0]} />
    {/* Floodlight bank */}
    <Box size={[2.8, 1.4, 0.35]} color={metal} position={[0, 16.2, 0]} rotation={[0.35, aimX, 0]} />
    <mesh position={[0, 16.2, 0.2]} rotation={[0.35, aimX, 0]}>
      <planeGeometry args={[2.5, 1.15]} />
      <meshBasicMaterial color={glow} />
    </mesh>
    {/* Dramatic volumetric beam cutting down onto the field */}
    <LightShaft w={4.5} len={18} color={glow} opacity={0.06} position={[-x * 0.22, 8.5, 2.5]} rotation={[-0.45, 0, x > 0 ? 0.28 : -0.28]} />
  </group>
);

export const StadiumSet3D: React.FC<StadiumSet3DProps> = ({ scoreboard = true }) => {
  const { style, M } = useStick();
  const turf = shade(M.grass, -0.15);
  const concrete = shade(M.wall, -0.25);
  const metal = shade(M.dark, -0.1);
  const line = shade(M.key, -0.15);

  return (
    <>
      {/* Pitch / turf floor */}
      <Ground w={90} d={90} color={turf} texture="tiles" cells={18} repeat={[6, 6]} />

      {/* Pitch markings (sidelines, halfway line, centre circle segments) */}
      <Box size={[28, 0.02, 0.12]} color={line} position={[0, 0.01, -7]} />
      <Box size={[28, 0.02, 0.12]} color={line} position={[0, 0.01, 7]} />
      <Box size={[0.12, 0.02, 14]} color={line} position={[0, 0.01, 0]} />
      <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.3, 2.42, 36]} />
        <meshBasicMaterial color={line} />
      </mesh>

      {/* Tiered stadium stands + instanced crowd behind the pitch */}
      {Array.from({ length: 10 }, (_, i) => (
        <Box key={i} size={[52, 0.55, 0.9]} color={concrete} position={[0, 0.28 + i * 0.52, -9.5 - i * 0.85]} />
      ))}
      <Crowd3D
        rows={10}
        perRow={72}
        width={48}
        step={0.85}
        rise={0.52}
        z0={-9.5}
        y0={0.3}
        colors={[shade(M.wall, -0.1), shade(M.wall, 0.1), shade(M.dark, 0.25), shade(style.ui.sub, -0.25)]}
      />

      {/* Four floodlight towers framing the arena */}
      <FloodlightTower x={-18} z={-16} aimX={0.35} metal={metal} glow={M.key} />
      <FloodlightTower x={-9} z={-18} aimX={0.15} metal={metal} glow={M.key} />
      <FloodlightTower x={9} z={-18} aimX={-0.15} metal={metal} glow={M.key} />
      <FloodlightTower x={18} z={-16} aimX={-0.35} metal={metal} glow={M.key} />

      {scoreboard ? (
        <group position={[0, 9.8, -19]}>
          <Cyl rTop={0.22} rBottom={0.28} h={6} color={metal} position={[-3.2, -4, 0]} />
          <Cyl rTop={0.22} rBottom={0.28} h={6} color={metal} position={[3.2, -4, 0]} />
          <Box size={[8.6, 4.2, 0.45]} color={metal} position={[0, 0, -0.25]} />
          <mesh>
            <planeGeometry args={[8.0, 3.6]} />
            <meshBasicMaterial color={M.practical} />
          </mesh>
        </group>
      ) : null}
    </>
  );
};
