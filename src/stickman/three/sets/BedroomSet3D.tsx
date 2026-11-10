// src/stickman/three/sets/BedroomSet3D.tsx — reusable 3D bedroom / home study set.
// Recommended mood: 'night' or 'interiorWarm', keyPos: [-5, 7, 4].
// Features plank flooring, large moonlit window spilling a light shaft onto a low-poly bed,
// desk with a glowing computer monitor + chair, and a bookshelf.
import React from 'react';
import { useStick } from '../../StyleContext';
import { shade } from '../../math';
import { Box, Cyl, Ground, LightShaft, WindowPane } from '../builders';

export type BedroomSet3DProps = {
  /** Include the bed on the left side (default true). */
  bed?: boolean;
  /** Include the desk and glowing monitor on the right side (default true). */
  desk?: boolean;
};

export const BedroomSet3D: React.FC<BedroomSet3DProps> = ({ bed = true, desk = true }) => {
  const { style, M } = useStick();
  const wall = shade(M.wall, -0.2);
  const wood = shade(M.floor, -0.05);
  const darkWood = shade(M.dark, 0.12);
  const screenGlow = style.ui.blueprint;

  return (
    <>
      <Ground w={50} d={50} color={wood} texture="planks" cells={18} repeat={[8, 8]} />

      {/* Back and left corner walls + baseboard */}
      <Box size={[24, 8, 0.35]} color={wall} position={[0, 4, -3.6]} />
      <Box size={[0.35, 8, 16]} color={shade(wall, -0.12)} position={[-6.5, 4, 2]} />
      <Box size={[24, 0.22, 0.42]} color={darkWood} position={[0, 0.11, -3.56]} />

      {/* Signature large window with mullions + moonlight/sunset shaft onto the floor and bed */}
      <WindowPane w={2.8} h={3.0} glowColor={M.key} cols={2} rows={3} power={0.92} position={[-1.4, 2.5, -3.38]} />
      <LightShaft w={2.9} len={5.6} color={M.key} opacity={0.075} position={[-1.2, 1.85, -1.5]} rotation={[-0.78, 0.12, 0]} />

      {bed ? (
        <group position={[-3.3, 0, -1.8]}>
          {/* Bed frame + headboard */}
          <Box size={[2.3, 0.36, 3.1]} color={darkWood} position={[0, 0.18, 0]} />
          <Box size={[2.3, 1.25, 0.22]} color={darkWood} position={[0, 0.62, -1.45]} />
          {/* Mattress, blanket (accent colour) and pillow */}
          <Box size={[2.1, 0.26, 2.9]} color={shade('#e8e4dc', -0.25)} position={[0, 0.45, 0.04]} />
          <Box size={[2.14, 0.28, 2.0]} color={shade(M.wall, 0.22)} position={[0, 0.46, 0.48]} />
          <Box size={[1.4, 0.16, 0.55]} color={shade(M.practical, 0.15)} position={[0, 0.64, -1.0]} />
        </group>
      ) : null}

      {desk ? (
        <group position={[2.2, 0, -2.5]}>
          {/* Desk top + legs */}
          <Box size={[2.2, 0.08, 1.0]} color={darkWood} position={[0, 0.78, 0]} />
          {[-0.98, 0.98].flatMap((lx) =>
            [-0.4, 0.4].map((lz) => <Box key={`${lx}${lz}`} size={[0.08, 0.76, 0.08]} color={darkWood} position={[lx, 0.38, lz]} />),
          )}
          {/* Glowing PC monitor (acts as a bright practical accent on the right) */}
          <Box size={[1.05, 0.64, 0.06]} color={shade(darkWood, -0.2)} position={[0, 1.26, -0.22]} />
          <mesh position={[0, 1.26, -0.18]}>
            <planeGeometry args={[0.96, 0.55]} />
            <meshBasicMaterial color={screenGlow} />
          </mesh>
          <Cyl rTop={0.05} rBottom={0.07} h={0.18} color={darkWood} position={[0, 0.88, -0.22]} />
          {/* Desk lamp */}
          <Cyl rTop={0.12} rBottom={0.04} h={0.16} color={M.practical} position={[0.78, 1.22, -0.15]} rotation={[0, 0, 0.4]} />
          <Cyl rTop={0.025} rBottom={0.025} h={0.42} color={darkWood} position={[0.85, 1.02, -0.15]} />
          {/* Chair */}
          <Box size={[0.52, 0.06, 0.52]} color={darkWood} position={[0, 0.46, 0.65]} />
          <Box size={[0.52, 0.55, 0.06]} color={darkWood} position={[0, 0.76, 0.88]} />
          <Cyl rTop={0.04} rBottom={0.05} h={0.44} color={darkWood} position={[0, 0.22, 0.65]} />
        </group>
      ) : null}

      {/* Bookshelf between window and desk */}
      <group position={[0.45, 0, -3.15]}>
        <Box size={[0.95, 2.2, 0.42]} color={darkWood} position={[0, 1.1, 0]} />
        {[0.55, 1.1, 1.65].map((sy, idx) => (
          <Box key={sy} size={[0.72, 0.28, 0.28]} color={idx % 2 ? shade(M.practical, -0.2) : shade(style.ui.blueprint, -0.25)} position={[0, sy + 0.16, 0.04]} />
        ))}
      </group>
    </>
  );
};
