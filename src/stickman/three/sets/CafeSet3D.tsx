// src/stickman/three/sets/CafeSet3D.tsx — reusable 3D café terrace + city street backdrop.
// Recommended mood: 'dusk' or 'golden', keyPos: [-8, 9, 6].
import React from 'react';
import { useStick } from '../../StyleContext';
import { shade } from '../../math';
import { Box, Building, Cyl, Ground, LightShaft, Tree3D, WindowPane } from '../builders';

export type CafeSet3DProps = {
  /** Show background skyline buildings (default true). */
  skyline?: boolean;
  /** Show the foreground café table and chair at the origin (default true). */
  table?: boolean;
};

export const CafeSet3D: React.FC<CafeSet3DProps> = ({ skyline = true, table = true }) => {
  const { M } = useStick();
  const wall = shade(M.wall, -0.1);
  const furniture = shade(M.dark, 0.05);
  return (
    <>
      <Ground w={70} d={70} color={M.floor} texture="tiles" />
      {/* café facade with warm windows, a glowing door and a striped awning */}
      <Box size={[32, 7.5, 0.4]} color={wall} position={[0, 3.75, -4]} />
      {[-6, -3, 3, 6].map((x) => (
        <WindowPane key={x} w={2.2} h={2.6} cols={2} rows={1} power={0.85} interior position={[x, 2.1, -3.78]} />
      ))}
      <WindowPane w={1.3} h={2.6} cols={1} rows={1} power={1.08} position={[0, 1.3, -3.78]} />
      {Array.from({ length: 30 }, (_, i) => (
        <Box key={i} size={[1, 0.6, 1.1]} color={i % 2 ? '#efe4d4' : shade(M.dark, 0.25)} position={[-15 + i + 0.5, 3.9, -3.3]} />
      ))}
      {/* light spilling from the windows onto the terrace */}
      {[-6, -3, 3, 6].map((x) => (
        <LightShaft key={x} w={2.2} len={5} opacity={0.06} position={[x, 1.6, -2.2]} rotation={[-0.75, 0, 0]} />
      ))}

      {table ? (
        <>
          <Cyl rTop={0.55} rBottom={0.55} h={0.05} color={furniture} seg={24} position={[0, 0.75, 0]} />
          <Cyl rTop={0.05} rBottom={0.05} h={0.75} color={furniture} position={[0, 0.37, 0]} />
          <Cyl rTop={0.3} rBottom={0.3} h={0.03} color={furniture} position={[0, 0.015, 0]} />
          <Box size={[0.45, 0.05, 0.45]} color={furniture} position={[-0.85, 0.48, 0]} />
          <Box size={[0.05, 0.6, 0.45]} color={furniture} position={[-1.08, 0.78, 0]} />
          {[-0.18, 0.18].flatMap((lx) =>
            [-0.18, 0.18].map((lz) => <Box key={`${lx}${lz}`} size={[0.04, 0.48, 0.04]} color={furniture} position={[-0.85 + lx, 0.24, lz]} />),
          )}
        </>
      ) : null}

      {/* street lamp posts + trees */}
      {[-9, 9].map((x) => (
        <Cyl key={x} rTop={0.06} rBottom={0.08} h={4} color={shade(M.dark, -0.2)} position={[x, 2, 1.5]} />
      ))}
      <Tree3D x={-12} z={2} s={1.2} />
      <Tree3D x={12} z={1} s={1.1} />

      {skyline ? (
        <>
          <Building w={10} h={16} d={6} position={[-14, 0, -14]} seed={5} />
          <Building w={8} h={22} d={6} position={[2, 0, -18]} seed={7} lit={0.4} />
          <Building w={12} h={13} d={6} position={[16, 0, -13]} seed={9} />
        </>
      ) : null}
    </>
  );
};
