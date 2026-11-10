// src/stickman/overlay/StickGrade.tsx — the global finish applied to every frame (2D and 3D alike):
// per-channel lift/gamma/gain + contrast + saturation (as an SVG colour filter), vignette, film grain
// and letterbox bars. Ported from the GrowKaz kit's player (engine/player.js → buildLUT/applyGrade/bars).
import React, { useId } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { useStick } from '../StyleContext';
import type { Grade } from '../styles';

export type Bars = 'none' | 'wide' | 'scope' | 'thin' | number;

export type StickGradeProps = {
  /** Letterbox: 'wide' (2:1, default in 16:9), 'scope' (2.39:1, drama), 'thin', 'none', or px at 1080p. */
  bars?: Bars;
  vignette?: boolean;
  grain?: boolean;
  /** Override parts of the style's grade. */
  grade?: Partial<Grade>;
  children: React.ReactNode;
};

/** Bar height in logical px (16:9 → 1080 tall, 9:16 → 1920 tall), from the kit's BARS table. */
const barPx = (bars: Bars, vertical: boolean) =>
  typeof bars === 'number'
    ? bars
    : ({ none: 0, wide: vertical ? 0 : 60, scope: vertical ? 170 : 138, thin: vertical ? 60 : 30 } as const)[bars];

export const StickGrade: React.FC<StickGradeProps> = ({ bars, vignette = true, grain = true, grade: override, children }) => {
  const { style } = useStick();
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const id = useId().replace(/:/g, '');
  const gr: Grade = { ...style.grade, ...override };
  const vertical = height > width;
  const unit = height / (vertical ? 1920 : 1080);
  const barH = barPx(bars ?? (vertical ? 'none' : 'wide'), vertical) * unit;

  // Same order as the kit's LUT: contrast around mid-grey → gain·(x + lift·(1 − x)) → x^(1/gamma) → saturation.
  const con = gr.contrast ?? 1;
  const ch = (i: 0 | 1 | 2) => ({
    lgSlope: gr.gain[i] * (1 - gr.lift[i]),
    lgIntercept: gr.gain[i] * gr.lift[i],
    exp: 1 / gr.gamma[i],
  });
  const [R, G, B] = [ch(0), ch(1), ch(2)];
  const minDim = Math.min(width, height),
    maxDim = Math.max(width, height);

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <filter id={`grade-${id}`} colorInterpolationFilters="sRGB" x="0" y="0" width="100%" height="100%">
            <feComponentTransfer>
              <feFuncR type="linear" slope={con} intercept={0.5 - 0.5 * con} />
              <feFuncG type="linear" slope={con} intercept={0.5 - 0.5 * con} />
              <feFuncB type="linear" slope={con} intercept={0.5 - 0.5 * con} />
            </feComponentTransfer>
            <feComponentTransfer>
              <feFuncR type="linear" slope={R.lgSlope} intercept={R.lgIntercept} />
              <feFuncG type="linear" slope={G.lgSlope} intercept={G.lgIntercept} />
              <feFuncB type="linear" slope={B.lgSlope} intercept={B.lgIntercept} />
            </feComponentTransfer>
            <feComponentTransfer>
              <feFuncR type="gamma" amplitude={1} exponent={R.exp} offset={0} />
              <feFuncG type="gamma" amplitude={1} exponent={G.exp} offset={0} />
              <feFuncB type="gamma" amplitude={1} exponent={B.exp} offset={0} />
            </feComponentTransfer>
            <feColorMatrix type="saturate" values={String(gr.sat ?? 1)} />
          </filter>
          <filter id={`grain-${id}`} x="0" y="0" width="100%" height="100%">
            {/* 4 cycling grain tiles like the kit; seeded by frame so renders are deterministic */}
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={frame % 4} stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </defs>
      </svg>

      <AbsoluteFill style={{ filter: `url(#grade-${id})` }}>{children}</AbsoluteFill>

      {vignette && gr.vignette > 0 ? (
        <AbsoluteFill
          style={{
            // same falloff as the kit: transparent inside 0.35·min(W,H), full strength at 0.62·max(W,H)
            background: `radial-gradient(circle ${maxDim * 0.62}px at 50% 50%, rgba(0,0,0,0) ${minDim * 0.35}px, rgba(0,0,0,${gr.vignette}) ${maxDim * 0.62}px)`,
          }}
        />
      ) : null}

      {grain && gr.grain > 0 ? (
        <AbsoluteFill style={{ mixBlendMode: 'overlay', opacity: gr.grain * 2.2 }}>
          <svg width={width} height={height}>
            <rect width="100%" height="100%" filter={`url(#grain-${id})`} />
          </svg>
        </AbsoluteFill>
      ) : null}

      {barH > 0 ? (
        <>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: barH, background: '#000' }} />
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: barH, background: '#000' }} />
        </>
      ) : null}
    </AbsoluteFill>
  );
};
