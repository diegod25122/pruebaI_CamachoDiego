import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Borde, Color, Espacio, Radio } from '@/constants/theme';

interface Props {
  children: ReactNode;
  // Color de la "sombra" desplazada: indica el estado de la ficha.
  acento?: string;
  punteada?: boolean;
  style?: StyleProp<ViewStyle>;
  contenido?: StyleProp<ViewStyle>;
}

// Ficha impresa con borde de tinta y una sombra dura desplazada, dibujada con
// una capa debajo (funciona igual en cualquier Android).
export function Ficha({ children, acento = Color.noche, punteada, style, contenido }: Props) {
  return (
    <View style={[styles.marco, style]}>
      <View style={[styles.sombra, { backgroundColor: acento }]} />
      <View style={[styles.cara, punteada && styles.punteada, contenido]}>{children}</View>
    </View>
  );
}

const DESPLAZAMIENTO = 4;

const styles = StyleSheet.create({
  marco: { marginRight: DESPLAZAMIENTO, marginBottom: DESPLAZAMIENTO },
  sombra: {
    position: 'absolute',
    top: DESPLAZAMIENTO,
    left: DESPLAZAMIENTO,
    right: -DESPLAZAMIENTO,
    bottom: -DESPLAZAMIENTO,
    borderRadius: Radio.l,
  },
  cara: {
    backgroundColor: Color.tarjeta,
    borderWidth: Borde,
    borderColor: Color.noche,
    borderRadius: Radio.l,
    padding: Espacio.l,
  },
  punteada: { borderStyle: 'dashed' },
});
