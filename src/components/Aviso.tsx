import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

type Tipo = 'info' | 'alerta' | 'pendiente' | 'ok';

const CAJA: Record<Tipo, string> = {
  info: 'bg-agua-claro border-agua',
  alerta: 'bg-alerta-fondo border-alerta',
  pendiente: 'bg-pendiente-fondo border-pendiente',
  ok: 'bg-ok-fondo border-ok',
};
const PUNTO: Record<Tipo, string> = {
  info: 'bg-agua',
  alerta: 'bg-alerta',
  pendiente: 'bg-pendiente',
  ok: 'bg-ok',
};
const TITULO: Record<Tipo, string> = {
  info: 'text-agua',
  alerta: 'text-alerta',
  pendiente: 'text-pendiente',
  ok: 'text-ok',
};
const SIMBOLO: Record<Tipo, string> = { info: 'i', alerta: '!', pendiente: '…', ok: '✓' };

interface Props {
  tipo: Tipo;
  titulo: string;
  children?: ReactNode;
}

// Los avisos aparecen deslizándose hacia arriba (FadeInUp): el técnico nota
// que algo nuevo apareció sin que la pantalla salte de golpe.
export function Aviso({ tipo, titulo, children }: Props) {
  return (
    <Animated.View
      entering={FadeInUp.duration(280)}
      className={`flex-row gap-3 border-2 border-l-8 rounded-[10px] p-3 ${CAJA[tipo]}`}
      accessibilityRole={tipo === 'alerta' ? 'alert' : undefined}>
      <View className={`w-[26px] h-[26px] rounded-full items-center justify-center ${PUNTO[tipo]}`}>
        <Text className="text-blanco font-black text-[15px]">{SIMBOLO[tipo]}</Text>
      </View>
      <View className="flex-1 gap-1">
        <Text className={`text-base font-black ${TITULO[tipo]}`}>{titulo}</Text>
        {typeof children === 'string' ? (
          <Text className="text-[15px] text-noche leading-[21px]">{children}</Text>
        ) : (
          children
        )}
      </View>
    </Animated.View>
  );
}
