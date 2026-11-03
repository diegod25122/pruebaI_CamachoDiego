/**
 * Contexto de sesión: el único lugar de la app que habla con Firebase Auth
 * (misma lógica del taller). Las pantallas no importan Firebase: llaman a
 * iniciarSesion, registrarse, cambiarNombre, etc. Si mañana se cambia de
 * proveedor, solo se reescribe este archivo.
 *
 * Agregado en el Deber 5:
 *   - Reto 1: verificación de correo (sendEmailVerification). Solo una cuenta
 *     verificada entra a la app; el layout lo decide con `verificado`.
 *   - Punto 2: cambiarNombre con updateProfile (displayName).
 */
import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  updateProfile,
  type User,
} from 'firebase/auth';
import { createContext, use, useEffect, useState, type ReactNode } from 'react';

import { auth } from '@/config/firebase';

type ValorSesion = {
  /** Usuario conectado, o null si nadie ha iniciado sesión. */
  usuario: User | null;
  /** displayName guardado aparte: updateProfile cambia el mismo objeto `user`
   *  y React no detectaría el cambio si se leyera usuario.displayName. */
  nombre: string | null;
  /** Reto 1: true solo si el correo de la cuenta ya fue verificado. */
  verificado: boolean;
  /** true mientras Firebase revisa si hay una sesión guardada. */
  cargando: boolean;
  iniciarSesion: (correo: string, clave: string) => Promise<void>;
  registrarse: (nombre: string, correo: string, clave: string) => Promise<void>;
  enviarCorreoRecuperacion: (correo: string) => Promise<void>;
  reenviarVerificacion: () => Promise<void>;
  comprobarVerificacion: () => Promise<boolean>;
  cambiarClave: (claveActual: string, claveNueva: string) => Promise<void>;
  cambiarNombre: (nombreNuevo: string) => Promise<void>;
  cerrarSesion: () => Promise<void>;
};

const ContextoSesion = createContext<ValorSesion | null>(null);

/** Hook para leer la sesión desde cualquier pantalla. */
export function useSesion(): ValorSesion {
  // `use` es la forma de React 19 de leer un contexto (equivale a useContext).
  const valor = use(ContextoSesion);
  if (!valor) throw new Error('useSesion debe usarse dentro de <ProveedorSesion>.');
  return valor;
}

export function ProveedorSesion({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<User | null>(null);
  const [nombre, setNombre] = useState<string | null>(null);
  const [verificado, setVerificado] = useState(false);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    // onAuthStateChanged se dispara al arrancar (con la sesión guardada o null)
    // y cada vez que alguien entra o sale. Es la fuente de verdad: la
    // navegación (Stack.Protected en _layout.tsx) depende de este estado.
    const cancelar = onAuthStateChanged(auth, (usuarioFirebase) => {
      setUsuario(usuarioFirebase);
      setNombre(usuarioFirebase?.displayName ?? null);
      setVerificado(usuarioFirebase?.emailVerified ?? false);
      setCargando(false);
    });
    return cancelar;
  }, []);

  async function iniciarSesion(correo: string, clave: string) {
    await signInWithEmailAndPassword(auth, correo.trim(), clave);
    // No navegamos: onAuthStateChanged actualiza el estado y el layout
    // muestra la app (o la pantalla de verificación si falta verificar).
  }

  async function registrarse(nombreCompleto: string, correo: string, clave: string) {
    // Crear la cuenta también inicia la sesión.
    const credencial = await createUserWithEmailAndPassword(auth, correo.trim(), clave);
    const nombreLimpio = nombreCompleto.trim();
    await updateProfile(credencial.user, { displayName: nombreLimpio });
    setNombre(nombreLimpio);
    // Reto 1: enviamos el correo de verificación. Hasta que el técnico abra
    // el enlace, `verificado` es false y solo ve la pantalla de verificación.
    await sendEmailVerification(credencial.user);
  }

  async function enviarCorreoRecuperacion(correo: string) {
    // Por la protección contra enumeración, NO falla si el correo no existe.
    await sendPasswordResetEmail(auth, correo.trim());
  }

  async function reenviarVerificacion() {
    const actual = auth.currentUser;
    if (!actual) throw new Error('No hay una sesión activa.');
    await sendEmailVerification(actual);
  }

  async function comprobarVerificacion() {
    const actual = auth.currentUser;
    if (!actual) return false;
    // emailVerified no se actualiza solo: reload() vuelve a pedir el usuario a Firebase.
    await actual.reload();
    const estaVerificado = auth.currentUser?.emailVerified ?? false;
    setVerificado(estaVerificado);
    return estaVerificado;
  }

  async function cambiarClave(claveActual: string, claveNueva: string) {
    const actual = auth.currentUser;
    if (!actual?.email) throw new Error('No hay una sesión activa.');
    // updatePassword es sensible: Firebase pide un ingreso reciente
    // (auth/requires-recent-login). Por eso reautenticamos con la clave actual.
    const credencial = EmailAuthProvider.credential(actual.email, claveActual);
    await reauthenticateWithCredential(actual, credencial);
    await updatePassword(actual, claveNueva);
  }

  async function cambiarNombre(nombreNuevo: string) {
    const actual = auth.currentUser;
    if (!actual) throw new Error('No hay una sesión activa.');
    const limpio = nombreNuevo.trim();
    // Deber 5 · punto 2: updateProfile cambia el displayName en Firebase.
    await updateProfile(actual, { displayName: limpio });
    // El objeto `user` es el mismo, así que avisamos a React con el estado.
    setNombre(limpio);
  }

  async function cerrarSesion() {
    await signOut(auth);
  }

  return (
    <ContextoSesion
      value={{
        usuario,
        nombre,
        verificado,
        cargando,
        iniciarSesion,
        registrarse,
        enviarCorreoRecuperacion,
        reenviarVerificacion,
        comprobarVerificacion,
        cambiarClave,
        cambiarNombre,
        cerrarSesion,
      }}>
      {children}
    </ContextoSesion>
  );
}
