/**
 * Reto 1 del taller: verificación de correo.
 *
 * Esta pantalla es la única que existe cuando hay sesión pero el correo aún no
 * está verificado (Stack.Protected en _layout.tsx). Solo al confirmar la
 * verificación se pasa a la app.
 *
 * Firebase no avisa cuando el usuario abre el enlace: hay que preguntarle con
 * user.reload(). Lo hacemos al tocar el botón y también al volver a la app
 * (el técnico suele salir al correo y regresar).
 */
import { useEffect, useState } from 'react';
import { AppState, Text } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';

import { Aviso } from '@/components/Aviso';
import { Boton } from '@/components/Boton';
import { PantallaCuenta } from '@/components/PantallaCuenta';
import { tx } from '@/constants/clases';
import { mensajeDeError } from '@/lib/errores-firebase';
import { useSesion } from '@/state/sesion';

const ESPERA_REENVIO = 60; // segundos, para no disparar auth/too-many-requests

export default function PantallaVerificarCorreo() {
  const { usuario, comprobarVerificacion, reenviarVerificacion, cerrarSesion } = useSesion();
  const [comprobando, setComprobando] = useState(false);
  const [aviso, setAviso] = useState<{ tipo: 'ok' | 'alerta' | 'pendiente'; texto: string } | null>(null);
  const [espera, setEspera] = useState(ESPERA_REENVIO);

  // Cuenta regresiva para habilitar "Reenviar correo".
  useEffect(() => {
    if (espera <= 0) return;
    const id = setTimeout(() => setEspera((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [espera]);

  // Al volver a la app desde el correo, revisamos solos si ya verificó.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (estado) => {
      if (estado === 'active') void comprobarVerificacion().catch(() => undefined);
    });
    return () => sub.remove();
  }, [comprobarVerificacion]);

  async function comprobar() {
    setComprobando(true);
    setAviso(null);
    try {
      const ok = await comprobarVerificacion();
      // Si ok es true, el layout cambia a la app y esta pantalla desaparece.
      if (!ok) {
        setAviso({ tipo: 'pendiente', texto: 'Tu correo aún no aparece verificado. Abre el enlace del correo y vuelve a intentar.' });
      }
    } catch (error) {
      setAviso({ tipo: 'alerta', texto: mensajeDeError(error) });
    } finally {
      setComprobando(false);
    }
  }

  async function reenviar() {
    setAviso(null);
    try {
      await reenviarVerificacion();
      setEspera(ESPERA_REENVIO);
      setAviso({ tipo: 'ok', texto: 'Te enviamos un correo nuevo. Revisa también la carpeta de spam.' });
    } catch (error) {
      setAviso({ tipo: 'alerta', texto: mensajeDeError(error) });
    }
  }

  return (
    <PantallaCuenta titulo={'Verifica\ntu correo'} bajada="Es el último paso para entrar a la app.">
      <Animated.View
        entering={ZoomIn.springify().damping(12)}
        className="self-center w-20 h-20 rounded-full bg-chaleco border-2 border-noche items-center justify-center">
        <Text className="text-[38px]">✉</Text>
      </Animated.View>
      <Text className={`${tx.cuerpo} text-center`}>
        Te enviamos un enlace a{'\n'}
        <Text className="font-black">{usuario?.email}</Text>
        {'\n'}Ábrelo y luego vuelve aquí.
      </Text>
      {aviso ? (
        <Aviso tipo={aviso.tipo} titulo={aviso.tipo === 'ok' ? 'Correo enviado' : aviso.tipo === 'alerta' ? 'Hubo un problema' : 'Todavía no'}>
          {aviso.texto}
        </Aviso>
      ) : null}
      <Boton titulo="Ya verifiqué mi correo" onPress={() => void comprobar()} cargando={comprobando} />
      <Boton
        variante="secundario"
        titulo={espera > 0 ? `Reenviar correo (${espera} s)` : 'Reenviar correo'}
        deshabilitado={espera > 0}
        onPress={() => void reenviar()}
      />
      <Boton variante="texto" titulo="Usar otra cuenta" onPress={() => void cerrarSesion()} />
    </PantallaCuenta>
  );
}
