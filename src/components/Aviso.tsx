import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Borde, Color, Espacio, Radio } from '@/constants/theme';

type Tipo = 'info' | 'alerta' | 'pendiente' | 'ok';

const ESTILO: Record<Tipo, { fondo: string; borde: string; simbolo: string }> = {
  info: { fondo: Color.aguaClaro, borde: Color.agua, simbolo: 'i' },
  alerta: { fondo: Color.alertaFondo, borde: Color.alerta, simbolo: '!' },
  pendiente: { fondo: Color.pendienteFondo, borde: Color.pendiente, simbolo: '…' },
  ok: { fondo: Color.okFondo, borde: Color.ok, simbolo: '✓' },
};

interface Props {
  tipo: Tipo;
  titulo: string;
  children?: ReactNode;
}

export function Aviso({ tipo, titulo, children }: Props) {
  const e = ESTILO[tipo];
  return (
    <View
      style={[styles.aviso, { backgroundColor: e.fondo, borderColor: e.borde }]}
      accessibilityRole={tipo === 'alerta' ? 'alert' : undefined}>
      <View style={[styles.simbolo, { backgroundColor: e.borde }]}>
        <Text style={styles.simboloTexto}>{e.simbolo}</Text>
      </View>
      <View style={styles.cuerpo}>
        <Text style={[styles.titulo, { color: e.borde }]}>{titulo}</Text>
        {typeof children === 'string' ? <Text style={styles.texto}>{children}</Text> : children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  aviso: {
    flexDirection: 'row',
    gap: Espacio.m,
    borderWidth: Borde,
    borderLeftWidth: 8,
    borderRadius: Radio.m,
    padding: Espacio.m,
  },
  simbolo: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  simboloTexto: { color: Color.blanco, fontWeight: '900', fontSize: 15 },
  cuerpo: { flex: 1, gap: 4 },
  titulo: { fontSize: 16, fontWeight: '900' },
  texto: { fontSize: 15, color: Color.noche, lineHeight: 21 },
});
