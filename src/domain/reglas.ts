// Reglas de negocio puras (R5, R6, R7). Sin React ni red: se prueban con Jest
// y las usan tanto el formulario como el sincronizador.

import { FACTOR_ANOMALIA } from '@/config';
import type { EstadoMedidor, LecturaLocal } from '@/domain/lectura';
import type { Referencia } from '@/domain/medidor';

export const LECTURA_MAXIMA = 99_999_999;
const MINIMO_TEXTO = 3;

// Lo que el técnico va llenando en las pantallas de registro.
export interface DatosCaptura {
  estadoMedidor: EstadoMedidor | null;
  lecturaTexto: string;
  motivo: string;
  descripcionDanio: string;
  anomaliaConfirmada: boolean;
  fotoNombre: string | null;
}

export const CAPTURA_VACIA: DatosCaptura = {
  estadoMedidor: null,
  lecturaTexto: '',
  motivo: '',
  descripcionDanio: '',
  anomaliaConfirmada: false,
  fotoNombre: null,
};

export type CampoCaptura = 'estado' | 'lectura' | 'motivo' | 'descripcion' | 'confirmacion' | 'foto';
export type Errores = Partial<Record<CampoCaptura, string>>;

export interface Evaluacion {
  lectura: number | null;
  consumo: number | null;
  anomalo: boolean;
  veces: number | null; // consumo / promedio, para mostrarlo
  fotoObligatoria: boolean;
  errores: Errores;
}

// Lectura en m³ enteros, como la cobra la empresa.
export function parseLectura(texto: string): number | null | 'invalida' {
  const limpio = texto.trim();
  if (limpio === '') return null;
  if (!/^\d+$/.test(limpio)) return 'invalida';
  const n = Number(limpio);
  return n <= LECTURA_MAXIMA ? n : 'invalida';
}

export function calcularConsumo(lectura: number, anterior: number): number {
  return lectura - anterior;
}

// R6: "supera el triple" quiere decir estrictamente mayor que 3 × promedio.
export function esConsumoAnomalo(consumo: number, promedio: number): boolean {
  return consumo > FACTOR_ANOMALIA * promedio;
}

export function evaluarCaptura(datos: DatosCaptura, referencia: Referencia | null): Evaluacion {
  const errores: Errores = {};
  const estado = datos.estadoMedidor;
  let lectura: number | null = null;

  if (estado === null) {
    errores.estado = 'Elige el estado del medidor.';
  }

  // R5: reglas de los tres estados.
  if (estado === 'normal' || estado === 'danado') {
    const valor = parseLectura(datos.lecturaTexto);
    if (valor === 'invalida') {
      errores.lectura = 'Escribe solo números enteros (m³).';
    } else if (valor === null) {
      if (estado === 'normal') errores.lectura = 'Con el medidor normal, la lectura es obligatoria.';
    } else {
      lectura = valor;
      if (referencia && valor < referencia.lecturaAnterior) {
        errores.lectura = `No puede ser menor que la lectura anterior (${referencia.lecturaAnterior} m³).`;
      }
    }
  }

  if (estado === 'inaccesible') {
    if (datos.lecturaTexto.trim() !== '') errores.lectura = 'Si el medidor está inaccesible no se registra lectura.';
    if (datos.motivo.trim().length < MINIMO_TEXTO) errores.motivo = 'Indica por qué no pudiste acceder al medidor.';
  }

  if (estado === 'danado' && datos.descripcionDanio.trim().length < MINIMO_TEXTO) {
    errores.descripcion = 'Describe el daño del medidor.';
  }

  // R6: consumo del mes y anomalía.
  let consumo: number | null = null;
  let veces: number | null = null;
  let anomalo = false;
  if (lectura !== null && referencia && errores.lectura === undefined) {
    consumo = calcularConsumo(lectura, referencia.lecturaAnterior);
    anomalo = esConsumoAnomalo(consumo, referencia.consumoPromedio);
    veces = referencia.consumoPromedio > 0 ? consumo / referencia.consumoPromedio : null;
    if (anomalo && !datos.anomaliaConfirmada) {
      errores.confirmacion = 'Confirma que revisaste el medidor: el consumo supera el triple del promedio.';
    }
  }

  // R7: foto obligatoria si el consumo es anómalo o el medidor está dañado.
  const fotoObligatoria = estado === 'danado' || anomalo;
  if (fotoObligatoria && !datos.fotoNombre) {
    errores.foto = anomalo
      ? 'El consumo es anómalo: la foto del medidor es obligatoria.'
      : 'El medidor está dañado: la foto es obligatoria.';
  }

  return { lectura, consumo, anomalo, veces, fotoObligatoria, errores };
}

// Qué campos se revisan en cada pantalla del registro (R8).
export const CAMPOS_PASO_1: CampoCaptura[] = ['estado', 'lectura', 'motivo', 'descripcion'];
export const CAMPOS_PASO_2: CampoCaptura[] = ['confirmacion', 'foto'];

export function erroresDe(errores: Errores, campos: CampoCaptura[]): Errores {
  const filtrados: Errores = {};
  for (const campo of campos) {
    if (errores[campo]) filtrados[campo] = errores[campo];
  }
  return filtrados;
}

export function hayErrores(errores: Errores): boolean {
  return Object.keys(errores).length > 0;
}

// Para volver a evaluar una lectura guardada (corrección o sincronización).
export function datosDesdeLectura(l: LecturaLocal): DatosCaptura {
  return {
    estadoMedidor: l.estadoMedidor,
    lecturaTexto: l.lectura === null ? '' : String(l.lectura),
    motivo: l.motivo ?? '',
    descripcionDanio: l.descripcionDanio ?? '',
    anomaliaConfirmada: l.anomaliaConfirmada,
    fotoNombre: l.fotoNombre,
  };
}

export function referenciaDeLectura(l: LecturaLocal): Referencia | null {
  if (l.lecturaAnterior === null || l.consumoPromedio === null) return null;
  return { lecturaAnterior: l.lecturaAnterior, consumoPromedio: l.consumoPromedio };
}
