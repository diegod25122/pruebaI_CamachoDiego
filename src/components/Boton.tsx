import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { Borde, Color, Espacio, Radio } from '@/constants/theme';

type Variante = 'principal' | 'secundario' | 'peligro' | 'texto';

interface Props {
  titulo: string;
  onPress: () => void;
  variante?: Variante;
  deshabilitado?: boolean;
  cargando?: boolean;
  detalle?: string;
}

// Botones grandes (mín. 56 px): se usan de pie, con apuro y a veces con guantes.
export function Boton({ titulo, onPress, variante = 'principal', deshabilitado, cargando, detalle }: Props) {
  const inactivo = deshabilitado || cargando;
  return (
    <Pressable
      onPress={onPress}
      disabled={inactivo}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!inactivo, busy: !!cargando }}
      style={({ pressed }) => [
        styles.base,
        styles[variante],
        pressed && !inactivo && styles.presionado,
        inactivo && styles.inactivo,
      ]}>
      <View style={styles.fila}>
        {cargando ? <ActivityIndicator color={variante === 'principal' ? Color.noche : Color.blanco} /> : null}
        <Text style={[styles.titulo, styles[`t_${variante}`]]}>{titulo}</Text>
      </View>
      {detalle ? <Text style={[styles.detalle, styles[`t_${variante}`]]}>{detalle}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 56,
    borderRadius: Radio.m,
    borderWidth: Borde,
    borderColor: Color.noche,
    paddingHorizontal: Espacio.l,
    paddingVertical: Espacio.s,
    alignItems: 'center',
    justifyContent: 'center',
  },
  principal: { backgroundColor: Color.chaleco, borderBottomWidth: 5 },
  secundario: { backgroundColor: Color.tarjeta },
  peligro: { backgroundColor: Color.alerta, borderColor: Color.alerta },
  texto: { backgroundColor: 'transparent', borderColor: 'transparent', minHeight: 44 },
  presionado: { transform: [{ translateY: 2 }] },
  inactivo: { opacity: 0.45 },
  fila: { flexDirection: 'row', alignItems: 'center', gap: Espacio.s },
  titulo: { fontSize: 17, fontWeight: '900', letterSpacing: 0.3 },
  detalle: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  t_principal: { color: Color.noche },
  t_secundario: { color: Color.noche },
  t_peligro: { color: Color.blanco },
  t_texto: { color: Color.agua, textDecorationLine: 'underline' },
});
