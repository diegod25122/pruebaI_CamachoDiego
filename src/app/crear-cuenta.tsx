/**
 * Crear cuenta (pantalla "registro" del taller; aquí se llama crear-cuenta
 * para no confundirse con el registro de lecturas).
 * Deber 5 · punto 1: indicador de seguridad debajo de la contraseña.
 * Reto 1: al crearla se envía el correo de verificación.
 */
import { router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { useSacudida } from '@/animaciones/useSacudida';
import { Aviso } from '@/components/Aviso';
import { Boton } from '@/components/Boton';
import { Campo } from '@/components/Campo';
import { IndicadorClave } from '@/components/IndicadorClave';
import { PantallaCuenta } from '@/components/PantallaCuenta';
import { mensajeDeError } from '@/lib/errores-firebase';
import {
  LONGITUD_MINIMA_CLAVE,
  validarClave,
  validarConfirmacion,
  validarCorreo,
  validarNombre,
} from '@/lib/validaciones';
import { useSesion } from '@/state/sesion';

type Errores = Partial<Record<'nombre' | 'correo' | 'clave' | 'confirmacion', string | null>>;

export default function PantallaCrearCuenta() {
  const { registrarse } = useSesion();
  const { estilo, sacudir } = useSacudida();
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [clave, setClave] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [errores, setErrores] = useState<Errores>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function manejarRegistro() {
    const nuevosErrores: Errores = {
      nombre: validarNombre(nombre),
      correo: validarCorreo(correo),
      clave: validarClave(clave),
      confirmacion: validarConfirmacion(clave, confirmacion),
    };
    setErrores(nuevosErrores);
    setErrorGeneral(null);
    if (Object.values(nuevosErrores).some(Boolean)) {
      sacudir();
      return;
    }
    setEnviando(true);
    try {
      await registrarse(nombre, correo, clave);
      // Firebase inicia sesión y el layout muestra "Verifica tu correo".
    } catch (error) {
      setErrorGeneral(mensajeDeError(error));
      sacudir();
      setEnviando(false);
    }
  }

  return (
    <PantallaCuenta
      conVolver
      titulo={'Crea tu\ncuenta'}
      bajada="Te enviaremos un correo para verificar que es tuyo."
      estiloHoja={estilo}
      pie={
        <View className="flex-row justify-center items-center gap-1.5">
          <Text className="text-tenue text-[15px]">¿Ya tienes cuenta?</Text>
          <Boton variante="texto" titulo="Inicia sesión" onPress={() => router.back()} />
        </View>
      }>
      {errorGeneral ? <Aviso tipo="alerta" titulo="No se pudo crear la cuenta">{errorGeneral}</Aviso> : null}
      <Campo
        etiqueta="Nombre"
        placeholder="Ej. Juan Pérez"
        value={nombre}
        onChangeText={setNombre}
        error={errores.nombre}
        autoCapitalize="words"
        textContentType="name"
        autoComplete="name"
      />
      <Campo
        etiqueta="Correo"
        placeholder="nombre.apellido@epn.edu.ec"
        value={correo}
        onChangeText={setCorreo}
        error={errores.correo}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        textContentType="emailAddress"
        autoComplete="email"
      />
      <View className="gap-2">
        <Campo
          etiqueta="Contraseña"
          placeholder={`Mínimo ${LONGITUD_MINIMA_CLAVE} caracteres`}
          value={clave}
          onChangeText={setClave}
          error={errores.clave}
          esClave
          textContentType="newPassword"
          autoComplete="new-password"
        />
        <IndicadorClave clave={clave} />
      </View>
      <Campo
        etiqueta="Repite la contraseña"
        placeholder="Escríbela otra vez"
        value={confirmacion}
        onChangeText={setConfirmacion}
        error={errores.confirmacion}
        esClave
        textContentType="newPassword"
        autoComplete="new-password"
        onSubmitEditing={manejarRegistro}
      />
      <Boton titulo="Crear cuenta" onPress={manejarRegistro} cargando={enviando} />
    </PantallaCuenta>
  );
}
