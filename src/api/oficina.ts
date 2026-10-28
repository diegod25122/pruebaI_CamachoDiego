// Sistema de la oficina simulado con MockAPI: recursos "medidores" y "lecturas".

import { ErrorHttp, pedirJson } from '@/api/http';
import { isMockApiConfigured, MOCKAPI_BASE_URL, RECURSO_LECTURAS, RECURSO_MEDIDORES } from '@/config';
import type { LecturaLocal } from '@/domain/lectura';
import { CODIGO_MEDIDOR, parseMedidor, type Medidor } from '@/domain/medidor';

const BASE = MOCKAPI_BASE_URL.replace(/\/+$/, '');

export class ErrorConfiguracion extends Error {
  constructor() {
    super('Falta configurar la URL de MockAPI en src/config.ts');
    this.name = 'ErrorConfiguracion';
  }
}

function url(recurso: string, filtros?: Record<string, string>): string {
  if (!isMockApiConfigured) throw new ErrorConfiguracion();
  const query = filtros
    ? `?${Object.entries(filtros)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join('&')}`
    : '';
  return `${BASE}/${recurso}${query}`;
}

// MockAPI responde 404 "Not found" cuando un filtro no encuentra nada.
async function listarFiltrado(recurso: string, filtros: Record<string, string>): Promise<unknown[]> {
  try {
    const datos = await pedirJson<unknown>(url(recurso, filtros));
    return Array.isArray(datos) ? datos : [];
  } catch (error) {
    if (error instanceof ErrorHttp && error.status === 404) return [];
    throw error;
  }
}

// R2: esta función nunca recibe un código incompleto.
export async function buscarMedidor(codigo: string): Promise<Medidor | null> {
  if (!CODIGO_MEDIDOR.test(codigo)) throw new Error('Código de medidor inválido');
  const filas = await listarFiltrado(RECURSO_MEDIDORES, { codigo });
  // El filtro de MockAPI busca "contiene": se exige coincidencia exacta.
  const medidores = filas.map(parseMedidor).filter((m): m is Medidor => m !== null);
  return medidores.find((m) => m.codigo === codigo) ?? null;
}

export interface LecturaRemota {
  id: string;
  clientId: string;
  medidorCodigo: string;
  periodo: string;
  tecnicoCodigo: string;
  registradaEn: string;
}

function parseLecturaRemota(raw: unknown): LecturaRemota | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const r = raw as Record<string, unknown>;
  return {
    id: String(r.id ?? ''),
    clientId: String(r.clientId ?? ''),
    medidorCodigo: String(r.medidorCodigo ?? ''),
    periodo: String(r.periodo ?? ''),
    tecnicoCodigo: String(r.tecnicoCodigo ?? ''),
    registradaEn: String(r.registradaEn ?? ''),
  };
}

// R10: lecturas que la oficina ya tiene de ese medidor en ese mes.
export async function lecturasDelPeriodo(medidorCodigo: string, periodo: string): Promise<LecturaRemota[]> {
  const filas = await listarFiltrado(RECURSO_LECTURAS, { medidorCodigo });
  return filas
    .map(parseLecturaRemota)
    .filter((l): l is LecturaRemota => l !== null && l.medidorCodigo === medidorCodigo && l.periodo === periodo);
}

// Lo que viaja a la oficina. "clientId" es el UUID creado en el teléfono:
// con él se sabe si un envío anterior ya llegó (R9, sin duplicados).
export async function crearLectura(l: LecturaLocal): Promise<LecturaRemota> {
  const cuerpo = {
    clientId: l.id,
    medidorCodigo: l.medidorCodigo,
    periodo: l.periodo,
    tecnicoCodigo: l.tecnicoCodigo,
    estadoMedidor: l.estadoMedidor,
    lectura: l.lectura,
    lecturaAnterior: l.lecturaAnterior,
    consumo: l.consumo,
    anomalo: l.anomalo,
    anomaliaConfirmada: l.anomaliaConfirmada,
    motivo: l.motivo,
    descripcionDanio: l.descripcionDanio,
    tieneFoto: l.fotoNombre !== null,
    fotoNombre: l.fotoNombre,
    registradaEn: l.registradaEn,
  };
  const creada = await pedirJson<unknown>(url(RECURSO_LECTURAS), {
    method: 'POST',
    body: JSON.stringify(cuerpo),
  });
  const remota = parseLecturaRemota(creada);
  if (!remota) throw new Error('Respuesta inesperada de la oficina');
  return remota;
}
