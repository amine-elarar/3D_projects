// src/stickman/StyleContext.tsx — which style (and mood) is active.
// Wrap a composition in <StickStyleProvider styleId="emerald"> and read colours with useStick().
// <StickStage> re-provides this context inside the R3F canvas, so 3D components can use it too.
import React, { createContext, useContext, useMemo } from 'react';
import { DEFAULT_STYLE, getMood, getStyle, type Mood, type MoodName, type StyleDef, type StyleId } from './styles';

type StickContextValue = { styleId: StyleId; style: StyleDef; moodName: MoodName; M: Mood };

const StickContext = createContext<StickContextValue | null>(null);

export const StickStyleProvider: React.FC<{ styleId?: StyleId; mood?: MoodName; children: React.ReactNode }> = ({
  styleId,
  mood,
  children,
}) => {
  const parent = useContext(StickContext);
  const id = styleId ?? parent?.styleId ?? DEFAULT_STYLE;
  const moodName = mood ?? parent?.moodName ?? 'dusk';
  const value = useMemo(() => ({ styleId: id, style: getStyle(id), moodName, M: getMood(moodName, id) }), [id, moodName]);
  return <StickContext.Provider value={value}>{children}</StickContext.Provider>;
};

/** { styleId, style (ink, feature, ui, grade…), moodName, M (sky, key, rim, wall, floor, practical…) } */
export const useStick = (): StickContextValue => {
  const ctx = useContext(StickContext);
  return ctx ?? { styleId: DEFAULT_STYLE, style: getStyle(DEFAULT_STYLE), moodName: 'dusk', M: getMood('dusk', DEFAULT_STYLE) };
};
