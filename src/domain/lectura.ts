// Modelo de una lectura guardada en el teléfono.

export type EstadoMedidor = 'normal' | 'inaccesible' | 'danado';

// Ciclo de envío (R9, R10):
//  pendiente: guardada en el teléfono, se enviará sola.
//  enviando: el POST está en curso (si la app muere aquí, al volver se
//    comprueba en la oficina si llegó antes de reenviar).
//  revision: con los datos actualizados no cumple una regla; el técnico
//    debe corregirla. No se envía.
//  enviada: la oficina la confirmó. Ya no se puede corregir.
//  rechazada: la oficina ya tenía una lectura de ese medidor en el mes, o el
//    medidor no existe. No se envía.
export type EstadoEnvio = 'pendiente' | 'enviando' | 'revision' | 'enviada' | 'rechazada';

// R4: "pendiente" hasta compararla con los datos actuales de la oficina.
export type Verificacion = 'pendiente' | 'verificada';

export interface LecturaLocal {
  id: string; // UUID creado en el teléfono: es la clave de idempotencia (R9)
  medidorCodigo: string;
  periodo: string; // 'AAAA-MM' (R10: una por medidor y mes)
  tecnicoCodigo: string;
  estadoMedidor: EstadoMedidor;
  lectura: number | null;
  motivo: string | null;
  descripcionDanio: string | null;
  lecturaAnterior: number | null;
  consumo: number | null;
  consumoPromedio: number | null;
  anomalo: boolean;
  anomaliaConfirmada: boolean;
  fotoNombre: string | null;
  registradaEn: string;
  actualizadaEn: string;
  verificacion: Verificacion;
  envio: EstadoEnvio;
  mensaje: string | null;
  remoteId: string | null;
  enviadaEn: string | null;
  intentos: number;
}

export const ESTADOS_MEDIDOR: { valor: EstadoMedidor; titulo: string; regla: string }[] = [
  { valor: 'normal', titulo: 'Normal', regla: 'Lectura obligatoria' },
  { valor: 'inaccesible', titulo: 'Inaccesible', regla: 'Motivo obligatorio · sin lectura' },
  { valor: 'danado', titulo: 'Dañado', regla: 'Describe el daño · foto obligatoria' },
];

export function tituloEstado(estado: EstadoMedidor): string {
  return ESTADOS_MEDIDOR.find((e) => e.valor === estado)?.titulo ?? estado;
}

// Se puede corregir mientras no se haya enviado (R10).
export function esEditable(l: Pick<LecturaLocal, 'envio'>): boolean {
  return l.envio === 'pendiente' || l.envio === 'revision';
}

// "Le quedan por enviar" (R9): todo lo que todavía no llegó a la oficina.
export function cuentaPorEnviar(l: Pick<LecturaLocal, 'envio'>): boolean {
  return l.envio === 'pendiente' || l.envio === 'enviando' || l.envio === 'revision';
}

export function periodoDe(fecha: Date): string {
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  return `${fecha.getFullYear()}-${mes}`;
}
