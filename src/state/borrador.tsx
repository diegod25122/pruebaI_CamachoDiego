// R8: registro en varias pantallas que sobrevive al cierre de la app.
// Cada cambio se escribe en SQLite al instante (en orden, uno tras otro).

import * as Crypto from 'expo-crypto';
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

import {
  borrarBorrador,
  guardarBorrador,
  leerBorrador,
  type Borrador,
  type PasoRegistro,
} from '@/db/borradorRepo';
import { periodoDe, type LecturaLocal } from '@/domain/lectura';
import type { Medidor, Referencia } from '@/domain/medidor';
import { CAPTURA_VACIA, datosDesdeLectura, referenciaDeLectura, type DatosCaptura } from '@/domain/reglas';
import { borrarFoto } from '@/services/fotos';

interface BorradorCtx {
  borrador: Borrador | null;
  cargado: boolean;
  iniciarNueva: (codigo: string, medidor: Medidor | null, referencia: Referencia | null) => Promise<void>;
  iniciarCorreccion: (lectura: LecturaLocal, medidor: Medidor | null) => Promise<void>;
  cambiarDatos: (cambios: Partial<DatosCaptura>) => void;
  irAPaso: (paso: PasoRegistro) => void;
  descartar: () => Promise<void>;
  terminar: () => Promise<void>;
}

const Contexto = createContext<BorradorCtx | null>(null);

export function BorradorProvider({ children }: { children: ReactNode }) {
  const [borrador, setBorrador] = useState<Borrador | null>(null);
  const [cargado, setCargado] = useState(false);
  const actual = useRef<Borrador | null>(null);
  const cola = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    leerBorrador()
      .then((b) => {
        actual.current = b;
        setBorrador(b);
      })
      .catch(() => undefined)
      .finally(() => setCargado(true));
  }, []);

  // Escribe en orden: el último cambio siempre es el que queda guardado.
  const persistir = useCallback((b: Borrador | null) => {
    actual.current = b;
    setBorrador(b);
    cola.current = cola.current
      .then(() => (b ? guardarBorrador(b) : borrarBorrador()))
      .catch(() => undefined);
    return cola.current;
  }, []);

  const iniciarNueva = useCallback(
    (codigo: string, medidor: Medidor | null, referencia: Referencia | null) =>
      persistir({
        version: 1,
        id: Crypto.randomUUID(),
        editando: false,
        medidorCodigo: codigo,
        periodo: periodoDe(new Date()),
        medidor,
        referencia,
        fotoOriginal: null,
        paso: 1,
        datos: CAPTURA_VACIA,
        iniciadoEn: new Date().toISOString(),
      }),
    [persistir],
  );

  const iniciarCorreccion = useCallback(
    (lectura: LecturaLocal, medidor: Medidor | null) =>
      persistir({
        version: 1,
        id: lectura.id,
        editando: true,
        medidorCodigo: lectura.medidorCodigo,
        periodo: lectura.periodo,
        medidor,
        referencia: referenciaDeLectura(lectura),
        fotoOriginal: lectura.fotoNombre,
        paso: 1,
        datos: datosDesdeLectura(lectura),
        iniciadoEn: new Date().toISOString(),
      }),
    [persistir],
  );

  const cambiarDatos = useCallback(
    (cambios: Partial<DatosCaptura>) => {
      const b = actual.current;
      if (!b) return;
      void persistir({ ...b, datos: { ...b.datos, ...cambios } });
    },
    [persistir],
  );

  const irAPaso = useCallback(
    (paso: PasoRegistro) => {
      const b = actual.current;
      if (!b) return;
      void persistir({ ...b, paso });
    },
    [persistir],
  );

  // Descartar: se borra la foto nueva, pero nunca la que ya tenía la lectura.
  const descartar = useCallback(async () => {
    const b = actual.current;
    if (b && b.datos.fotoNombre && b.datos.fotoNombre !== b.fotoOriginal) borrarFoto(b.datos.fotoNombre);
    await persistir(null);
  }, [persistir]);

  // Terminar: la lectura ya se guardó; si la foto cambió, se borra la vieja.
  const terminar = useCallback(async () => {
    const b = actual.current;
    if (b && b.fotoOriginal && b.fotoOriginal !== b.datos.fotoNombre) borrarFoto(b.fotoOriginal);
    await persistir(null);
  }, [persistir]);

  return (
    <Contexto.Provider
      value={{ borrador, cargado, iniciarNueva, iniciarCorreccion, cambiarDatos, irAPaso, descartar, terminar }}>
      {children}
    </Contexto.Provider>
  );
}

export function useBorrador(): BorradorCtx {
  const ctx = useContext(Contexto);
  if (!ctx) throw new Error('useBorrador debe usarse dentro de BorradorProvider');
  return ctx;
}

export const RUTA_PASO = {
  1: '/registro/estado',
  2: '/registro/foto',
  3: '/registro/resumen',
} as const;
