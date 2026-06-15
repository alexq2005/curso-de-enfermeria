// ============================================================
// FadeInView — entrada suave (fade + translateY) al montar.
// Para listas se pasa `delay = index * 60` y las tarjetas
// aparecen escalonadas, dando sensación de carga "viva".
// native driver → opacity + translateY no tocan el hilo JS.
// ============================================================

import React, { useRef, useEffect } from 'react';
import { Animated, type StyleProp, type ViewStyle } from 'react-native';

interface Props {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Retardo en ms antes de iniciar (para stagger en listas). */
  delay?: number;
  /** Duración del fade en ms (default 420). */
  duration?: number;
  /** Desplazamiento vertical inicial en dp (default 14). */
  offsetY?: number;
}

export function FadeInView({
  children,
  style,
  delay = 0,
  duration = 420,
  offsetY = 14,
}: Props) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.timing(progress, {
      toValue: 1,
      duration,
      delay,
      useNativeDriver: true,
    });
    anim.start();
    return () => anim.stop();
  }, [progress, delay, duration]);

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [offsetY, 0],
  });

  return (
    <Animated.View
      style={[style, { opacity: progress, transform: [{ translateY }] }]}
    >
      {children}
    </Animated.View>
  );
}
