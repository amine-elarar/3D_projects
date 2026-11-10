// src/stickman/styles.ts — Cinematic Teal & Orange 3D style + mood palettes.
// Replaced the green emerald lighting with a Hollywood Teal & Orange 3-point lighting colour palette.

export type MoodPalette = {
  sky: [string, string, string];
  key: string;       // Warm Orange Key Light
  fill?: string;     // Cool Teal Fill Light
  rim: string;       // Crisp Rim / Backlight
  ambient: string;
  dark: string;
  wall: string;
  floor: string;
  accent: string;
  practical: string; // Warm practical lamps / windows
  road: string;
  grass: string;
};

export type MoodName = 'night' | 'dusk' | 'void' | 'storm' | 'dawn';

export type StyleGrade = {
  lift: [number, number, number];
  gamma: [number, number, number];
  gain: [number, number, number];
  contrast: number;
  sat?: number;
  vignette: number;
  grain: number;
  bloom: number;
};

export type StyleUI = {
  text: string;
  sub: string;
  accent: string;
  gold: string;
  cream: string;
  blueprint: string;
  card: string;
  cardLine: string;
};

export type StickStyle = {
  name: string;
  ink: string;
  feature: string;
  ui: StyleUI;
  grade: StyleGrade;
  moods: Record<MoodName, MoodPalette>;
};

export type StyleId = 'tealOrange' | 'emerald' | 'ember' | 'noir';

const TEAL_ORANGE_UI: StyleUI = {
  text: '#f8fafc',
  sub: '#94a3b8',
  accent: '#ff8c3b',
  gold: '#ffa94d',
  cream: '#fff3e0',
  blueprint: '#38bdf8',
  card: 'rgba(8, 19, 28, 0.88)',
  cardLine: 'rgba(56, 189, 248, 0.35)',
};

const TEAL_ORANGE_MOODS: Record<MoodName, MoodPalette> = {
  night: {
    sky: ['#040d14', '#0a1f2e', '#12354a'],
    key: '#ff8c3b',
    fill: '#1a9cb8',
    rim: '#38bdf8',
    ambient: '#164e63',
    dark: '#050c12',
    wall: '#0f1c26',
    floor: '#091219',
    accent: '#ff9442',
    practical: '#ff9e47',
    road: '#0b141c',
    grass: '#0e2430',
  },
  dusk: {
    sky: ['#07131c', '#102a3b', '#1b465c'],
    key: '#ff9a47',
    fill: '#22a6c4',
    rim: '#ffb366',
    ambient: '#1e5b70',
    dark: '#061017',
    wall: '#142430',
    floor: '#0c161f',
    accent: '#ffa352',
    practical: '#ffab5e',
    road: '#0e1922',
    grass: '#122c3a',
  },
  void: {
    sky: ['#03090f', '#081824', '#0f2c3d'],
    key: '#ff8533',
    fill: '#1793b0',
    rim: '#38bdf8',
    ambient: '#144457',
    dark: '#03080d',
    wall: '#0d1821',
    floor: '#070f15',
    accent: '#ff8c3b',
    practical: '#ff9442',
    road: '#081017',
    grass: '#0b1e29',
  },
  storm: {
    sky: ['#050c12', '#0b202d', '#14384a'],
    key: '#ff7726',
    fill: '#158aa6',
    rim: '#2dd4bf',
    ambient: '#133e4e',
    dark: '#040a0f',
    wall: '#101d26',
    floor: '#081017',
    accent: '#ff7b29',
    practical: '#ff8533',
    road: '#091118',
    grass: '#0c202b',
  },
  dawn: {
    sky: ['#081520', '#133145', '#21536e'],
    key: '#ffa04d',
    fill: '#26b0cf',
    rim: '#ffd08a',
    ambient: '#23667d',
    dark: '#07111a',
    wall: '#172936',
    floor: '#0d1922',
    accent: '#ffb366',
    practical: '#ffb86c',
    road: '#101c26',
    grass: '#153242',
  },
};

