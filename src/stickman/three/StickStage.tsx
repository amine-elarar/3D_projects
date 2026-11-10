// src/stickman/three/StickStage.tsx — Cinematic 3D Stage with:
// 1. Teal & Orange 3-Point Lighting (Warm Orange Key Light + Cool Teal Fill Light + Crisp Back/Rim Light)
// 2. Realistic Soft Shadows (2048×2048 PCFSoftShadowMap + shadow-receiving ground plane)
// 3. Post-Processing Pipeline: RenderPass -> BokehPass (Depth of Field) -> UnrealBloomPass -> OutputPass (ACES Filmic)
import React, { useLayoutEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { ThreeCanvas } from '@remotion/three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { StickStyleProvider, useStick } from '../StyleContext';
import type { MoodName, StyleId } from '../styles';

export type DofConfig = {
  /** Explicit focal distance in metres. If omitted, auto-focuses on `target` (default [0, 1.1, 0]). */
  focus?: number;
  /** Camera focalTarget in world space used when `focus` is omitted (default [0, 1.1, 0]). */
  target?: [number, number, number];
  /** Bokeh aperture size (default 0.0018). Higher values increase background blur. */
  aperture?: number;
  /** Maximum bokeh blur radius in screen UV units (default 0.009). */
  maxblur?: number;
};

export type StickStageProps = {
  width: number;
  height: number;
  mood?: MoodName;
  styleId?: StyleId;
  fov?: number;
  /** [near, far] in metres, or false to disable. Default [14, 62]. */
  fog?: [number, number] | false;
  fogColor?: string;
  /** Gradient stops top -> bottom, or a flat colour. Default: mood sky. */
  sky?: string[] | string;
  /** 1. Key Light (Warm Orange) position, colour & intensity */
  keyPos?: [number, number, number];
  keyColor?: string;
  keyIntensity?: number;
  /** 2. Fill Light (Cool Teal) position, colour & intensity */
  fillPos?: [number, number, number];
  fillColor?: string;
  fillIntensity?: number;
  /** 3. Rim / Back Light position, colour & intensity */
  rimPos?: [number, number, number];
  rimColor?: string;
  rimIntensity?: number;
  ambient?: number;
  /** Bloom strength. Default: style.grade.bloom * 0.65. Set 0 to disable. */
  bloom?: number;
  bloomThreshold?: number;
  /** Depth of Field post-processing configuration (default: true). */
  dof?: boolean | DofConfig;
  /** Half-size of the key light's shadow frustum in metres (default 12). */
  shadowSize?: number;
  children: React.ReactNode;
};

const SkyAndFog: React.FC<{ sky?: string[] | string; fog: [number, number] | false; fogColor?: string }> = ({
  sky,
  fog,
  fogColor,
}) => {
  const { M } = useStick();
  const stops = sky ?? M.sky;
  const background = useMemo(() => {
    if (!Array.isArray(stops)) return new THREE.Color(stops);
    const c = document.createElement('canvas');
    c.width = 4;
    c.height = 256;
    const g = c.getContext('2d')!;
    const gr = g.createLinearGradient(0, 0, 0, 256);
    stops.forEach((col, i) => gr.addColorStop(i / Math.max(1, stops.length - 1), col));
    g.fillStyle = gr;
    g.fillRect(0, 0, 4, 256);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [JSON.stringify(stops)]); // eslint-disable-line react-hooks/exhaustive-deps
  useLayoutEffect(() => () => void (background instanceof THREE.Texture && background.dispose()), [background]);
  return (
    <>
      <primitive attach="background" object={background} />
      {fog !== false ? <fog attach="fog" args={[fogColor ?? M.dark, fog[0], fog[1]]} /> : null}
    </>
  );
};

/**
 * Professional Hollywood Teal & Orange 3-Point Lighting Rig with realistic cast shadows:
 * 1. Key Light (Warm Orange #ff8c3b): Primary directional light casting 2048x2048 soft shadows.
 * 2. Fill Light (Cool Teal #1a9cb8): Opposite-side light filling shadow regions with rich teal tones.
 * 3. Rim / Back Light (#38bdf8 / #ffb366): High-contrast backlight sculpting the 3D silhouette.
 */
const TealOrangeThreePointLighting: React.FC<{
  keyPos: [number, number, number];
  keyColor?: string;
  keyIntensity: number;
  fillPos: [number, number, number];
  fillColor?: string;
  fillIntensity: number;
  rimPos: [number, number, number];
  rimColor?: string;
  rimIntensity: number;
  ambient: number;
  shadowSize: number;
}> = ({
  keyPos,
  keyColor,
  keyIntensity,
  fillPos,
  fillColor,
  fillIntensity,
  rimPos,
  rimColor,
  rimIntensity,
  ambient,
  shadowSize: ss,
}) => {
  const { M } = useStick();
  const resolvedKeyColor = keyColor ?? M.key ?? '#ff8c3b';
  const resolvedFillColor = fillColor ?? M.fill ?? '#1a9cb8';
  const resolvedRimColor = rimColor ?? M.rim ?? '#38bdf8';

  return (
    <>
      {/* Hemisphere ambient base: cool teal sky bounce + deep slate ground bounce */}
      <hemisphereLight args={[resolvedFillColor, M.dark, ambient]} />

      {/* 1. KEY LIGHT (Warm Orange/Amber) — casts crisp, realistic 2048x2048 soft shadows */}
      <directionalLight
        position={keyPos}
        color={resolvedKeyColor}
        intensity={keyIntensity}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-ss}
        shadow-camera-right={ss}
        shadow-camera-top={ss}
        shadow-camera-bottom={-ss}
        shadow-camera-near={0.5}
        shadow-camera-far={65}
        shadow-bias={-0.0003}
        shadow-normalBias={0.02}
      />

      {/* Warm practical bounce near the key light for natural skin/armor speculars */}
      <pointLight position={[keyPos[0] * 0.65, 2.8, keyPos[2] * 0.65]} color={resolvedKeyColor} intensity={1.1} distance={18} decay={1.6} />

      {/* 2. FILL LIGHT (Cool Teal) — illuminates the shadow side from the opposite angle */}
      <directionalLight position={fillPos} color={resolvedFillColor} intensity={fillIntensity} />
      <pointLight position={[fillPos[0] * 0.7, 2.2, fillPos[2] * 0.7]} color={resolvedFillColor} intensity={0.95} distance={16} decay={1.6} />

      {/* 3. RIM / BACK LIGHT — separates the 3D character from the dark background */}
      <directionalLight
        position={rimPos}
        color={resolvedRimColor}
        intensity={rimIntensity}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-camera-near={0.5}
        shadow-camera-far={40}
        shadow-bias={-0.0004}
      />
    </>
  );
};

const Post: React.FC<{
  width: number;
  height: number;
  bloom?: number;
  threshold: number;
  dof: boolean | DofConfig;
}> = ({ width, height, bloom, threshold, dof }) => {
  const { style } = useStick();
  const { gl, scene, camera } = useThree();
  const strength = bloom ?? (style.grade.bloom ?? 0.5) * 0.65;

  const dofEnabled = dof !== false;
  const dofCfg: DofConfig = typeof dof === 'object' ? dof : {};
  const aperture = dofCfg.aperture ?? 0.0018;
  const maxblur = dofCfg.maxblur ?? 0.0085;
  const targetVec = useMemo(
    () => new THREE.Vector3(...(dofCfg.target ?? [0, 1.1, 0])),
    [dofCfg.target?.[0], dofCfg.target?.[1], dofCfg.target?.[2]], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const { composer, bokehPass, bloomPass } = useMemo(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.05;
    gl.outputColorSpace = THREE.SRGBColorSpace;
    const rt = new THREE.WebGLRenderTarget(width, height, { samples: 4, type: THREE.HalfFloatType });
    const comp = new EffectComposer(gl, rt);
    comp.setSize(width, height);
    comp.addPass(new RenderPass(scene, camera));

    // Depth of Field (BokehPass)
    const bokeh = new BokehPass(scene, camera, {
      focus: dofCfg.focus ?? 3.5,
      aperture,
      maxblur,
    });
    comp.addPass(bokeh);

    // Subtle Cinematic Bloom
    const bp = new UnrealBloomPass(new THREE.Vector2(width, height), strength, 0.5, threshold);
    comp.addPass(bp);

    comp.addPass(new OutputPass());
    return { composer: comp, bokehPass: bokeh, bloomPass: bp };
  }, [gl, scene, camera, width, height]); // eslint-disable-line react-hooks/exhaustive-deps

  useLayoutEffect(() => {
    bloomPass.strength = strength;
    bloomPass.threshold = threshold;
  }, [bloomPass, strength, threshold]);

  useLayoutEffect(
    () => () => {
      composer.renderTarget1?.dispose();
      composer.renderTarget2?.dispose();
    },
    [composer],
  );

  const syncPostAndRender = () => {
    bokehPass.enabled = dofEnabled;
    if (dofEnabled) {
      const pCam = camera as THREE.PerspectiveCamera;
      const focusDist = dofCfg.focus ?? camera.position.distanceTo(targetVec);
      const u = bokehPass.uniforms as Record<string, { value: number }>;
      u.focus.value = focusDist;
      u.aperture.value = aperture;
      u.maxblur.value = maxblur;
      u.nearClip.value = pCam.near;
      u.farClip.value = pCam.far;
      u.aspect.value = width / height;
    }
    composer.render();
  };

  // Render synchronously after all sibling useLayoutEffects (camera, GLB poses, particles) have committed,
  // and also inside useFrame(priority = 1) for interactive scrubbing in Remotion Studio.
  useLayoutEffect(() => {
    syncPostAndRender();
  });
  useFrame(() => {
    syncPostAndRender();
  }, 1);

  return null;
};

export const StickStage: React.FC<StickStageProps> = ({
  width,
  height,
  mood,
  styleId,
  fov = 38,
  fog = [14, 62],
  fogColor,
  sky,
  keyPos = [5, 8, 5],
  keyColor,
  keyIntensity = 3.2,
  fillPos = [-6, 4, 4],
  fillColor,
  fillIntensity = 1.8,
  rimPos = [-2, 6.5, -6],
  rimColor,
  rimIntensity = 2.8,
  ambient = 0.85,
  bloom,
  bloomThreshold = 0.88,
  dof = true,
  shadowSize = 12,
  children,
}) => {
  const outer = useStick();
  const id = styleId ?? outer.styleId;
  const moodName = mood ?? outer.moodName;
  return (
    <ThreeCanvas
      width={width}
      height={height}
      shadows="soft"
      dpr={1}
      gl={{ antialias: true, preserveDrawingBuffer: true, alpha: false }}
      camera={{ fov, near: 0.35, far: 85, position: [0, 2, 6] }}
    >
      <StickStyleProvider styleId={id} mood={moodName}>
        <SkyAndFog sky={sky} fog={fog} fogColor={fogColor} />
        <TealOrangeThreePointLighting
          keyPos={keyPos}
          keyColor={keyColor}
          keyIntensity={keyIntensity}
          fillPos={fillPos}
          fillColor={fillColor}
          fillIntensity={fillIntensity}
          rimPos={rimPos}
          rimColor={rimColor}
          rimIntensity={rimIntensity}
          ambient={ambient}
          shadowSize={shadowSize}
        />
        {children}
        <Post width={width} height={height} bloom={bloom} threshold={bloomThreshold} dof={dof} />
      </StickStyleProvider>
    </ThreeCanvas>
  );
};
