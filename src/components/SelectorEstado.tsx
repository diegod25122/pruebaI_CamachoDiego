import { Pressable, Text, View } from 'react-native';

import { tx } from '@/constants/clases';
import { ESTADOS_MEDIDOR, type EstadoMedidor } from '@/domain/lectura';

const SIMBOLO: Record<EstadoMedidor, string> = { normal: '✓', inaccesible: '⛔', danado: '⚠' };
const BORDE: Record<EstadoMedidor, string> = {
  normal: 'border-ok',
  inaccesible: 'border-pendiente',
  danado: 'border-alerta',
};
const FONDO: Record<EstadoMedidor, string> = { normal: 'bg-ok', inaccesible: 'bg-pendiente', danado: 'bg-alerta' };

interface Props {
  valor: EstadoMedidor | null;
  onCambiar: (estado: EstadoMedidor) => void;
  error?: string;
}

// R5: los tres estados del medidor como tarjetas grandes con su regla visible.
export function SelectorEstado({ valor, onCambiar, error }: Props) {
  return (
    <View className="gap-2" accessibilityRole="radiogroup">
      {ESTADOS_MEDIDOR.map((e) => {
        const activo = valor === e.valor;
        return (
          <Pressable
            key={e.valor}
            onPress={() => onCambiar(e.valor)}
            accessibilityRole="radio"
            accessibilityState={{ checked: activo }}
            className={`flex-row items-center gap-3 min-h-16 p-3 border-[3px] rounded-[10px] ${
              activo ? `bg-tarjeta ${BORDE[e.valor]}` : 'bg-papel-oscuro border-linea'
            }`}>
            <View
              className={`w-[38px] h-[38px] rounded-full items-center justify-center ${activo ? FONDO[e.valor] : 'bg-linea'}`}>
              <Text className="text-blanco text-lg font-black">{SIMBOLO[e.valor]}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-lg font-black text-noche">{e.titulo}</Text>
              <Text className="text-[13px] text-tenue font-semibold">{e.regla}</Text>
            </View>
            <View
              className={`w-6 h-6 rounded-full border-2 items-center justify-center ${activo ? BORDE[e.valor] : 'border-tenue'}`}>
              {activo ? <View className={`w-3 h-3 rounded-full ${FONDO[e.valor]}`} /> : null}
            </View>
          </Pressable>
        );
      })}
      {error ? <Text className={tx.error}>✕ {error}</Text> : null}
    </View>
  );
}
