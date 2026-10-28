import { StyleSheet, Text, View } from 'react-native';

import { Color, Fuente } from '@/constants/theme';

interface Props {
  valor: number | null;
  digitos?: number;
  tamano?: 'grande' | 'mediano' | 'pequeno';
  alerta?: boolean;
}

const MEDIDAS = {
  grande: { ancho: 34, alto: 48, fuente: 30 },
  mediano: { ancho: 24, alto: 34, fuente: 21 },
  pequeno: { ancho: 17, alto: 24, fuente: 15 },
};

// Muestra una lectura como el contador de rodillos del medidor de agua.
export function Contador({ valor, digitos = 6, tamano = 'mediano', alerta }: Props) {
  const m = MEDIDAS[tamano];
  const texto = valor === null ? '–'.repeat(digitos) : String(valor).padStart(digitos, '0');
  return (
    <View
      style={styles.fila}
      accessible
      accessibilityLabel={valor === null ? 'Sin lectura' : `${valor} metros cúbicos`}>
      {texto.split('').map((d, i) => (
        <View
          key={i}
          style={[
            styles.rodillo,
            { width: m.ancho, height: m.alto },
            alerta && styles.rodilloAlerta,
          ]}>
          <Text style={[styles.digito, { fontSize: m.fuente }]}>{d}</Text>
        </View>
      ))}
      <Text style={[styles.unidad, { fontSize: m.fuente * 0.55 }]}>m³</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fila: { flexDirection: 'row', alignItems: 'flex-end', gap: 3 },
  rodillo: {
    backgroundColor: Color.contador,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Color.contadorBorde,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rodilloAlerta: { backgroundColor: Color.alerta, borderColor: Color.alerta },
  digito: { color: Color.blanco, fontFamily: Fuente.numeros, fontWeight: '700' },
  unidad: { marginLeft: 4, color: Color.tenue, fontWeight: '800' },
});
