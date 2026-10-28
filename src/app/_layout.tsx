import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { BarraConexion } from '@/components/BarraConexion';
import { ModalBorrador } from '@/components/ModalBorrador';
import { Color } from '@/constants/theme';
import { persistOptions, queryClient } from '@/query/queryClient';
import { BorradorProvider } from '@/state/borrador';
import { SesionProvider, useSesion } from '@/state/sesion';
import { SyncProvider } from '@/sync/SyncProvider';

void SplashScreen.preventAutoHideAsync();

function Navegacion() {
  const { sesion, cargando } = useSesion();

  useEffect(() => {
    if (!cargando) void SplashScreen.hideAsync();
  }, [cargando]);

  if (cargando) return null;

  // R1: sin sesión solo existe la pantalla de ingreso; con sesión, el resto.
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Color.papel }, animation: 'slide_from_right' }}>
      <Stack.Protected guard={sesion !== null}>
        <Stack.Screen name="index" />
        <Stack.Screen name="medidor/[codigo]" />
        <Stack.Screen name="registro/estado" />
        <Stack.Screen name="registro/foto" />
        <Stack.Screen name="registro/resumen" />
        <Stack.Screen name="lectura/[id]" />
      </Stack.Protected>
      <Stack.Protected guard={sesion === null}>
        <Stack.Screen name="login" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <PersistQueryClientProvider client={queryClient} persistOptions={persistOptions}>
      <SesionProvider>
        <SyncProvider>
          <BorradorProvider>
            <View style={styles.raiz}>
              <StatusBar style="light" />
              {/* R9: la barra está fuera del Stack, así aparece en todas las pantallas. */}
              <BarraConexion />
              <Navegacion />
              <ModalBorrador />
            </View>
          </BorradorProvider>
        </SyncProvider>
      </SesionProvider>
    </PersistQueryClientProvider>
  );
}

const styles = StyleSheet.create({
  raiz: { flex: 1, backgroundColor: Color.papel },
});
