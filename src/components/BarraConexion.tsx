import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Color, Espacio, Radio } from '@/constants/theme';
import { useResumenLocal } from '@/query/hooks';
import { useSync } from '@/sync/SyncProvider';

// R9: visible en todas las pantallas (está en el layout raíz, encima del
// Stack): si hay señal y cuántas lecturas faltan por enviar.
export function BarraConexion() {
  const insets = useSafeAreaInsets();
  const { conexion, enviando } = useSync();
  const { porEnviar, enRevision } = useResumenLocal();

  const conRed = conexion === 'con-red';
  const textoRed = conexion === 'comprobando' ? 'Comprobando señal…' : conRed ? 'Con señal' : 'Sin señal';
  const textoPendientes =
    porEnviar === 0 ? 'Todo enviado' : `${porEnviar} por enviar${enRevision > 0 ? ` · ${enRevision} corregir` : ''}`;

  return (
    <View
      style={[styles.barra, { paddingTop: insets.top + 6 }, !conRed && styles.barraSinRed]}
      accessible
      accessibilityRole="summary"
      accessibilityLabel={`${textoRed}. ${textoPendientes}${enviando ? '. Enviando lecturas' : ''}`}>
      <View style={styles.lado}>
        <View style={[styles.punto, conRed ? styles.puntoOk : styles.puntoNo]} />
        <Text style={styles.texto}>{textoRed}</Text>
      </View>
      <View style={[styles.pastilla, porEnviar > 0 ? styles.pastillaPendiente : styles.pastillaOk]}>
        <Text style={[styles.textoPastilla, porEnviar > 0 && styles.textoPastillaPendiente]}>
          {enviando ? 'Enviando… · ' : ''}
          {textoPendientes}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  barra: {
    backgroundColor: Color.noche,
    paddingHorizontal: Espacio.l,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Espacio.s,
  },
  barraSinRed: { backgroundColor: Color.sinRed },
  lado: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  punto: { width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: Color.blanco },
  puntoOk: { backgroundColor: '#3DDC84' },
  puntoNo: { backgroundColor: 'transparent' },
  texto: { color: Color.blanco, fontWeight: '800', fontSize: 14 },
  pastilla: { borderRadius: Radio.pastilla, paddingHorizontal: 10, paddingVertical: 3, flexShrink: 1 },
  pastillaOk: { backgroundColor: 'rgba(255,255,255,0.14)' },
  pastillaPendiente: { backgroundColor: Color.chaleco },
  textoPastilla: { color: Color.blanco, fontWeight: '800', fontSize: 13 },
  textoPastillaPendiente: { color: Color.noche },
});
