/**
 * Auth theme tokens — warm, minimal, premium wellness aesthetic.
 * Matches the main app's editorial cream/terracotta palette.
 */

export const AuthColors = {
  bg: '#F7F3EA',
  card: '#FFFFFF',
  cardMuted: '#F0EBE1',
  surface: '#FFFFFF',

  text: '#151515',
  textSoft: '#3A3832',
  textMuted: '#6F6A61',
  textFaint: '#A8A091',

  accent: '#C9562A',
  accentSoft: '#F2D9C9',

  border: '#E4D8C5',
  borderFocus: '#C9562A',
  divider: '#E4D8C5',

  button: '#111111',
  buttonText: '#FFFFFF',

  error: '#B83F2B',
  errorSoft: 'rgba(184, 63, 43, 0.08)',
  success: '#2F5D3A',
} as const;

export const AuthRadii = {
  input: 14,
  button: 14,
  card: 14,
  toggle: 12,
  pill: 999,
} as const;
