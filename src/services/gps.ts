// Taller 7: ubicación actual del técnico con expo-location.
// Funciona en Android, iOS y web (en web usa navigator.geolocation).
//
// Pasos:
//  1. Pedir el permiso de ubicación.
//  2. Si la ubicación del teléfono está apagada, en Android se muestra el
//     diálogo del sistema para activarla ahí mismo (un toque en "Activar").
//  3. Pedir la posición con precisión "Balanced" (GPS + Wi-Fi + red), que
//     responde rápido incluso bajo techo, con un límite de tiempo.
//  4. Si no responde a tiempo, se usa la última ubicación conocida.

import * as Location from 'expo-location';
import { Platform } from 'react-native';

import type { Ubicacion } from '@/domain/ubicacion';

export type ResultadoGps =
  | { tipo: 'ok'; ubicacion: Ubicacion }
  | { tipo: 'sinPermiso'; puedePreguntar: boolean }
  | { tipo: 'apagado' } // la ubicación del teléfono sigue desactivada
  | { tipo: 'error'; mensaje: string };

const LIMITE_MS = 15_000;
const ANTIGUEDAD_MAXIMA_MS = 5 * 60_000; // última ubicación conocida: máx. 5 min

function conLimite<T>(promesa: Promise<T>, ms: number): Promise<T | null> {
  return new Promise((resolve, reject) => {
    const id = setTimeout(() => resolve(null), ms);
    promesa.then(
      (v) => {
        clearTimeout(id);
        resolve(v);
      },
      (e) => {
        clearTimeout(id);
        reject(e);
      },
    );
  });
}

function aUbicacion(pos: Location.LocationObject): Ubicacion {
  return {
    latitud: pos.coords.latitude,
    longitud: pos.coords.longitude,
    precision: pos.coords.accuracy ?? null,
    origen: 'gps',
  };
}

async function ultimaConocida(): Promise<Ubicacion | null> {
  try {
    const pos = await Location.getLastKnownPositionAsync({ maxAge: ANTIGUEDAD_MAXIMA_MS });
    return pos ? aUbicacion(pos) : null;
  } catch {
    return null;
  }
}

// Si la ubicación está apagada, intenta encenderla con el diálogo del sistema.
async function asegurarServicioActivo(): Promise<boolean> {
  if (await Location.hasServicesEnabledAsync()) return true;
  if (Platform.OS !== 'android') return false;
  try {
    await Location.enableNetworkProviderAsync(); // muestra "Activar ubicación"
  } catch {
    return false; // el técnico tocó "No, gracias"
  }
  return Location.hasServicesEnabledAsync();
}

function mensajeDeError(error: unknown): string {
  const texto = error instanceof Error ? error.message : String(error);
  if (Platform.OS === 'web' && /secure|https/i.test(texto)) {
    return 'El navegador solo da la ubicación en páginas https o en localhost.';
  }
  if (/unsatisfied device settings/i.test(texto)) {
    return 'La ubicación del teléfono no está activada.';
  }
  return 'No se pudo obtener la posición.';
}

export async function ubicacionActual(): Promise<ResultadoGps> {
  try {
    const permiso = await Location.requestForegroundPermissionsAsync();
    if (permiso.status !== 'granted') return { tipo: 'sinPermiso', puedePreguntar: permiso.canAskAgain };

    if (!(await asegurarServicioActivo())) return { tipo: 'apagado' };

    const pos = await conLimite(
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
      LIMITE_MS,
    );
    if (pos) return { tipo: 'ok', ubicacion: aUbicacion(pos) };

    // Sin respuesta a tiempo (bajo techo, sin cielo despejado...).
    const ultima = await ultimaConocida();
    if (ultima) return { tipo: 'ok', ubicacion: ultima };
    return { tipo: 'error', mensaje: 'El GPS tardó demasiado en responder.' };
  } catch (error) {
    // Si falló, todavía puede servir la última ubicación conocida.
    const ultima = await ultimaConocida();
    if (ultima) return { tipo: 'ok', ubicacion: ultima };
    return { tipo: 'error', mensaje: mensajeDeError(error) };
  }
}
