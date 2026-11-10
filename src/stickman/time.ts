// src/stickman/time.ts — shot time in seconds (the kit's `t`), derived from Remotion's frame.
// Inside a <Sequence>, useCurrentFrame() is relative to the sequence start, so t = seconds into the shot.
import { useCurrentFrame, useVideoConfig } from 'remotion';

export const useShotTime = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  return { t: frame / fps, dur: durationInFrames / fps, frame, fps };
};
