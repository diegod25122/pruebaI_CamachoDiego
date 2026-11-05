/**
 * Deber 5 · punto 2: editar el nombre del usuario (displayName) con la
 * función updateProfile de Firebase. La llamada vive en el contexto de sesión
 * (cambiarNombre), igual que el resto de funciones de Firebase.
 */
import { router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';

import { useSacudida } from '@/animaciones/useSacudida';
import { Aviso } from '@/components/Aviso';
import { Boton } from '@/components/Boton';
import { Campo } from '@/components/Campo';
import { Encabezado } from '@/components/Encabezado';
import { Ficha } from '@/components/Ficha';
import { Pantalla } from '@/components/Pantalla';
import { tx } from '@/constants/clases';
import { mensajeDeError } from '@/lib/errores-firebase';
import { validarNombre } from '@/lib/validaciones';
import { useSesion } from '@/state/sesion';

export default function PantallaEditarNombre() {
  const { nombre: nombreActual, cambiarNombre } = useSesion();
  const { estilo, sacudir } = useSacudida();
  const [nombre, setNombre] = useState(nombreActual ?? '');
  const [error, setError] = useState<string | null>(null);
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [guardado, setGuardado] = useState(false);
  const [guardando, setGuardando] = useState(false);

  async function guardar() {
    const e =
      validarNombre(nombre) ?? (nombre.trim() === (nombreActual ?? '').trim() ? 'Escribe un nombre distinto al actual.' : null);
    setError(e);
    setErrorGeneral(null);
    if (e) {
      sacudir();
      return;
    }
    setGuardando(true);
    try {
      await cambiarNombre(nombre);
      setGuardado(true);
    } catch (err) {
      setErrorGeneral(mensajeDeError(err));
      sacudir();
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Pantalla encabezado={<Encabezado antetitulo="Mi cuenta" titulo="Editar nombre" volver />}>
      <Animated.View style={estilo}>
        <Ficha acento="bg-chaleco" contenido="p-4 gap-4">
          <Text className={tx.cuerpo}>
            Así te saluda la app y así aparece tu nombre en tu cuenta de Firebase.
          </Text>
          {guardado ? (
            <View className="items-center gap-2">
              <Animated.View
                entering={ZoomIn.springify().damping(10)}
                className="w-16 h-16 rounded-full bg-ok items-center justify-center">
                <Text className="text-blanco text-3xl font-black">✓</Text>
              </Animated.View>
              <Aviso tipo="ok" titulo="Nombre actualizado">
                {`Ahora te llamas ${nombre.trim()} en la app.`}
              </Aviso>
            </View>
          ) : null}
          {errorGeneral ? <Aviso tipo="alerta" titulo="No se pudo guardar">{errorGeneral}</Aviso> : null}
          <Campo
            etiqueta="Nombre"
            placeholder="Ej. Juan Pérez"
            value={nombre}
            onChangeText={(t) => {
              setNombre(t);
              setGuardado(false);
              setError(null);
            }}
            error={error}
            autoCapitalize="words"
            textContentType="name"
            autoComplete="name"
            maxLength={40}
            onSubmitEditing={guardar}
          />
          {guardado ? (
            <Boton titulo="Volver a mi cuenta" onPress={() => router.back()} />
          ) : (
            <Boton titulo="Guardar nombre" onPress={() => void guardar()} cargando={guardando} />
          )}
        </Ficha>
      </Animated.View>
    </Pantalla>
  );
}
