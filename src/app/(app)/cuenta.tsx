/**
 * Mi cuenta: la "bienvenida" del taller (ficha con los datos que guarda
 * Firebase) más los accesos a editar el nombre, cambiar la contraseña y
 * cerrar sesión.
 */
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Boton } from '@/components/Boton';
import { Encabezado } from '@/components/Encabezado';
import { Ficha } from '@/components/Ficha';
import { Pantalla } from '@/components/Pantalla';
import { tx } from '@/constants/clases';
import { useResumenLocal } from '@/query/hooks';
import { useSesion } from '@/state/sesion';
import { fechaHora } from '@/utils/formato';

/** Firebase entrega las fechas como texto ("Tue, 03 Nov 2026 18:00:00 GMT"). */
function formatearFecha(texto?: string): string {
  if (!texto) return 'Sin registro';
  const ms = Date.parse(texto);
  return Number.isNaN(ms) ? texto : fechaHora(new Date(ms).toISOString());
}

function Fila({ etiqueta, valor, ultima = false }: { etiqueta: string; valor: string; ultima?: boolean }) {
  return (
    <View className={`flex-row justify-between items-center gap-3 py-3 ${ultima ? '' : 'border-b border-linea'}`}>
      <Text className={tx.etiqueta}>{etiqueta}</Text>
      <Text className="shrink text-right text-base font-bold text-noche" numberOfLines={1} ellipsizeMode="middle">
        {valor}
      </Text>
    </View>
  );
}

export default function PantallaCuentaUsuario() {
  const { usuario, nombre, verificado, cerrarSesion } = useSesion();
  const { porEnviar } = useResumenLocal();
  const [saliendo, setSaliendo] = useState(false);

  const salir = () => {
    const aviso =
      porEnviar > 0
        ? `Tienes ${porEnviar} lectura(s) sin enviar. Quedan guardadas en el teléfono y se enviarán cuando haya señal.`
        : 'Se te pedirá tu correo y contraseña para volver a entrar.';
    Alert.alert('¿Cerrar sesión?', aviso, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar sesión',
        style: 'destructive',
        onPress: () => {
          setSaliendo(true);
          // No navegamos: al quedar usuario = null, Stack.Protected lleva al login.
          void cerrarSesion().catch(() => setSaliendo(false));
        },
      },
    ]);
  };

  return (
    <Pantalla encabezado={<Encabezado antetitulo="Firebase Authentication" titulo="Mi cuenta" volver />}>
      <Animated.View entering={FadeInDown.duration(500)}>
        <Ficha acento="bg-agua" contenido="px-4 py-1">
          <Fila etiqueta="Nombre" valor={nombre || 'Sin nombre'} />
          <Fila etiqueta="Correo" valor={usuario?.email ?? ''} />
          <Fila etiqueta="Correo verificado" valor={verificado ? 'Sí ✓' : 'No'} />
          <Fila etiqueta="Cuenta creada" valor={formatearFecha(usuario?.metadata.creationTime)} />
          <Fila etiqueta="Último ingreso" valor={formatearFecha(usuario?.metadata.lastSignInTime)} ultima />
        </Ficha>
      </Animated.View>

      <Boton titulo="Editar mi nombre" onPress={() => router.push('/editar-nombre')} />
      <Boton titulo="Cambiar contraseña" variante="secundario" onPress={() => router.push('/cambiar-clave')} />
      <Boton titulo="Cerrar sesión" variante="peligro" onPress={salir} cargando={saliendo} />
    </Pantalla>
  );
}
