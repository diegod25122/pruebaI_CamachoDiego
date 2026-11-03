/**
 * Recuperar contraseña (lógica del taller).
 * 1. El técnico escribe su correo. 2. Firebase envía un enlace.
 * 3. En la página de Firebase escribe la contraseña nueva. 4. Vuelve e ingresa.
 */
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { Aviso } from '@/components/Aviso';
import { Boton } from '@/components/Boton';
import { Campo } from '@/components/Campo';
import { PantallaCuenta } from '@/components/PantallaCuenta';
import { mensajeDeError } from '@/lib/errores-firebase';
import { validarCorreo } from '@/lib/validaciones';
import { useSesion } from '@/state/sesion';

export default function PantallaRecuperar() {
  const { enviarCorreoRecuperacion } = useSesion();
  const params = useLocalSearchParams<{ correo?: string }>();
  const [correo, setCorreo] = useState(params.correo ?? '');
  const [errorCampo, setErrorCampo] = useState<string | null>(null);
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);

  async function manejarEnvio() {
    const error = validarCorreo(correo);
    setErrorCampo(error);
    setErrorGeneral(null);
    if (error) return;
    setEnviando(true);
    try {
      await enviarCorreoRecuperacion(correo);
      setEnviado(true);
    } catch (e) {
      setErrorGeneral(mensajeDeError(e));
    } finally {
      // Aquí sí va finally: la pantalla sigue montada en ambos casos.
      setEnviando(false);
    }
  }

  return (
    <PantallaCuenta
      conVolver
      titulo={'Recupera\ntu acceso'}
      bajada="Te enviaremos un enlace para que crees una contraseña nueva.">
      {/* Mensaje neutro a propósito: no confirmamos si el correo existe
          (evita que alguien averigüe qué correos tienen cuenta). */}
      {enviado ? (
        <Aviso tipo="ok" titulo="Enlace enviado">
          {`Si ${correo.trim()} tiene una cuenta, en unos minutos recibirás el enlace. Revisa también la carpeta de spam.`}
        </Aviso>
      ) : null}
      {errorGeneral ? <Aviso tipo="alerta" titulo="No se pudo enviar">{errorGeneral}</Aviso> : null}
      <Campo
        etiqueta="Correo de tu cuenta"
        placeholder="nombre.apellido@epn.edu.ec"
        value={correo}
        onChangeText={(texto) => {
          setCorreo(texto);
          setEnviado(false);
        }}
        error={errorCampo}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        textContentType="emailAddress"
        autoComplete="email"
        onSubmitEditing={manejarEnvio}
      />
      {enviado ? (
        <>
          <Boton titulo="Volver a iniciar sesión" onPress={() => router.back()} />
          <Boton variante="secundario" titulo="Enviar otra vez" onPress={manejarEnvio} cargando={enviando} />
        </>
      ) : (
        <Boton titulo="Enviar enlace" onPress={manejarEnvio} cargando={enviando} />
      )}
    </PantallaCuenta>
  );
}
