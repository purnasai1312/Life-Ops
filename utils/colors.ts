import { Colors } from '@/constants/Theme';
import type { AccentColor } from '@/store/types';

export const accentPair = (
  key: AccentColor
): { base: string; soft: string; ink: string } => {
  switch (key) {
    case 'forest':
      return { base: Colors.forest, soft: Colors.forestSoft, ink: '#163B20' };
    case 'mustard':
      return { base: Colors.mustard, soft: Colors.mustardSoft, ink: '#5A4308' };
    case 'plum':
      return { base: Colors.plum, soft: Colors.plumSoft, ink: '#2E1B29' };
    case 'sky':
      return { base: Colors.sky, soft: Colors.skySoft, ink: '#1C3A4E' };
    case 'accent':
    default:
      return { base: Colors.accent, soft: Colors.accentSoft, ink: Colors.accentInk };
  }
};

export const ACCENT_OPTIONS: AccentColor[] = [
  'accent',
  'forest',
  'mustard',
  'plum',
  'sky',
];
