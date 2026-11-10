// src/stickman/three/sets/LabSet3D.tsx — reusable 3D science / research lab set.
// Recommended mood: 'interiorCool' or 'void', keyPos: [0, 9, 4].
// Stages figures in front of a glowing central observation screen + backlit specimen tubes.
import React from 'react';
import * as THREE from 'three';
import { useStick } from '../../StyleContext';
import { shade } from '../../math';
import { Box, Cyl, Ground, LightShaft, Sphere, WindowPane } from '../builders';

export type LabSet3DProps = {
  /** Include the foreground lab bench and glowing glassware (default true). */
  bench?: boolean;
  /** Include the glowing holographic/observation pods on the sides (default true). */
  pods?: boolean;
};

const GlowingScreen: React.FC<{ w: number; h: number; color: string; frameColor: string; position: [number, number, number] }> = ({
  w,
  h,
  color,
  frameColor,
  position,
}) => (
  <group position={position}>
    <Box size={[w + 0.16, h + 0.16, 0.12]} color={frameColor} position={[0, 0, -0.06]} />
    <mesh>
      <planeGeometry args={[w, h]} />
      <meshBasicMaterial color={color} />
    </mesh>
  </group>
);

const SpecimenPod: React.FC<{ x: number; z: number; glow: string; metal: string }> = ({ x, z, glow, metal }) => (
  <group position={[x, 0, z]}>
    <Cyl rTop={0.65} rBottom={0.72} h={0.28} color={metal} seg={24} position={[0, 0.14, 0]} />
    <Cyl rTop={0.65} rBottom={0.65} h={0.22} color={metal} seg={24} position={[0, 2.75, 0]} />
    <mesh position={[0, 1.45, 0]}>
      <cylinderGeometry args={[0.56, 0.56, 2.35, 24]} />
      <meshBasicMaterial color={glow} transparent opacity={0.42} blending={THREE.AdditiveBlending} depthWrite={false} />
    </mesh>
    <Sphere r={0.22} color={glow} position={[0, 1.5, 0]} />
  </group>
);

export const LabSet3D: React.FC<LabSet3DProps> = ({ bench = true, pods = true }) => {
  const { style, M } = useStick();
  const wall = shade(M.wall, -0.25);
  const darkMetal = shade(M.dark, 0.08);
  const counterTop = shade(M.wall, 0.12);
  const accentGlow = style.ui.blueprint;
  const goldGlow = M.practical;

  return (
    <>
      <Ground w={60} d={60} color={shade(M.floor, -0.15)} texture="tiles" cells={14} repeat={[12, 12]} />

      {/* Back & side walls */}
      <Box size={[34, 9, 0.4]} color={wall} position={[0, 4.5, -4.5]} />
      <Box size={[0.4, 9, 18]} color={shade(wall, -0.15)} position={[-12, 4.5, 2]} />
      <Box size={[0.4, 9, 18]} color={shade(wall, -0.15)} position={[12, 4.5, 2]} />

      {/* Structural wall pillars */}
      {[-8, -3.5, 3.5, 8].map((x) => (
        <Box key={x} size={[0.45, 9, 0.55]} color={darkMetal} position={[x, 4.5, -4.25]} />
      ))}

      {/* Central big glowing data display behind characters (stages dark silhouettes cleanly) */}
      <GlowingScreen w={5.2} h={2.7} color={accentGlow} frameColor={darkMetal} position={[0, 2.35, -4.22]} />
      {/* Side observation windows */}
      <WindowPane w={2.8} h={2.5} glowColor={goldGlow} cols={3} rows={2} power={0.75} position={[-5.7, 2.35, -4.26]} />
      <WindowPane w={2.8} h={2.5} glowColor={goldGlow} cols={3} rows={2} power={0.75} position={[5.7, 2.35, -4.26]} />

      {/* Overhead ceiling light strips + volumetric shafts */}
      {[-4.5, 0, 4.5].map((x) => (
        <React.Fragment key={x}>
          <GlowingScreen w={2.2} h={0.35} color={M.key} frameColor={darkMetal} position={[x, 5.4, -1.2]} />
          <LightShaft w={2.4} len={5.4} color={ x === 0 ? accentGlow : M.key } opacity={0.055} position={[x, 2.7, -1.2]} />
        </React.Fragment>
      ))}

      {pods ? (
        <>
          <SpecimenPod x={-4.6} z={-2.6} glow={accentGlow} metal={darkMetal} />
          <SpecimenPod x={4.6} z={-2.6} glow={goldGlow} metal={darkMetal} />
        </>
      ) : null}

      {bench ? (
        <group position={[0, 0, -0.8]}>
          {/* Main lab bench */}
          <Box size={[3.4, 0.86, 0.9]} color={darkMetal} position={[0, 0.43, 0]} />
          <Box size={[3.55, 0.08, 1.02]} color={counterTop} position={[0, 0.9, 0]} />
          {/* Glowing flasks / beakers on the bench */}
          <Cyl rTop={0.07} rBottom={0.11} h={0.26} color={accentGlow} position={[-0.7, 1.07, 0.1]} />
          <Cyl rTop={0.06} rBottom={0.06} h={0.32} color={goldGlow} position={[-0.45, 1.1, -0.08]} />
          {/* Small desk monitor */}
          <Box size={[0.75, 0.48, 0.05]} color={darkMetal} position={[0.75, 1.24, -0.15]} rotation={[0, -0.35, 0]} />
          <Cyl rTop={0.04} rBottom={0.06} h={0.2} color={darkMetal} position={[0.75, 0.98, -0.15]} />
        </group>
      ) : null}
    </>
  );
};
