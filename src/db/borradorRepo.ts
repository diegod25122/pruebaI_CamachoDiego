// R8: el registro a medias se guarda en SQLite en cada cambio.

import { baseLista, db } from '@/db/database';
import type { Medidor, Referencia } from '@/domain/medidor';
import type { DatosCaptura } from '@/domain/reglas';

export type PasoRegistro = 1 | 2 | 3;

export interface Borrador {
  version: 1;
  id: string; // UUID de la nueva lectura (o de la que se corrige)
  editando: boolean; // true = corrección de una lectura pendiente (R10)
  medidorCodigo: string;
  periodo: string;
  medidor: Medidor | null; // copia para mostrar datos aunque no haya señal
  referencia: Referencia | null; // lectura anterior y promedio (R6)
  fotoOriginal: string | null; // foto que tenía la lectura antes de corregirla
  paso: PasoRegistro;
  datos: DatosCaptura;
  iniciadoEn: string;
}

export async function leerBorrador(): Promise<Borrador | null> {
  await baseLista();
  const fila = await db.getFirstAsync<{ datos: string }>('SELECT datos FROM borrador WHERE id = 1');
  if (!fila) return null;
  try {
    const b = JSON.parse(fila.datos) as Borrador;
    return b.version === 1 ? b : null;
  } catch {
    return null;
  }
}

export async function guardarBorrador(b: Borrador): Promise<void> {
  await baseLista();
  await db.runAsync(
    `INSERT INTO borrador (id, datos, actualizado_en) VALUES (1, ?, ?)
     ON CONFLICT(id) DO UPDATE SET datos = excluded.datos, actualizado_en = excluded.actualizado_en`,
    [JSON.stringify(b), new Date().toISOString()],
  );
}

export async function borrarBorrador(): Promise<void> {
  await baseLista();
  await db.runAsync('DELETE FROM borrador WHERE id = 1', []);
}
