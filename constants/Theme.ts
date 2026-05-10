/**
 * LifeOps design tokens.
 * Editorial / warm neutrals with a burnt-orange accent and forest success.
 */

export const Colors = {
  // Neutrals
  bg: '#F5F1E8',
  bgElevated: '#FBF8F0',
  surface: '#FFFFFF',
  surfaceMuted: '#EFE9D9',

  // Ink
  ink: '#141311',
  inkSoft: '#3A3832',
  inkMuted: '#7A7468',
  inkFaint: '#A8A091',

  // Lines
  border: '#E4DCC8',
  borderSoft: '#EDE6D3',
  divider: '#D9D0B9',

  // Brand accents
  accent: '#C8531F',      // burnt orange
  accentSoft: '#F2D9C9',
  accentInk: '#7A3010',

  forest: '#2F5D3A',
  forestSoft: '#D4E1D4',

  mustard: '#C89A2B',
  mustardSoft: '#F2E5B8',

  plum: '#5C3A52',
  plumSoft: '#E4D5DE',

  sky: '#3B6E8F',
  skySoft: '#D5E2EC',

  // States
  error: '#B83F2B',
  success: '#2F5D3A',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
  '4xl': 64,
} as const;

export const Radii = {
  sm: 8,
  md: 12,
  lg: 18,
  xl: 24,
  '2xl': 32,
  pill: 999,
} as const;

export const Shadows = {
  card: '0 1px 2px rgba(20, 19, 17, 0.04), 0 8px 24px rgba(20, 19, 17, 0.06)',
  lifted: '0 2px 4px rgba(20, 19, 17, 0.06), 0 16px 40px rgba(20, 19, 17, 0.10)',
  inset: 'inset 0 0 0 1px rgba(20, 19, 17, 0.06)',
} as const;

// Serif display stack (editorial feel without bundling a new font).
// Platform fallbacks cover iOS/Android/web.
export const DisplayFont = 'Georgia, "Times New Roman", Times, serif';
