import { Text, View } from 'react-native';

import type { EstadoEnvio, Verificacion } from '@/domain/lectura';

type Tono = 'pendiente' | 'ok' | 'alerta' | 'info' | 'neutro';

const CAJA: Record<Tono, string> = {
  pendiente: 'bg-pendiente-fondo border-pendiente',
  ok: 'bg-ok-fondo border-ok',
  alerta: 'bg-alerta-fondo border-alerta',
  info: 'bg-agua-claro border-agua',
  neutro: 'bg-papel border-noche',
};
const TEXTO: Record<Tono, string> = {
  pendiente: 'text-pendiente',
  ok: 'text-ok',
  alerta: 'text-alerta',
  info: 'text-agua',
  neutro: 'text-noche',
};

// El estado se dice con palabras, no solo con color.
export function Insignia({ texto, tono }: { texto: string; tono: Tono }) {
  return (
    <View className={`self-start border-[1.5px] rounded-full px-[9px] py-0.5 ${CAJA[tono]}`}>
      <Text className={`text-xs font-extrabold tracking-wide ${TEXTO[tono]}`}>{texto}</Text>
    </View>
  );
}

export function InsigniaEnvio({ envio }: { envio: EstadoEnvio }) {
  switch (envio) {
    case 'pendiente':
      return <Insignia texto="Por enviar" tono="pendiente" />;
    case 'enviando':
      return <Insignia texto="Enviando…" tono="info" />;
    case 'revision':
      return <Insignia texto="Corregir" tono="alerta" />;
    case 'enviada':
      return <Insignia texto="Enviada ✓" tono="ok" />;
    case 'rechazada':
      return <Insignia texto="Rechazada" tono="alerta" />;
  }
}

export function InsigniaVerificacion({ verificacion }: { verificacion: Verificacion }) {
  return verificacion === 'pendiente' ? (
    <Insignia texto="Pendiente de verificar" tono="pendiente" />
  ) : (
    <Insignia texto="Verificada" tono="ok" />
  );
}
