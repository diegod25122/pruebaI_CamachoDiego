/**
 * Cinta reflectiva del chaleco: franjas diagonales amarillas sobre azul tinta.
 *
 * Animación 2 · Cinta en movimiento: con `animada`, las franjas avanzan sin
 * fin (withRepeat + Easing.linear). Se mueven exactamente un "paso" (22 px) y
 * vuelven a empezar, así el bucle no se nota. Respeta "reducir movimiento".
 */
import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

const PASO = 22;
const FRANJAS = Array.from({ length: 44 }, (_, i) => i);

export function Cinta({ alta = false, animada = false }: { alta?: boolean; animada?: boolean }) {
  const x = useSharedValue(0);

  useEffect(() => {
    if (!animada) return;
    x.value = withRepeat(
      withTiming(-PASO, { duration: 900, easing: Easing.linear, reduceMotion: ReduceMotion.System }),
      -1,
      false,
    );
    return () => cancelAnimation(x);
  }, [animada, x]);

  const movimiento = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));

  return (
    <View
      className={`overflow-hidden bg-noche ${alta ? 'h-3' : 'h-2.5'}`}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants">
      <Animated.View className="absolute inset-y-0 -left-3 flex-row" style={movimiento}>
        {FRANJAS.map((i) => (
          <View key={i} className="w-[9px] h-9 -mt-3 mr-[13px] bg-chaleco rotate-[35deg]" />
        ))}
      </Animated.View>
    </View>
  );
}
