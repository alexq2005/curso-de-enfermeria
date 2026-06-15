// ============================================================
// PressableScale — botón/tarjeta con micro-rebote al presionar
// Reemplazo directo de TouchableOpacity para superficies táctiles.
// Usa Animated.spring + native driver (transform: scale) → 60fps
// sin bloquear el hilo JS. Reenvía accesibilidad, hitSlop y disabled.
// ============================================================

import React, { useRef, useCallback } from 'react';
import {
  Animated,
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
  type GestureResponderEvent,
} from 'react-native';

interface Props extends Omit<PressableProps, 'style' | 'children'> {
  children: React.ReactNode;
  /** Estilo de la superficie (bg, radio, padding, sombra, layout). */
  style?: StyleProp<ViewStyle>;
  /** Escala objetivo mientras se mantiene presionado (default 0.96). */
  pressedScale?: number;
}

export function PressableScale({
  children,
  style,
  pressedScale = 0.96,
  onPressIn,
  onPressOut,
  disabled,
  ...rest
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(
    (e: GestureResponderEvent) => {
      if (!disabled) {
        Animated.spring(scale, {
          toValue: pressedScale,
          useNativeDriver: true,
          speed: 50,
          bounciness: 0,
        }).start();
      }
      onPressIn?.(e);
    },
    [scale, pressedScale, onPressIn, disabled],
  );

  const handlePressOut = useCallback(
    (e: GestureResponderEvent) => {
      if (!disabled) {
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          speed: 40,
          bounciness: 7,
        }).start();
      }
      onPressOut?.(e);
    },
    [scale, onPressOut, disabled],
  );

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      {...rest}
    >
      <Animated.View style={[style, { transform: [{ scale }] }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}
