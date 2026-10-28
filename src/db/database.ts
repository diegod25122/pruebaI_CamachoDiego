// Base de datos local (expo-sqlite). Guarda las lecturas aunque se cierre la
// app o se reinicie el teléfono (R4, R7, R9, R10) y el registro a medias (R8).

import * as SQLite from 'expo-sqlite';

export const db = SQLite.openDatabaseSync('ruta-lecturas.db');

const ESQUEMA = `
PRAGMA journal_mode = WAL;

CREATE TABLE IF NOT EXISTS lecturas (
  id                   TEXT PRIMARY KEY NOT NULL,
  medidor_codigo       TEXT NOT NULL,
  periodo              TEXT NOT NULL,
  tecnico_codigo       TEXT NOT NULL,
  estado_medidor       TEXT NOT NULL,
  lectura              INTEGER,
  motivo               TEXT,
  descripcion_danio    TEXT,
  lectura_anterior     INTEGER,
  consumo              INTEGER,
  consumo_promedio     REAL,
  anomalo              INTEGER NOT NULL DEFAULT 0,
  anomalia_confirmada  INTEGER NOT NULL DEFAULT 0,
  foto_nombre          TEXT,
  registrada_en        TEXT NOT NULL,
  actualizada_en       TEXT NOT NULL,
  verificacion         TEXT NOT NULL,
  envio                TEXT NOT NULL,
  mensaje              TEXT,
  remote_id            TEXT,
  enviada_en           TEXT,
  intentos             INTEGER NOT NULL DEFAULT 0,
  -- R10: la propia base impide dos lecturas del mismo medidor en el mismo mes.
  UNIQUE (medidor_codigo, periodo)
);

-- R8: un solo registro en curso a la vez.
CREATE TABLE IF NOT EXISTS borrador (
  id             INTEGER PRIMARY KEY CHECK (id = 1),
  datos          TEXT NOT NULL,
  actualizado_en TEXT NOT NULL
);
`;

let migracion: Promise<void> | null = null;

// Todas las funciones de acceso esperan a que el esquema exista.
export function baseLista(): Promise<void> {
  if (!migracion) migracion = db.execAsync(ESQUEMA);
  return migracion;
}
