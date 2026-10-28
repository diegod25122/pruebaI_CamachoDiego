// Convierte el borrador en una lectura guardada en SQLite.

import type { Borrador } from '@/db/borradorRepo';
import { corregirLectura, insertarLectura, obtenerLectura } from '@/db/lecturasRepo';
import type { LecturaLocal } from '@/domain/lectura';
import { evaluarCaptura, hayErrores } from '@/domain/reglas';

export async function guardarCaptura(b: Borrador, tecnicoCodigo: string): Promise<LecturaLocal> {
  const ev = evaluarCaptura(b.datos, b.referencia);
  if (hayErrores(ev.errores)) throw new Error(Object.values(ev.errores)[0]);

  const ahora = new Date().toISOString();
  const anterior = b.editando ? await obtenerLectura(b.id) : null;
  const estado = b.datos.estadoMedidor!;

  const lectura: LecturaLocal = {
    id: b.id,
    medidorCodigo: b.medidorCodigo,
    periodo: b.periodo,
    tecnicoCodigo: anterior?.tecnicoCodigo ?? tecnicoCodigo,
    estadoMedidor: estado,
    lectura: ev.lectura,
    motivo: estado === 'inaccesible' ? b.datos.motivo.trim() : null,
    descripcionDanio: estado === 'danado' ? b.datos.descripcionDanio.trim() : null,
    lecturaAnterior: b.referencia?.lecturaAnterior ?? null,
    consumo: ev.consumo,
    consumoPromedio: b.referencia?.consumoPromedio ?? null,
    anomalo: ev.anomalo,
    anomaliaConfirmada: ev.anomalo && b.datos.anomaliaConfirmada,
    fotoNombre: b.datos.fotoNombre,
    registradaEn: anterior?.registradaEn ?? ahora,
    actualizadaEn: ahora,
    // R4: queda pendiente de verificar hasta compararla con los datos
    // actuales de la oficina (lo hace el sincronizador al tener señal).
    verificacion: 'pendiente',
    envio: 'pendiente',
    mensaje: null,
    remoteId: null,
    enviadaEn: null,
    intentos: anterior?.intentos ?? 0,
  };

  if (b.editando) await corregirLectura(lectura);
  else await insertarLectura(lectura);
  return lectura;
}
