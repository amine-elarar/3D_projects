// src/stickman/three/sets/NightStreetSet3D.tsx — reusable 3D city street at night.
// Recommended mood: 'night' or 'storm', keyPos: [-6, 10, 5].
// Features asphalt road with dashed centre line, sidewalks, row of buildings with warm lit windows,
// glowing street lamps with light cones & floor pools, low-poly parked car silhouettes and trees.
import React from 'react';
import * as THREE from 'three';
import { useStick } from '../../StyleContext';
import { shade } from '../../math';
import { Box, Building, Cyl, Ground, LightShaft, Sphere, Tree3D, WindowPane } from '../builders';

export type NightStreetSet3DProps = {
  /** Show low-poly parked cars at the curb (default true). */
  cars?: boolean;
};

const StreetLamp: React.FC<{ x: number; z: number; poleColor: string; glowColor: string }> = ({ x, z, poleColor, glowColor }) => (
  <group position={[x, 0, z]}>
    <Cyl rTop={0.055} rBottom={0.085} h={4.4} color={poleColor} position={[0, 2.2, 0]} />
    <Box size={[0.7, 0.06, 0.06]} color={poleColor} position={[0.3, 4.38, 0]} />
    {/* Glowing lamp bulb */}
    <mesh position={[0.6, 4.28, 0]}>
      <sphereGeometry args={[0.15, 16, 12]} />
      <meshBasicMaterial color={glowColor} />
    </mesh>
    {/* Light cone + warm pool on the pavement */}
    <LightShaft w={2.8} len={4.3} color={glowColor} opacity={0.075} position={[0.6, 2.15, 0]} />
    <mesh position={[0.6, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[1.9, 24]} />
      <meshBasicMaterial color={glowColor} transparent opacity={0.18} blending={THREE.AdditiveBlending} depthWrite={false} />
    </mesh>
  </group>
);

const ParkedCar: React.FC<{ x: number; z: number; bodyColor: string; darkColor: string; tailLight: string; headLight: string }> = ({
  x,
  z,
  bodyColor,
  darkColor,
  tailLight,
  headLight,
}) => (
  <group position={[x, 0, z]}>
    {/* Lower chassis + cabin */}
    <Box size={[3.6, 0.65, 1.65]} color={bodyColor} position={[0, 0.52, 0]} />
    <Box size={[1.9, 0.55, 1.45]} color={shade(bodyColor, 0.08)} position={[-0.15, 1.08, 0]} />
    {/* Wheels */}
    {[-1.1, 1.1].flatMap((wx) =>
      [-0.78, 0.78].map((wz) => (
        <Cyl key={`${wx}${wz}`} rTop={0.32} rBottom={0.32} h={0.22} color={darkColor} position={[wx, 0.32, wz]} rotation={[Math.PI / 2, 0, 0]} />
      )),
    )}
    {/* Headlights (+x) and taillights (-x) */}
    {[-0.55, 0.55].map((lz) => (
      <React.Fragment key={lz}>
        <mesh position={[1.81, 0.56, lz]}>
          <boxGeometry args={[0.04, 0.14, 0.26]} />
          <meshBasicMaterial color={headLight} />
        </mesh>
        <mesh position={[-1.81, 0.56, lz]}>
          <boxGeometry args={[0.04, 0.14, 0.26]} />
          <meshBasicMaterial color={tailLight} />
        </mesh>
      </React.Fragment>
    ))}
  </group>
);

export const NightStreetSet3D: React.FC<NightStreetSet3DProps> = ({ cars = true }) => {
  const { style, M } = useStick();
  const road = shade(M.road, -0.25);
  const sidewalk = shade(M.floor, 0.05);
  const pole = shade(M.dark, -0.2);

  return (
    <>
      {/* Wide dark ground + sidewalk + road */}
      <Ground w={80} d={80} color={road} texture="none" y={-0.02} />
      {/* Back sidewalk where characters walk/stand (y = 0) */}
      <Box size={[80, 0.16, 7]} color={sidewalk} position={[0, -0.08, -2]} />
      {/* Foreground sidewalk across the street */}
      <Box size={[80, 0.16, 8]} color={sidewalk} position={[0, -0.08, 10.5]} />
      {/* Dashed centre road markings */}
      {Array.from({ length: 14 }, (_, i) => (
        <Box key={i} size={[2.2, 0.02, 0.18]} color={shade(M.practical, -0.25)} position={[-26 + i * 4, -0.01, 4]} />
      ))}

      {/* Row of townhouses / apartment buildings along the street */}
      <Building w={9} h={13} d={6} color={shade(M.wall, -0.15)} position={[-16, 0, -7.8]} seed={2} lit={0.5} />
      <Building w={8.5} h={16} d={6} color={shade(M.wall, -0.28)} position={[-7, 0, -7.8]} seed={4} lit={0.65} />
      <Building w={9} h={12} d={6} color={shade(M.wall, -0.08)} position={[2, 0, -7.8]} seed={6} lit={0.6} />
      <Building w={10} h={18} d={6} color={shade(M.wall, -0.22)} position={[12, 0, -7.8]} seed={8} lit={0.5} />
      <Building w={9} h={14} d={6} color={shade(M.wall, -0.18)} position={[22, 0, -7.8]} seed={11} lit={0.45} />

      {/* Ground-floor warm shopfront / apartment doorway right behind the main action */}
      <WindowPane w={2.6} h={2.4} glowColor={M.practical} cols={3} rows={2} power={0.95} interior position={[-1.5, 1.7, -4.75]} />
      <WindowPane w={1.3} h={2.4} glowColor={M.practical} cols={1} rows={2} power={1.1} position={[1.8, 1.35, -4.75]} />
      {/* Stoop steps in front of the doorway */}
      <Box size={[2.0, 0.18, 0.9]} color={shade(sidewalk, 0.08)} position={[1.8, 0.09, -4.3]} />

      {/* Street lamps casting pools of warm light along the sidewalk */}
      {[-11, -3.5, 4.5, 12.5].map((x) => (
        <StreetLamp key={x} x={x} z={0.8} poleColor={pole} glowColor={M.practical} />
      ))}

      {/* Trees framing the block */}
      <Tree3D x={-8.5} z={-0.6} s={1.05} />
      <Tree3D x={8.2} z={-0.6} s={1.15} />
      <Sphere r={0.01} color={M.dark} position={[0, -5, 0]} />

      {cars ? (
        <>
          <ParkedCar
            x={-6.2}
            z={2.3}
            bodyColor={shade(M.wall, -0.1)}
            darkColor={pole}
            tailLight={style.ui.accent}
            headLight={M.practical}
          />
          <ParkedCar
            x={7.5}
            z={2.3}
            bodyColor={shade(M.dark, 0.18)}
            darkColor={pole}
            tailLight={style.ui.accent}
            headLight={M.practical}
          />
        </>
      ) : null}
    </>
  );
};
