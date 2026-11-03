/**
 * Botones grandes (mín. 56 px): se usan de pie, con apuro y a veces con guantes.
 *
 * Animación 4 · Botón con resorte: al tocarlo se hunde un poco (scale 0.96)
 * y vuelve con withSpring, para que el técnico sienta que el toque llegó.
 */
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { useColor } from '@/animaciones/useColores';

type Variante = 'principal' | 'secundario' | 'peligro' | 'texto';

interface Props {
  titulo: string;
  onPress: () => void;
  variante?: Variante;
  deshabilitado?: boolean;
  cargando?: boolean;
  detalle?: string;
}

const CAJA: Record<Variante, string> = {
  principal: 'bg-chaleco border-noche border-b-[5px]',
  secundario: 'bg-tarjeta border-noche',
  peligro: 'bg-alerta border-alerta',
  texto: 'bg-transparent border-transparent min-h-11',
};
const TEXTO: Record<Variante, string> = {
  principal: 'text-noche',
  secundario: 'text-noche',
  peligro: 'text-blanco',
  texto: 'text-agua underline',
};

export function Boton({ titulo, onPress, variante = 'principal', deshabilitado, cargando, detalle }: Props) {
  const escala = useSharedValue(1);
  const colorIndicador = useColor(variante === 'peligro' ? 'blanco' : 'noche');
  const inactivo = deshabilitado || cargando;

  const estilo = useAnimatedStyle(() => ({ transform: [{ scale: escala.value }] }));

  return (
    <Animated.View style={estilo} className={inactivo ? 'opacity-45' : ''}>
      <Pressable
        onPress={onPress}
        disabled={inactivo}
        onPressIn={() => {
          escala.value = withSpring(0.96, { damping: 15, stiffness: 300 });
        }}
        onPressOut={() => {
          escala.value = withSpring(1, { damping: 12, stiffness: 220 });
        }}
        accessibilityRole="button"
        accessibilityState={{ disabled: !!inactivo, busy: !!cargando }}
        className={`min-h-14 rounded-[10px] border-2 px-4 py-2 items-center justify-center ${CAJA[variante]}`}>
        <View className="flex-row items-center gap-2">
          {cargando ? <ActivityIndicator color={colorIndicador} /> : null}
          <Text className={`text-[17px] font-black tracking-wide ${TEXTO[variante]}`}>{titulo}</Text>
        </View>
        {detalle ? <Text className={`text-xs font-semibold mt-0.5 ${TEXTO[variante]}`}>{detalle}</Text> : null}
      </Pressable>
    </Animated.View>
  );
}
