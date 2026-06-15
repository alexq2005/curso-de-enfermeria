import React, { useRef, useEffect } from 'react';
import { Animated, View } from 'react-native';

interface Props {
  progress: number;
  height?: number;
  trackColor?: string;
  fillColor: string;
  borderRadius?: number;
}

// El fill se anima al montar (0 → progress) y ante cualquier cambio de
// `progress` (ej. al marcar un subtema como leído). width no soporta native
// driver, pero es una sola barra por instancia y la animación corre una vez.
export function ProgressBar({
  progress,
  height = 6,
  trackColor = 'rgba(255,255,255,0.25)',
  fillColor,
  borderRadius = 999,
}: Props) {
  const clamped = Math.max(0, Math.min(100, progress));
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const a = Animated.timing(anim, {
      toValue: clamped,
      duration: 650,
      useNativeDriver: false,
    });
    a.start();
    return () => a.stop();
  }, [clamped, anim]);

  const width = anim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  return (
    <View
      style={{ height, backgroundColor: trackColor, borderRadius, overflow: 'hidden' }}
    >
      <Animated.View
        style={{ width, height: '100%', backgroundColor: fillColor, borderRadius }}
      />
    </View>
  );
}
