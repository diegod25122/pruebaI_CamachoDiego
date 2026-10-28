import { StyleSheet, Text, View } from 'react-native';

import { Color, Radio } from '@/constants/theme';
import type { EstadoEnvio, Verificacion } from '@/domain/lectura';

type Tono = 'pendiente' | 'ok' | 'alerta' | 'info' | 'neutro';

const TONOS: Record<Tono, { fondo: string; texto: string }> = {
  pendiente: { fondo: Color.pendienteFondo, texto: Color.pendiente },
  ok: { fondo: Color.okFondo, texto: Color.ok },
  alerta: { fondo: Color.alertaFondo, texto: Color.alerta },
  info: { fondo: Color.aguaClaro, texto: Color.agua },
  neutro: { fondo: '#E7E3DA', texto: Color.noche },
};

// El estado se dice con palabras, no solo con color.
export function Insignia({ texto, tono }: { texto: string; tono: Tono }) {
  const t = TONOS[tono];
  return (
    <View style={[styles.insignia, { backgroundColor: t.fondo, borderColor: t.texto }]}>
      <Text style={[styles.texto, { color: t.texto }]}>{texto}</Text>
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

const styles = StyleSheet.create({
  insignia: {
    alignSelf: 'flex-start',
    borderWidth: 1.5,
    borderRadius: Radio.pastilla,
    paddingHorizontal: 9,
    paddingVertical: 2,
  },
  texto: { fontSize: 12, fontWeight: '800', letterSpacing: 0.3 },
});
