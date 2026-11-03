/**
 * R9: visible en TODAS las pantallas (está en el layout raíz, fuera del Stack).
 *
 * Animación 5 · Barra de señal viva:
 *   - El fondo pasa suavemente de azul tinta (con señal) a gris (sin señal)
 *     con interpolateColor.
 *   - El punto late (withRepeat) mientras no hay señal o se están enviando
 *     lecturas: algo está pasando y el técnico lo ve de reojo.
 */
import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  interpolateColor,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColores } from '@/animaciones/useColores';
import { useResumenLocal } from '@/query/hooks';
import { useSync } from '@/sync/SyncProvider';

const COLORES = ['noche', 'sin-red'] as const;

export function BarraConexion() {
  const insets = useSafeAreaInsets();
  const { conexion, enviando } = useSync();
  const { porEnviar, enRevision } = useResumenLocal();
  const c = useColores(COLORES);

  const conRed = conexion === 'con-red';
  const textoRed = conexion === 'comprobando' ? 'Comprobando señal…' : conRed ? 'Con señal' : 'Sin señal';
  const textoPendientes =
    porEnviar === 0 ? 'Todo enviado' : `${porEnviar} por enviar${enRevision > 0 ? ` · ${enRevision} corregir` : ''}`;

  const sinRed = useSharedValue(conRed ? 0 : 1);
  const latido = useSharedValue(1);

  useEffect(() => {
    sinRed.value = withTiming(conRed ? 0 : 1, { duration: 500 });
  }, [conRed, sinRed]);

  const late = !conRed || enviando;
  useEffect(() => {
    if (!late) {
      cancelAnimation(latido);
      latido.value = withTiming(1, { duration: 200 });
      return;
    }
    latido.value = withRepeat(
      withSequence(withTiming(1.5, { duration: 450 }), withTiming(1, { duration: 450 })),
      -1,
      false,
      undefined,
      ReduceMotion.System,
    );
  }, [late, latido]);

  const fondo = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(sinRed.value, [0, 1], [c.noche, c['sin-red']]),
  }));
  const punto = useAnimatedStyle(() => ({ transform: [{ scale: latido.value }] }));

  return (
    <Animated.View
      className="px-4 pb-2 flex-row items-center justify-between gap-2"
      // El alto de la barra de estado cambia en cada teléfono: valor calculado.
      style={[fondo, { paddingTop: insets.top + 6 }]}
      accessible
      accessibilityRole="summary"
      accessibilityLabel={`${textoRed}. ${textoPendientes}${enviando ? '. Enviando lecturas' : ''}`}>
      <View className="flex-row items-center gap-2">
        <Animated.View
          className={`w-3 h-3 rounded-full border-2 border-blanco ${conRed ? 'bg-ok-vivo' : 'bg-transparent'}`}
          style={punto}
        />
        <Text className="text-blanco font-extrabold text-sm">{textoRed}</Text>
      </View>
      <View className={`rounded-full px-2.5 py-[3px] shrink ${porEnviar > 0 ? 'bg-chaleco' : 'bg-white/15'}`}>
        <Text className={`font-extrabold text-[13px] ${porEnviar > 0 ? 'text-noche' : 'text-blanco'}`}>
          {enviando ? 'Enviando… · ' : ''}
          {textoPendientes}
        </Text>
      </View>
    </Animated.View>
  );
}