export const STYLES: Record<StyleId, StickStyle> = {
  // Primary Hollywood Teal & Orange 3-Point Lighting style
  tealOrange: {
    name: 'Cinematic Teal & Orange',
    ink: '#151c24',
    feature: '#38bdf8',
    ui: TEAL_ORANGE_UI,
    grade: {
      lift: [0.0, 0.024, 0.048],
      gamma: [1.0, 1.0, 1.02],
      gain: [1.06, 0.99, 0.92],
      contrast: 1.08,
      sat: 1.08,
      vignette: 0.52,
      grain: 0.035,
      bloom: 0.5,
    },
    moods: TEAL_ORANGE_MOODS,
  },
  // Alias 'emerald' to Teal & Orange so no legacy green lighting remains anywhere in the project
  emerald: {
    name: 'Cinematic Teal & Orange',
    ink: '#151c24',
    feature: '#38bdf8',
    ui: TEAL_ORANGE_UI,
    grade: {
      lift: [0.0, 0.024, 0.048],
      gamma: [1.0, 1.0, 1.02],
      gain: [1.06, 0.99, 0.92],
      contrast: 1.08,
      sat: 1.08,
      vignette: 0.52,
      grain: 0.035,
      bloom: 0.5,
    },
    moods: TEAL_ORANGE_MOODS,
  },
  ember: {
    name: 'Ember Overdrive (Crimson & Deep Teal)',
    ink: '#1a1114',
    feature: '#ff6b3d',
    ui: {
      ...TEAL_ORANGE_UI,
      accent: '#ff5722',
      gold: '#ff8a50',
    },
    grade: {
      lift: [0.04, 0.01, 0.02],
      gamma: [1.0, 0.98, 0.98],
      gain: [1.1, 0.94, 0.88],
      contrast: 1.12,
      sat: 1.1,
      vignette: 0.62,
      grain: 0.045,
      bloom: 0.58,
    },
    moods: {
      night: { sky: ['#0a060c', '#1f0d18', '#381524'], key: '#ff5722', fill: '#146c82', rim: '#ff8a50', ambient: '#2b1822', dark: '#090509', wall: '#1d1219', floor: '#120a0f', accent: '#ff7043', practical: '#ff8a50', road: '#120b10', grass: '#1a1016' },
      dusk:  { sky: ['#12080d', '#29111c', '#471b2a'], key: '#ff6d3a', fill: '#187b94', rim: '#ffa066', ambient: '#381d28', dark: '#0d060a', wall: '#24151d', floor: '#160c12', accent: '#ff8a50', practical: '#ffa066', road: '#160d13', grass: '#1f1219' },
      void:  { sky: ['#060408', '#140b16', '#241224'], key: '#ff4d29', fill: '#125e73', rim: '#ff7547', ambient: '#21121c', dark: '#060307', wall: '#170d14', floor: '#0e080d', accent: '#ff5722', practical: '#ff7043', road: '#0e080d', grass: '#140b12' },
      storm: { sky: ['#0c0406', '#21090e', '#3b1018'], key: '#ff3d2e', fill: '#0f5c70', rim: '#ff854d', ambient: '#2d1218', dark: '#080305', wall: '#1f0d12', floor: '#12070a', accent: '#ff5238', practical: '#ff6e40', road: '#12070a', grass: '#190a0e' },
      dawn:  { sky: ['#14090e', '#2e141f', '#4f2230'], key: '#ff8040', fill: '#1d869e', rim: '#ffb37a', ambient: '#3d222c', dark: '#0f080b', wall: '#281820', floor: '#180e14', accent: '#ff945c', practical: '#ffb37a', road: '#180e14', grass: '#22131b' },
    },
  },
  noir: {
    name: 'Noir Chalk',
    ink: '#0d0d10',
    feature: '#ffffff',
    ui: {
      ...TEAL_ORANGE_UI,
      accent: '#e8b86d',
      gold: '#f0c987',
    },
    grade: {
      lift: [0.02, 0.02, 0.03],
      gamma: [1.0, 1.0, 1.0],
      gain: [1.0, 1.0, 1.04],
      contrast: 1.18,
      sat: 0.85,
      vignette: 0.72,
      grain: 0.09,
      bloom: 0.4,
    },
    moods: {
      night: { sky: ['#05060a', '#10131c', '#1c2130'], key: '#ffd9b3', fill: '#3b6982', rim: '#ffffff', ambient: '#2a3040', dark: '#06070c', wall: '#171a24', floor: '#0f1119', accent: '#e8b86d', practical: '#ffe0bd', road: '#0d0f17', grass: '#141824' },
      dusk:  { sky: ['#0c0e14', '#1b1f2c', '#2b3040'], key: '#ffe0bd', fill: '#477894', rim: '#f4f4f8', ambient: '#3a4052', dark: '#090b10', wall: '#202430', floor: '#141720', accent: '#e8b86d', practical: '#ffe6c7', road: '#12151e', grass: '#1a1f2e' },
      void:  { sky: ['#020305', '#080a10', '#12151f'], key: '#ffd2a6', fill: '#2c546b', rim: '#ffffff', ambient: '#1e222e', dark: '#030406', wall: '#10131c', floor: '#090b10', accent: '#d9dde8', practical: '#ffd9b3', road: '#080a0f', grass: '#0e111a' },
      storm: { sky: ['#06080d', '#121621', '#1f2636'], key: '#ffcca0', fill: '#35637d', rim: '#e6ecf5', ambient: '#283040', dark: '#06080d', wall: '#161b26', floor: '#0d1018', accent: '#9fb4d4', practical: '#ffd9b3', road: '#0c0f16', grass: '#131824' },
      dawn:  { sky: ['#12151f', '#222736', '#353c50'], key: '#ffe6c7', fill: '#5285a1', rim: '#ffffff', ambient: '#464e63', dark: '#0c0e15', wall: '#262b3a', floor: '#181c26', accent: '#f0c987', practical: '#ffebd1', road: '#161a24', grass: '#1f2533' },
    },
  },
};

export const DEFAULT_STYLE: StyleId = 'tealOrange';
export const DEFAULT_MOOD: MoodName = 'night';

// Type aliases & helpers for StyleContext and StickGrade
export type Mood = MoodPalette;
export type Grade = StyleGrade;
export type StyleDef = StickStyle;

export const getStyle = (id: StyleId = DEFAULT_STYLE): StyleDef => STYLES[id] || STYLES[DEFAULT_STYLE];
export const getMood = (m: MoodName = DEFAULT_MOOD, id: StyleId = DEFAULT_STYLE): Mood => {
  const s = getStyle(id);
  return s.moods[m] || s.moods[DEFAULT_MOOD];
};
