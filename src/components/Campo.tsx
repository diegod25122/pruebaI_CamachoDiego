import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { Borde, Color, Espacio, Fuente, Radio, Texto } from '@/constants/theme';

interface Props extends TextInputProps {
  etiqueta: string;
  error?: string;
  ayuda?: string;
  obligatorio?: boolean;
  // "contador": campo grande negro, como los rodillos del medidor.
  estilo?: 'normal' | 'contador';
}

export function Campo({ etiqueta, error, ayuda, obligatorio, estilo = 'normal', style, ...input }: Props) {
  return (
    <View style={styles.contenedor}>
      <Text style={Texto.etiqueta}>
        {etiqueta}
        {obligatorio ? <Text style={styles.obligatorio}> · obligatorio</Text> : null}
      </Text>
      <TextInput
        placeholderTextColor={estilo === 'contador' ? '#6D737B' : '#8C939C'}
        accessibilityLabel={etiqueta}
        accessibilityHint={error ?? ayuda}
        style={[styles.input, estilo === 'contador' && styles.contador, !!error && styles.inputError, style]}
        {...input}
      />
      {error ? (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          ✕ {error}
        </Text>
      ) : ayuda ? (
        <Text style={Texto.pequeno}>{ayuda}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { gap: Espacio.xs },
  obligatorio: { color: Color.alerta },
  input: {
    minHeight: 52,
    borderWidth: Borde,
    borderColor: Color.noche,
    borderRadius: Radio.m,
    backgroundColor: Color.tarjeta,
    paddingHorizontal: Espacio.m,
    fontSize: 17,
    color: Color.noche,
  },
  contador: {
    minHeight: 64,
    backgroundColor: Color.contador,
    color: Color.blanco,
    fontFamily: Fuente.numeros,
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: 6,
    textAlign: 'center',
  },
  inputError: { borderColor: Color.alerta, borderWidth: 3 },
  error: { color: Color.alerta, fontSize: 14, fontWeight: '700' },
});
