import { StyleSheet, View } from 'react-native';

import { Color } from '@/constants/theme';

// Cinta reflectiva del chaleco: franjas diagonales amarillas sobre azul tinta.
export function Cinta({ alto = 10 }: { alto?: number }) {
  return (
    <View style={[styles.cinta, { height: alto }]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {Array.from({ length: 40 }, (_, i) => (
        <View key={i} style={[styles.franja, { height: alto * 3, left: i * 22 - alto }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  cinta: { overflow: 'hidden', backgroundColor: Color.noche },
  franja: {
    position: 'absolute',
    top: -10,
    width: 9,
    backgroundColor: Color.chaleco,
    transform: [{ rotate: '35deg' }],
  },
});
