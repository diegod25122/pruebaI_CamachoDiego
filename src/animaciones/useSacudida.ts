/**
 * Animación 1 · Sacudida (reto 2 del taller).
 * Cuando el ingreso falla, la hoja del formulario se sacude de lado a lado,
 * como una cabeza que dice "no". Usa withSequence para encadenar movimientos.
 */
import { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';

export function useSacudida() {
  const x = useSharedValue(0);

  const estilo = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));

  function sacudir() {
    x.value = withSequence(
      withTiming(-12, { duration: 50 }),
      withTiming(12, { duration: 70 }),
      withTiming(-9, { duration: 70 }),
      withTiming(9, { duration: 70 }),
      withTiming(-4, { duration: 60 }),
      withTiming(0, { duration: 50 }),
    );
  }

  return { estilo, sacudir };
}
