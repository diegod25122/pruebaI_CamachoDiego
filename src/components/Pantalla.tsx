import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
  encabezado?: ReactNode;
  children: ReactNode;
  pie?: ReactNode; // botones fijos abajo
}

export function Pantalla({ encabezado, children, pie }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView className="flex-1 bg-papel" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {encabezado}
      <ScrollView
        className="flex-1 bg-papel"
        contentContainerClassName="p-4 gap-4"
        // El borde inferior del teléfono cambia en cada modelo: es un valor calculado.
        contentContainerStyle={pie ? undefined : { paddingBottom: insets.bottom + 24 }}
        keyboardShouldPersistTaps="handled">
        {children}
      </ScrollView>
      {pie ? (
        <View
          className="flex-row gap-3 px-4 pt-3 bg-papel border-t-2 border-linea"
          style={{ paddingBottom: insets.bottom + 12 }}>
          {pie}
        </View>
      ) : null}
    </KeyboardAvoidingView>
  );
}
