import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Cinta } from '@/components/Cinta';
import { Color, Espacio, Texto } from '@/constants/theme';

interface Props {
  titulo: string;
  antetitulo?: string;
  volver?: boolean | (() => void);
  derecha?: ReactNode;
}

export function Encabezado({ titulo, antetitulo, volver, derecha }: Props) {
  const alVolver = typeof volver === 'function' ? volver : () => (router.canGoBack() ? router.back() : router.replace('/'));
  return (
    <View>
      <View style={styles.encabezado}>
        {volver ? (
          <Pressable
            onPress={alVolver}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Volver"
            style={styles.volver}>
            <Text style={styles.flecha}>‹</Text>
          </Pressable>
        ) : null}
        <View style={styles.textos}>
          {antetitulo ? <Text style={styles.antetitulo}>{antetitulo}</Text> : null}
          <Text style={styles.titulo} numberOfLines={1} adjustsFontSizeToFit accessibilityRole="header">
            {titulo}
          </Text>
        </View>
        {derecha}
      </View>
      <Cinta />
    </View>
  );
}

const styles = StyleSheet.create({
  encabezado: {
    backgroundColor: Color.papel,
    paddingHorizontal: Espacio.l,
    paddingTop: Espacio.m,
    paddingBottom: Espacio.m,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Espacio.m,
  },
  volver: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: Color.noche,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Color.tarjeta,
  },
  flecha: { fontSize: 30, lineHeight: 32, fontWeight: '700', color: Color.noche, marginTop: -3 },
  textos: { flex: 1 },
  antetitulo: { ...Texto.etiqueta, color: Color.agua },
  titulo: Texto.titulo,
});
