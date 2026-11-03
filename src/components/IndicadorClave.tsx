/**
 * Deber 5 · punto 1: indicador de seguridad de la contraseña, debajo del campo
 * y mientras se escribe.
 *
 * Animación 6 · Medidor de fuerza: tres segmentos que se llenan (withTiming
 * sobre el ancho) y cambian de color de rojo a amarillo y a verde
 * (interpolateColor). El texto del nivel aparece con FadeIn al cambiar.
 */
import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  FadeIn,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { useColores } from '@/animaciones/useColores';
import { evaluarFortaleza, TEXTO_NIVEL, type NivelClave } from '@/lib/fortalezaClave';

const COLORES = ['alerta', 'chaleco', 'ok'] as const;

const TEXTO_COLOR: Record<NivelClave, string> = {
  vacia: 'text-tenue',
  debil: 'text-alerta',
  media: 'text-chaleco-oscuro',
  fuerte: 'text-ok',
};

function Segmento({ indice, valor, colores }: { indice: number; valor: SharedValue<number>; colores: string[] }) {
  const estilo = useAnimatedStyle(() => {
    // Cuánto de este segmento está lleno: 0 a 1.
    const lleno = Math.min(Math.max(valor.value - indice, 0), 1);
    return {
      width: `${lleno * 100}%`,
      backgroundColor: interpolateColor(valor.value, [1, 2, 3], colores),
    };
  });
  return (
    <View className="flex-1 h-2 rounded-full bg-linea overflow-hidden">
      <Animated.View className="h-full rounded-full" style={estilo} />
    </View>
  );
}

export function IndicadorClave({ clave }: { clave: string }) {
  const fortaleza = evaluarFortaleza(clave);
  const c = useColores(COLORES);
  const colores = [c.alerta, c.chaleco, c.ok];
  const valor = useSharedValue<number>(fortaleza.valor);

  useEffect(() => {
    valor.value = withTiming(fortaleza.valor, { duration: 350 });
  }, [fortaleza.valor, valor]);

  if (fortaleza.nivel === 'vacia') return null;

  return (
    <View
      className="gap-1.5"
      accessible
      accessibilityLiveRegion="polite"
      accessibilityLabel={`Seguridad de la contraseña: ${TEXTO_NIVEL[fortaleza.nivel]}`}>
      <View className="flex-row gap-1.5">
        {[0, 1, 2].map((i) => (
          <Segmento key={i} indice={i} valor={valor} colores={colores} />
        ))}
      </View>
      <View className="flex-row justify-between items-start gap-2">
        <Animated.Text
          key={fortaleza.nivel}
          entering={FadeIn.duration(250)}
          className={`text-[13px] font-black uppercase tracking-widest ${TEXTO_COLOR[fortaleza.nivel]}`}>
          Contraseña {TEXTO_NIVEL[fortaleza.nivel].toLowerCase()}
        </Animated.Text>
        {fortaleza.sugerencias[0] ? (
          <Text className="flex-1 text-right text-[13px] text-tenue">{fortaleza.sugerencias[0]}</Text>
        ) : null}
      </View>
    </View>
  );
}
