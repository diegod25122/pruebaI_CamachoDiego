import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Color, Espacio } from '@/constants/theme';

interface Props {
  encabezado?: ReactNode;
  children: ReactNode;
  pie?: ReactNode; // botones fijos abajo
}

export function Pantalla({ encabezado, children, pie }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView style={styles.raiz} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {encabezado}
      <ScrollView
        style={styles.raiz}
        contentContainerStyle={[styles.contenido, !pie && { paddingBottom: insets.bottom + Espacio.xl }]}
        keyboardShouldPersistTaps="handled">
        {children}
      </ScrollView>
      {pie ? <View style={[styles.pie, { paddingBottom: insets.bottom + Espacio.m }]}>{pie}</View> : null}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  raiz: { flex: 1, backgroundColor: Color.papel },
  contenido: { padding: Espacio.l, gap: Espacio.l },
  pie: {
    flexDirection: 'row',
    gap: Espacio.m,
    paddingHorizontal: Espacio.l,
    paddingTop: Espacio.m,
    backgroundColor: Color.papel,
    borderTopWidth: 2,
    borderTopColor: Color.linea,
  },
});
