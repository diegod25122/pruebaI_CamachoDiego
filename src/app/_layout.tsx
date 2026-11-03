/**
 * Layout raíz: lo primero que se ejecuta al abrir la app.
 *   1. Carga los estilos de Uniwind (global.css).
 *   2. Envuelve la app en los proveedores (caché, sesión de Firebase, envío, borrador).
 *   3. Decide qué pantallas existen según la sesión (Stack.Protected, como en el taller).
 *   4. Mantiene el splash hasta saber si hay sesión.
 */
import '../../global.css';

import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';

import { useColor } from '@/animaciones/useColores';
import { BarraConexion } from '@/components/BarraConexion';
import { ModalBorrador } from '@/components/ModalBorrador';
import { persistOptions, queryClient } from '@/query/queryClient';
import { BorradorProvider } from '@/state/borrador';
import { ProveedorSesion, useSesion } from '@/state/sesion';
import { SyncProvider } from '@/sync/SyncProvider';

void SplashScreen.preventAutoHideAsync();

/**
 * Separado de RootLayout porque useSesion solo funciona DENTRO de
 * ProveedorSesion, y RootLayout es quien lo crea.
 */
function Navegacion() {
  const { usuario, verificado, cargando } = useSesion();
  const papel = useColor('papel');

  useEffect(() => {
    if (!cargando) void SplashScreen.hideAsync();
  }, [cargando]);

  // Mientras Firebase revisa si hay una sesión guardada, el splash sigue visible.
  if (cargando) return null;

  const conCuenta = usuario !== null;

  // Stack.Protected: si `guard` es false, esas rutas "no existen" y Expo Router
  // lleva a la primera disponible. No hacen falta redirecciones a mano.
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: papel }, animation: 'slide_from_right' }}>
      {/* Reto 1: solo con el correo verificado se entra a la app. */}
      <Stack.Protected guard={conCuenta && verificado}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
      <Stack.Protected guard={conCuenta && !verificado}>
        <Stack.Screen name="verificar-correo" />
      </Stack.Protected>
      <Stack.Protected guard={!conCuenta}>
        <Stack.Screen name="login" />
        <Stack.Screen name="crear-cuenta" />
        <Stack.Screen name="recuperar" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <PersistQueryClientProvider client={queryClient} persistOptions={persistOptions}>
      <ProveedorSesion>
        <SyncProvider>
          <BorradorProvider>
            <View className="flex-1 bg-papel">
              <StatusBar style="light" />
              {/* R9: fuera del Stack, así aparece en todas las pantallas. */}
              <BarraConexion />
              <Navegacion />
              <ModalBorrador />
            </View>
          </BorradorProvider>
        </SyncProvider>
      </ProveedorSesion>
    </PersistQueryClientProvider>
  );
}
