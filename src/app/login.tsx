/**
 * Inicio de sesión con Firebase (lógica del taller).
 * Reto 2: si el ingreso falla, la hoja se sacude (useSacudida).
 */
import { router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { useSacudida } from '@/animaciones/useSacudida';
import { Aviso } from '@/components/Aviso';
import { Boton } from '@/components/Boton';
import { Campo } from '@/components/Campo';
import { PantallaCuenta } from '@/components/PantallaCuenta';
import { tx } from '@/constants/clases';
import { mensajeDeError } from '@/lib/errores-firebase';
import { validarCorreo } from '@/lib/validaciones';
import { useSesion } from '@/state/sesion';

export default function PantallaLogin() {
  const { iniciarSesion } = useSesion();
  const { estilo, sacudir } = useSacudida();
  const [correo, setCorreo] = useState('');
  const [clave, setClave] = useState('');
  const [errores, setErrores] = useState<{ correo?: string | null; clave?: string | null }>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function manejarIngreso() {
    // 1. Validamos en el teléfono antes de llamar a Firebase.
    const nuevosErrores = { correo: validarCorreo(correo), clave: clave ? null : 'Escribe tu contraseña.' };
    setErrores(nuevosErrores);
    setErrorGeneral(null);
    if (nuevosErrores.correo || nuevosErrores.clave) {
      sacudir();
      return;
    }
    // 2. Llamamos a Firebase. Si funciona, el layout cambia de pantalla solo.
    setEnviando(true);
    try {
      await iniciarSesion(correo, clave);
    } catch (error) {
      setErrorGeneral(mensajeDeError(error));
      sacudir();
      // Sin finally: si el ingreso funciona, esta pantalla se desmonta.
      setEnviando(false);
    }
  }

  return (
    <PantallaCuenta
      titulo={'Ruta de\nLecturas'}
      bajada="Ingresa con el correo y la contraseña de tu cuenta."
      estiloHoja={estilo}
      pie={
        <View className="items-center mt-2 px-6">
          <Text className="text-tenue text-[15px] text-center">¿Aún no tienes cuenta?</Text>
          <Boton variante="texto" titulo="Crear una cuenta" onPress={() => router.push('/crear-cuenta')} />
        </View>
      }>
      <Text className={tx.subtitulo}>Iniciar jornada</Text>
      {errorGeneral ? <Aviso tipo="alerta" titulo="No se pudo ingresar">{errorGeneral}</Aviso> : null}
      <Campo
        etiqueta="Correo"
        placeholder="nombre.apellido@epn.edu.ec"
        value={correo}
        onChangeText={(t) => {
          setCorreo(t);
          setErrores((e) => ({ ...e, correo: null }));
        }}
        error={errores.correo}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        textContentType="emailAddress"
        autoComplete="email"
        returnKeyType="next"
      />
      <Campo
        etiqueta="Contraseña"
        placeholder="••••••••"
        value={clave}
        onChangeText={(t) => {
          setClave(t);
          setErrores((e) => ({ ...e, clave: null }));
        }}
        error={errores.clave}
        esClave
        textContentType="password"
        autoComplete="current-password"
        returnKeyType="go"
        onSubmitEditing={manejarIngreso}
      />
      <View className="items-end">
        <Boton
          variante="texto"
          titulo="¿Olvidaste tu contraseña?"
          // Pasamos el correo escrito para no obligar a escribirlo otra vez.
          onPress={() => router.push({ pathname: '/recuperar', params: { correo } })}
        />
      </View>
      <Boton titulo="Iniciar sesión" onPress={manejarIngreso} cargando={enviando} />
    </PantallaCuenta>
  );
}
