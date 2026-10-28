import { baseLista, db } from '@/db/database';
import type { EstadoEnvio, EstadoMedidor, LecturaLocal, Verificacion } from '@/domain/lectura';

interface Fila {
  id: string;
  medidor_codigo: string;
  periodo: string;
  tecnico_codigo: string;
  estado_medidor: string;
  lectura: number | null;
  motivo: string | null;
  descripcion_danio: string | null;
  lectura_anterior: number | null;
  consumo: number | null;
  consumo_promedio: number | null;
  anomalo: number;
  anomalia_confirmada: number;
  foto_nombre: string | null;
  registrada_en: string;
  actualizada_en: string;
  verificacion: string;
  envio: string;
  mensaje: string | null;
  remote_id: string | null;
  enviada_en: string | null;
  intentos: number;
}

function desdeFila(f: Fila): LecturaLocal {
  return {
    id: f.id,
    medidorCodigo: f.medidor_codigo,
    periodo: f.periodo,
    tecnicoCodigo: f.tecnico_codigo,
    estadoMedidor: f.estado_medidor as EstadoMedidor,
    lectura: f.lectura,
    motivo: f.motivo,
    descripcionDanio: f.descripcion_danio,
    lecturaAnterior: f.lectura_anterior,
    consumo: f.consumo,
    consumoPromedio: f.consumo_promedio,
    anomalo: f.anomalo === 1,
    anomaliaConfirmada: f.anomalia_confirmada === 1,
    fotoNombre: f.foto_nombre,
    registradaEn: f.registrada_en,
    actualizadaEn: f.actualizada_en,
    verificacion: f.verificacion as Verificacion,
    envio: f.envio as EstadoEnvio,
    mensaje: f.mensaje,
    remoteId: f.remote_id,
    enviadaEn: f.enviada_en,
    intentos: f.intentos,
  };
}

export class ErrorLecturaDuplicada extends Error {
  constructor(public readonly existente: LecturaLocal) {
    super(`Ya registraste el medidor ${existente.medidorCodigo} en este mes.`);
    this.name = 'ErrorLecturaDuplicada';
  }
}

export class ErrorNoEditable extends Error {
  constructor() {
    super('Esta lectura ya fue enviada a la oficina y no se puede corregir.');
    this.name = 'ErrorNoEditable';
  }
}

export async function listarLecturas(): Promise<LecturaLocal[]> {
  await baseLista();
  const filas = await db.getAllAsync<Fila>('SELECT * FROM lecturas ORDER BY registrada_en DESC');
  return filas.map(desdeFila);
}

export async function obtenerLectura(id: string): Promise<LecturaLocal | null> {
  await baseLista();
  const fila = await db.getFirstAsync<Fila>('SELECT * FROM lecturas WHERE id = ?', [id]);
  return fila ? desdeFila(fila) : null;
}

export async function lecturaDelPeriodo(medidorCodigo: string, periodo: string): Promise<LecturaLocal | null> {
  await baseLista();
  const fila = await db.getFirstAsync<Fila>(
    'SELECT * FROM lecturas WHERE medidor_codigo = ? AND periodo = ?',
    [medidorCodigo, periodo],
  );
  return fila ? desdeFila(fila) : null;
}

// Las que el sincronizador debe intentar enviar. "enviando" se incluye porque
// significa que la app se cerró a mitad de un envío.
export async function lecturasPorEnviar(): Promise<LecturaLocal[]> {
  await baseLista();
  const filas = await db.getAllAsync<Fila>(
    "SELECT * FROM lecturas WHERE envio IN ('pendiente', 'enviando') ORDER BY registrada_en ASC",
  );
  return filas.map(desdeFila);
}

export async function insertarLectura(l: LecturaLocal): Promise<void> {
  await baseLista();
  const existente = await lecturaDelPeriodo(l.medidorCodigo, l.periodo);
  if (existente) throw new ErrorLecturaDuplicada(existente);
  await db.runAsync(
    `INSERT INTO lecturas (
      id, medidor_codigo, periodo, tecnico_codigo, estado_medidor, lectura, motivo,
      descripcion_danio, lectura_anterior, consumo, consumo_promedio, anomalo,
      anomalia_confirmada, foto_nombre, registrada_en, actualizada_en, verificacion,
      envio, mensaje, remote_id, enviada_en, intentos
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      l.id, l.medidorCodigo, l.periodo, l.tecnicoCodigo, l.estadoMedidor, l.lectura, l.motivo,
      l.descripcionDanio, l.lecturaAnterior, l.consumo, l.consumoPromedio, l.anomalo ? 1 : 0,
      l.anomaliaConfirmada ? 1 : 0, l.fotoNombre, l.registradaEn, l.actualizadaEn, l.verificacion,
      l.envio, l.mensaje, l.remoteId, l.enviadaEn, l.intentos,
    ],
  );
}

// R10: el WHERE garantiza que una lectura enviada (o en envío) no cambia,
// aunque la pantalla estuviera desactualizada.
export async function corregirLectura(l: LecturaLocal): Promise<void> {
  await baseLista();
  const resultado = await db.runAsync(
    `UPDATE lecturas SET
      estado_medidor = ?, lectura = ?, motivo = ?, descripcion_danio = ?, lectura_anterior = ?,
      consumo = ?, consumo_promedio = ?, anomalo = ?, anomalia_confirmada = ?, foto_nombre = ?,
      actualizada_en = ?, verificacion = 'pendiente', envio = 'pendiente', mensaje = NULL
     WHERE id = ? AND envio IN ('pendiente', 'revision')`,
    [
      l.estadoMedidor, l.lectura, l.motivo, l.descripcionDanio, l.lecturaAnterior,
      l.consumo, l.consumoPromedio, l.anomalo ? 1 : 0, l.anomaliaConfirmada ? 1 : 0, l.fotoNombre,
      l.actualizadaEn, l.id,
    ],
  );
  if (resultado.changes !== 1) throw new ErrorNoEditable();
}

// Cambios que hace el sincronizador.
export interface CambioEnvio {
  envio: EstadoEnvio;
  verificacion?: Verificacion;
  mensaje?: string | null;
  remoteId?: string | null;
  enviadaEn?: string | null;
  lecturaAnterior?: number | null;
  consumo?: number | null;
  consumoPromedio?: number | null;
  anomalo?: boolean;
  sumarIntento?: boolean;
}

export async function actualizarEnvio(id: string, c: CambioEnvio): Promise<void> {
  await baseLista();
  const sets: string[] = ['envio = ?'];
  const valores: (string | number | null)[] = [c.envio];
  const poner = (columna: string, valor: string | number | null | undefined) => {
    if (valor === undefined) return;
    sets.push(`${columna} = ?`);
    valores.push(valor);
  };
  poner('verificacion', c.verificacion);
  poner('mensaje', c.mensaje);
  poner('remote_id', c.remoteId);
  poner('enviada_en', c.enviadaEn);
  poner('lectura_anterior', c.lecturaAnterior);
  poner('consumo', c.consumo);
  poner('consumo_promedio', c.consumoPromedio);
  poner('anomalo', c.anomalo === undefined ? undefined : c.anomalo ? 1 : 0);
  if (c.sumarIntento) sets.push('intentos = intentos + 1');
  valores.push(id);
  await db.runAsync(`UPDATE lecturas SET ${sets.join(', ')} WHERE id = ?`, valores);
}
