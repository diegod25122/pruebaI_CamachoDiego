import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Borde, Color, Espacio, Radio } from '@/constants/theme';

interface Props {
  marcada: boolean;
  onCambiar: (marcada: boolean) => void;
  texto: string;
  error?: string;
}

export function Casilla({ marcada, onCambiar, texto, error }: Props) {
  return (
    <View style={styles.contenedor}>
      <Pressable
        onPress={() => onCambiar(!marcada)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: marcada }}
        style={[styles.fila, !!error && styles.filaError]}>
        <View style={[styles.caja, marcada && styles.cajaMarcada]}>
          {marcada ? <Text style={styles.check}>✓</Text> : null}
        </View>
        <Text style={styles.texto}>{texto}</Text>
      </Pressable>
      {error ? <Text style={styles.error}>✕ {error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { gap: Espacio.xs },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Espacio.m,
    padding: Espacio.m,
    borderWidth: Borde,
    borderColor: Color.noche,
    borderRadius: Radio.m,
    backgroundColor: Color.tarjeta,
  },
  filaError: { borderColor: Color.alerta, borderWidth: 3 },
  caja: {
    width: 30,
    height: 30,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Color.noche,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cajaMarcada: { backgroundColor: Color.noche },
  check: { color: Color.chaleco, fontSize: 20, fontWeight: '900' },
  texto: { flex: 1, fontSize: 16, fontWeight: '700', color: Color.noche },
  error: { color: Color.alerta, fontSize: 14, fontWeight: '700' },
});
