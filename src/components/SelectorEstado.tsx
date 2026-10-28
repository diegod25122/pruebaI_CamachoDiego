import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Borde, Color, Espacio, Radio } from '@/constants/theme';
import { ESTADOS_MEDIDOR, type EstadoMedidor } from '@/domain/lectura';

const SIMBOLO: Record<EstadoMedidor, string> = { normal: '✓', inaccesible: '⛔', danado: '⚠' };
const ACENTO: Record<EstadoMedidor, string> = { normal: Color.ok, inaccesible: Color.pendiente, danado: Color.alerta };

interface Props {
  valor: EstadoMedidor | null;
  onCambiar: (estado: EstadoMedidor) => void;
  error?: string;
}

// R5: los tres estados del medidor como tarjetas grandes con su regla visible.
export function SelectorEstado({ valor, onCambiar, error }: Props) {
  return (
    <View style={styles.contenedor} accessibilityRole="radiogroup">
      {ESTADOS_MEDIDOR.map((e) => {
        const activo = valor === e.valor;
        return (
          <Pressable
            key={e.valor}
            onPress={() => onCambiar(e.valor)}
            accessibilityRole="radio"
            accessibilityState={{ checked: activo }}
            style={[styles.opcion, activo && { borderColor: ACENTO[e.valor], backgroundColor: Color.tarjeta }]}>
            <View style={[styles.simbolo, { backgroundColor: activo ? ACENTO[e.valor] : Color.linea }]}>
              <Text style={styles.simboloTexto}>{SIMBOLO[e.valor]}</Text>
            </View>
            <View style={styles.textos}>
              <Text style={styles.titulo}>{e.titulo}</Text>
              <Text style={styles.regla}>{e.regla}</Text>
            </View>
            <View style={[styles.radio, activo && { borderColor: ACENTO[e.valor] }]}>
              {activo ? <View style={[styles.radioPunto, { backgroundColor: ACENTO[e.valor] }]} /> : null}
            </View>
          </Pressable>
        );
      })}
      {error ? <Text style={styles.error}>✕ {error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { gap: Espacio.s },
  opcion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Espacio.m,
    minHeight: 64,
    padding: Espacio.m,
    borderWidth: Borde + 1,
    borderColor: Color.linea,
    borderRadius: Radio.m,
    backgroundColor: '#FBF9F4',
  },
  simbolo: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  simboloTexto: { color: Color.blanco, fontSize: 18, fontWeight: '900' },
  textos: { flex: 1 },
  titulo: { fontSize: 18, fontWeight: '900', color: Color.noche },
  regla: { fontSize: 13, color: Color.tenue, fontWeight: '600' },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Color.tenue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioPunto: { width: 12, height: 12, borderRadius: 6 },
  error: { color: Color.alerta, fontSize: 14, fontWeight: '700' },
});
