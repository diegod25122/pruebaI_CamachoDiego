import { StyleSheet, Text, View } from 'react-native';

import { Color, Espacio, Texto } from '@/constants/theme';

const NOMBRES = ['Estado y lectura', 'Consumo y foto', 'Revisar y guardar'];

// R8: el técnico sabe en qué parte del registro va.
export function Pasos({ actual }: { actual: 1 | 2 | 3 }) {
  return (
    <View style={styles.contenedor} accessibilityLabel={`Paso ${actual} de 3: ${NOMBRES[actual - 1]}`}>
      <View style={styles.barras}>
        {NOMBRES.map((_, i) => (
          <View key={i} style={[styles.barra, i < actual && styles.barraHecha]} />
        ))}
      </View>
      <Text style={Texto.etiqueta}>
        Paso {actual} de 3 · <Text style={styles.nombre}>{NOMBRES[actual - 1]}</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { gap: Espacio.s },
  barras: { flexDirection: 'row', gap: 6 },
  barra: { flex: 1, height: 8, borderRadius: 4, backgroundColor: Color.linea },
  barraHecha: { backgroundColor: Color.noche },
  nombre: { color: Color.noche },
});
