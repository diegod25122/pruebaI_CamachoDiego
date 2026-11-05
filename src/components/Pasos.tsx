import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { tx } from '@/constants/clases';

const NOMBRES = ['Estado y lectura', 'Consumo y foto', 'Ubicación', 'Revisar y guardar'];

function Barra({ hecha }: { hecha: boolean }) {
  const lleno = useSharedValue(hecha ? 100 : 0);
  useEffect(() => {
    lleno.value = withTiming(hecha ? 100 : 0, { duration: 450 });
  }, [hecha, lleno]);
  const estilo = useAnimatedStyle(() => ({ width: `${lleno.value}%` }));
  return (
    <View className="flex-1 h-2 rounded bg-linea overflow-hidden">
      <Animated.View className="h-full bg-noche" style={estilo} />
    </View>
  );
}

// R8: el técnico sabe en qué parte del registro va. La barra del paso actual
// se llena con una animación corta al llegar a cada pantalla.
export function Pasos({ actual }: { actual: 1 | 2 | 3 | 4 }) {
  return (
    <View className="gap-2" accessibilityLabel={`Paso ${actual} de ${NOMBRES.length}: ${NOMBRES[actual - 1]}`}>
      <View className="flex-row gap-1.5">
        {NOMBRES.map((_, i) => (
          <Barra key={i} hecha={i < actual} />
        ))}
      </View>
      <Text className={tx.etiqueta}>
        Paso {actual} de {NOMBRES.length} · <Text className="text-noche">{NOMBRES[actual - 1]}</Text>
      </Text>
    </View>
  );
}
