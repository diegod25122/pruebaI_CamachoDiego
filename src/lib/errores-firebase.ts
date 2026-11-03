/**
 * Traduce los códigos de error de Firebase Auth a mensajes claros en español
 * (lógica del taller). Firebase devuelve "auth/invalid-credential": mostrar eso
 * no sirve; el mensaje debe decir qué pasó y cómo corregirlo.
 */
import { FirebaseError } from 'firebase/app';

const MISMO_MENSAJE = 'El correo o la contraseña no coinciden. Revisa los datos e inténtalo de nuevo.';

export const mensajes: Record<string, string> = {
  // Desde 2023 Firebase protege contra la enumeración de correos: ya no dice
  // si el correo no existe o si la contraseña es incorrecta.
  'auth/invalid-credential': MISMO_MENSAJE,
  'auth/wrong-password': MISMO_MENSAJE,
  'auth/user-not-found': MISMO_MENSAJE,
  'auth/invalid-email': 'El correo no tiene un formato válido. Ejemplo: nombre.apellido@epn.edu.ec',
  'auth/missing-email': 'Escribe tu correo para continuar.',
  'auth/missing-password': 'Escribe tu contraseña para continuar.',
  'auth/email-already-in-use': 'Ya existe una cuenta con ese correo. Inicia sesión o recupera tu contraseña.',
  'auth/weak-password': 'La contraseña es muy débil. Usa al menos 8 caracteres.',
  'auth/password-does-not-meet-requirements':
    'La contraseña no cumple la política del proyecto. Combina mayúsculas, minúsculas y números.',
  'auth/too-many-requests': 'Hubo demasiados intentos seguidos. Espera unos minutos y vuelve a intentarlo.',
  'auth/network-request-failed': 'No hay conexión con Firebase. Revisa tu internet e inténtalo otra vez.',
  'auth/requires-recent-login': 'Por seguridad, cierra sesión, vuelve a ingresar y repite el cambio.',
  'auth/user-disabled': 'Esta cuenta fue deshabilitada. Comunícate con el administrador.',
  'auth/operation-not-allowed': 'El acceso con correo y contraseña no está habilitado en la consola de Firebase.',
  'auth/invalid-api-key': 'La configuración de Firebase no es válida. Revisa el archivo .env.local.',
};

/**
 * @param error Lo que llegó al catch.
 * @param reemplazos Mensajes propios de una pantalla. Ejemplo: al cambiar la
 *   contraseña, invalid-credential significa "la contraseña actual no es correcta".
 */
export function mensajeDeError(error: unknown, reemplazos: Record<string, string> = {}): string {
  if (error instanceof FirebaseError) {
    if (reemplazos[error.code]) return reemplazos[error.code];
    if (mensajes[error.code]) return mensajes[error.code];
    if (error.code.startsWith('auth/api-key-not-valid')) return mensajes['auth/invalid-api-key'];
    return `No se pudo completar la operación (${error.code}).`;
  }
  return 'Ocurrió un error inesperado. Inténtalo de nuevo.';
}
