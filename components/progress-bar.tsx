import { View } from 'react-native';
import { Colors, Radii } from '@/constants/Theme';

interface ProgressBarProps {
  progress: number;
  color?: string;
  trackColor?: string;
  height?: number;
}

export function ProgressBar({
  progress,
  color = Colors.ink,
  trackColor = Colors.borderSoft,
  height = 8,
}: ProgressBarProps) {
  const raw = Number.isFinite(progress) ? progress : 0;
  const percentage = Math.max(0, Math.min(100, raw <= 1 ? raw * 100 : raw));

  return (
    <View
      style={{
        height,
        borderRadius: Radii.pill,
        backgroundColor: trackColor,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          width: `${percentage}%`,
          height: '100%',
          borderRadius: Radii.pill,
          backgroundColor: color,
        }}
      />
    </View>
  );
}
