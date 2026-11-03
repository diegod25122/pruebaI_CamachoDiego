/**
 * Cambiar contraseña (lógica del taller). Pedimos la actual porque Firebase
 * exige un ingreso reciente (auth/requires-recent-login) y porque alguien con
 * el teléfono desbloqueado no debe poder cambiarla.
 * Deber 5 · punto 1: indicador de seguridad debajo de la contraseña nueva.
 */
import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';

import { useSacudida } from '@/animaciones/useSacudida';
import { Aviso } from '@/components/Aviso';
import { Boton } from '@/components/Boton';
import { Campo } from '@/components/Campo';
import { Encabezado } from '@/components/Encabezado';
import { Ficha } from '@/components/Ficha';
import { IndicadorClave } from '@/components/IndicadorClave';
import { Pantalla } from '@/components/Pantalla';
import { mensajeDeError } from '@/lib/errores-firebase';
import { LONGITUD_MINIMA_CLAVE, validarClave, validarConfirmacion } from '@/lib/validaciones';
import { useSesion } from '@/state/sesion';

type Errores = Partial<Record<'actual' | 'nueva' | 'confirmacion', string | null>>;

export default function PantallaCambiarClave() {
  const { cambiarClave } = useSesion();
  const { estilo, sacudir } = useSacudida();
  const [actual, setActual] = useState('');
  const [nueva, setNueva] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [errores, setErrores] = useState<Errores>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [listo, setListo] = useState(false);
  const [enviando, setEnviando] = useState(false);

  async function manejarCambio() {
    const nuevosErrores: Errores = {
      actual: actual ? null : 'Escribe tu contraseña actual.',
      nueva: validarClave(nueva) ?? (nueva === actual ? 'La nueva contraseña debe ser distinta de la actual.' : null),
      confirmacion: validarConfirmacion(nueva, confirmacion),
    };
    setErrores(nuevosErrores);
    setErrorGeneral(null);
    if (Object.values(nuevosErrores).some(Boolean)) {
      sacudir();
      return;
    }
    setEnviando(true);
    try {
      await cambiarClave(actual, nueva);
      setListo(true);
      // No conviene dejar contraseñas en memoria visible.
      setActual('');
      setNueva('');
      setConfirmacion('');
    } catch (error) {
      // Aquí "credencial inválida" significa: la contraseña actual no es correcta.
      setErrorGeneral(
        mensajeDeError(error, {
          'auth/invalid-credential': 'La contraseña actual no es correcta.',
          'auth/wrong-password': 'La contraseña actual no es correcta.',
        }),
      );
      sacudir();
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Pantalla encabezado={<Encabezado antetitulo="Mi cuenta" titulo="Cambiar contraseña" volver />}>
      <Animated.View style={estilo}>
        <Ficha acento="bg-chaleco" contenido="p-4 gap-4">
          {listo ? (
            <Aviso tipo="ok" titulo="Contraseña actualizada">
              La próxima vez que inicies sesión usa la nueva.
            </Aviso>
          ) : null}
          {errorGeneral ? <Aviso tipo="alerta" titulo="No se pudo cambiar">{errorGeneral}</Aviso> : null}
          <Campo
            etiqueta="Contraseña actual"
            value={actual}
            onChangeText={setActual}
            error={errores.actual}
            esClave
            textContentType="password"
            autoComplete="current-password"
          />
          <View className="gap-2">
            <Campo
              etiqueta="Contraseña nueva"
              placeholder={`Mínimo ${LONGITUD_MINIMA_CLAVE} caracteres`}
              value={nueva}
              onChangeText={setNueva}
              error={errores.nueva}
              esClave
              textContentType="newPassword"
              autoComplete="new-password"
            />
            <IndicadorClave clave={nueva} />
          </View>
          <Campo
            etiqueta="Repite la contraseña nueva"
            value={confirmacion}
            onChangeText={setConfirmacion}
            error={errores.confirmacion}
            esClave
            textContentType="newPassword"
            autoComplete="new-password"
            onSubmitEditing={manejarCambio}
          />
          {listo ? (
            <Boton titulo="Volver a mi cuenta" onPress={() => router.back()} />
          ) : (
            <Boton titulo="Guardar contraseña" onPress={() => void manejarCambio()} cargando={enviando} />
          )}
        </Ficha>
      </Animated.View>
    </Pantalla>
  );
}
