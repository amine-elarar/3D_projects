// src/stickman/outfits.ts — character outfits. One signature colour per recurring character;
// keep it identical in every shot (it's how viewers recognise them).

export type Top = 'hoodie' | 'labcoat' | 'trench' | 'jersey' | 'tshirt' | 'suit' | 'dress' | 'tracksuit' | 'none';
export type HeadWear =
  | 'cap' | 'capBack' | 'beanie' | 'fedora' | 'headband' | 'visor' | 'hood' | 'ponytail' | 'bun' | 'curly' | 'spiky' | 'none';

export type Outfit = {
  top?: Top;
  color?: string;
  color2?: string;
  legs?: string;
  head?: HeadWear;
  headColor?: string;
  face?: 'glasses' | 'sunglasses';
  kid?: boolean;
};

/** Signature colours from the style bible. */
export const SIGNATURE = {
  redHoodie: '#d64a33',
  yellowCap: '#f2c21a',
  pinkBeanie: '#f29ac0',
  greenCap: '#3fb950',
  blueTee: '#3a6ea5',
  purpleTracksuit: '#8a5ad6',
} as const;

// Example cast (same as the kit's reference project). Replace with your own per video.
export const HERO: Outfit = { top: 'hoodie', color: SIGNATURE.redHoodie, head: 'none' };
export const FRIEND: Outfit = { top: 'tshirt', color: SIGNATURE.blueTee, head: 'cap', headColor: SIGNATURE.yellowCap };
export const SCIENTIST: Outfit = { top: 'labcoat', face: 'glasses', head: 'none' };
/** Background people / crowds: plain ink, no colour item. */
export const EXTRA: Outfit = { top: 'none', head: 'none' };
