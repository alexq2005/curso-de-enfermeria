import React from 'react';
import { View } from 'react-native';

interface Props {
  progress: number;
  height?: number;
  trackColor?: string;
  fillColor: string;
  borderRadius?: number;
}

export function ProgressBar({
  progress,
  height = 6,
  trackColor = 'rgba(255,255,255,0.25)',
  fillColor,
  borderRadius = 999,
}: Props) {
  const clamped = Math.max(0, Math.min(100, progress));
  return (
    <View style={{ height, backgroundColor: trackColor, borderRadius, overflow: 'hidden' }}>
      <View
        style={{
          width: `${clamped}%`,
          height: '100%',
          backgroundColor: fillColor,
          borderRadius,
        }}
      />
    </View>
  );
}
