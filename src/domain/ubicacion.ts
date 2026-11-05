// Taller 7: dónde se tomó la lectura del medidor.
//  gps: la dio el GPS del teléfono (automática, por defecto).
//  manual: el técnico movió el marcador en el mapa.

export type OrigenUbicacion = 'gps' | 'manual';

export interface Ubicacion {
  latitud: number;
  longitud: number;
  precision: number | null; // metros (solo GPS)
  origen: OrigenUbicacion;
}

// Centro por defecto del mapa si todavía no hay ubicación (Quito).
export const CENTRO_POR_DEFECTO = { latitud: -0.2105, longitud: -78.4895 };

export function ubicacionValida(u: Ubicacion | null | undefined): u is Ubicacion {
  return (
    !!u &&
    Number.isFinite(u.latitud) &&
    Number.isFinite(u.longitud) &&
    Math.abs(u.latitud) <= 90 &&
    Math.abs(u.longitud) <= 180
  );
}

export function textoCoordenadas(u: Ubicacion): string {
  return `${u.latitud.toFixed(6)}, ${u.longitud.toFixed(6)}`;
}

export function textoOrigen(u: Ubicacion): string {
  if (u.origen === 'manual') return 'Marcada a mano en el mapa';
  return u.precision !== null ? `GPS · precisión ±${Math.round(u.precision)} m` : 'GPS';
}
