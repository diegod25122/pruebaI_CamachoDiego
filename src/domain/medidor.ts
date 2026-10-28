// R2 y R3: código del medidor y datos que envía la oficina.

export const CODIGO_MEDIDOR = /^MED-\d{6}$/;

export type ResultadoCodigo = { ok: true; codigo: string } | { ok: false; error: string };

export function normalizarCodigoMedidor(texto: string): string {
  return texto.trim().toUpperCase();
}

// R2: solo un código con formato MED- + 6 dígitos llega a consultar la oficina.
export function validarCodigoMedidor(texto: string): ResultadoCodigo {
  const codigo = normalizarCodigoMedidor(texto);
  if (codigo === '') return { ok: false, error: 'Escribe el código de la etiqueta del medidor.' };
  if (!codigo.startsWith('MED-')) return { ok: false, error: 'El código empieza con MED- (ej. MED-000123).' };

  const numeros = codigo.slice(4);
  if (!/^\d*$/.test(numeros)) return { ok: false, error: 'Después de MED- solo van números.' };
  if (numeros.length < 6) {
    const faltan = 6 - numeros.length;
    return { ok: false, error: `Código incompleto: ${faltan === 1 ? 'falta 1 dígito' : `faltan ${faltan} dígitos`}.` };
  }
  if (numeros.length > 6) return { ok: false, error: 'Son exactamente 6 dígitos después de MED-.' };
  return CODIGO_MEDIDOR.test(codigo) ? { ok: true, codigo } : { ok: false, error: 'Formato inválido.' };
}

export interface Medidor {
  id: string;
  codigo: string;
  direccion: string;
  sector: string;
  numeroCuenta: string;
  estado: string;
  ultimaLectura: number;
  fechaUltimaLectura: string;
  consumoPromedio: number;
}

// Lo que se necesita para comparar una lectura (R6). Se guarda aparte del
// medidor completo para poder corregir una lectura aunque no haya caché.
export interface Referencia {
  lecturaAnterior: number;
  consumoPromedio: number;
}

export function referenciaDe(medidor: Medidor): Referencia {
  return { lecturaAnterior: medidor.ultimaLectura, consumoPromedio: medidor.consumoPromedio };
}

function texto(valor: unknown): string {
  return typeof valor === 'string' ? valor : valor == null ? '' : String(valor);
}

function numero(valor: unknown): number {
  const n = typeof valor === 'number' ? valor : Number(valor);
  return Number.isFinite(n) ? n : 0;
}

// MockAPI puede devolver números como texto: se normaliza al recibir.
export function parseMedidor(raw: unknown): Medidor | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const r = raw as Record<string, unknown>;
  const codigo = normalizarCodigoMedidor(texto(r.codigo));
  if (!CODIGO_MEDIDOR.test(codigo)) return null;
  return {
    id: texto(r.id),
    codigo,
    direccion: texto(r.direccion),
    sector: texto(r.sector),
    numeroCuenta: texto(r.numeroCuenta),
    estado: texto(r.estado),
    ultimaLectura: Math.round(numero(r.ultimaLectura)),
    fechaUltimaLectura: texto(r.fechaUltimaLectura),
    consumoPromedio: numero(r.consumoPromedio),
  };
}
