// R4 + R9: envía solas las lecturas pendientes, sin duplicarlas.
//
// Para cada lectura pendiente, en orden:
//  1. Verificar (R4): trae el medidor actualizado de la oficina y vuelve a
//     calcular el consumo con la lectura anterior real. Si con esos datos no
//     cumple una regla (p. ej. ahora el consumo es anómalo y no tiene foto),
//     queda "en revisión" para que el técnico la corrija.
//  2. Idempotencia (R9): pregunta a la oficina qué lecturas tiene de ese
//     medidor en el mes. Si ya está la que tiene nuestro clientId, el envío
//     anterior sí llegó (se cortó la señal antes de la respuesta): se marca
//     enviada sin volver a enviarla. Si hay otra lectura, es duplicada (R10).
//  3. Marca "enviando", hace el POST y al recibir la respuesta la marca enviada.
//     Si la señal se corta, vuelve a "pendiente" y el paso 2 evita el duplicado.

import { ErrorDeRed } from '@/api/http';
import { buscarMedidor, crearLectura, ErrorConfiguracion, lecturasDelPeriodo } from '@/api/oficina';
import { actualizarEnvio, lecturasPorEnviar } from '@/db/lecturasRepo';
import type { LecturaLocal } from '@/domain/lectura';
import { referenciaDe } from '@/domain/medidor';
import { datosDesdeLectura, evaluarCaptura, hayErrores } from '@/domain/reglas';

export type ResultadoSync = 'sin-pendientes' | 'completo' | 'sin-red' | 'error';

async function procesar(l: LecturaLocal): Promise<void> {
  // 1. Verificar contra los datos actuales del medidor.
  const medidor = await buscarMedidor(l.medidorCodigo);
  if (!medidor) {
    await actualizarEnvio(l.id, {
      envio: 'rechazada',
      mensaje: 'El medidor no existe en el sistema de la oficina. Revisa el código de la etiqueta.',
    });
    return;
  }
  const referencia = referenciaDe(medidor);
  const evaluacion = evaluarCaptura(datosDesdeLectura(l), referencia);
  const comparacion = {
    verificacion: 'verificada' as const,
    lecturaAnterior: referencia.lecturaAnterior,
    consumoPromedio: referencia.consumoPromedio,
    consumo: evaluacion.consumo,
    anomalo: evaluacion.anomalo,
  };
  if (hayErrores(evaluacion.errores)) {
    const primero = Object.values(evaluacion.errores)[0];
    await actualizarEnvio(l.id, {
      ...comparacion,
      envio: 'revision',
      mensaje: `Con la lectura anterior de la oficina (${referencia.lecturaAnterior} m³): ${primero}`,
    });
    return;
  }

  // 2. ¿Ya llegó antes? ¿Hay otra lectura del mismo mes?
  const enOficina = await lecturasDelPeriodo(l.medidorCodigo, l.periodo);
  const propia = enOficina.find((r) => r.clientId === l.id);
  if (propia) {
    await actualizarEnvio(l.id, {
      ...comparacion,
      envio: 'enviada',
      remoteId: propia.id,
      enviadaEn: new Date().toISOString(),
      mensaje: null,
    });
    return;
  }
  if (enOficina.length > 0) {
    await actualizarEnvio(l.id, {
      ...comparacion,
      envio: 'rechazada',
      mensaje: `La oficina ya tiene una lectura de ${l.medidorCodigo} en este mes (técnico ${enOficina[0].tecnicoCodigo}).`,
    });
    return;
  }

  // 3. Enviar.
  const verificada: LecturaLocal = { ...l, ...comparacion };
  await actualizarEnvio(l.id, { ...comparacion, envio: 'enviando', sumarIntento: true });
  try {
    const remota = await crearLectura(verificada);
    await actualizarEnvio(l.id, {
      envio: 'enviada',
      remoteId: remota.id,
      enviadaEn: new Date().toISOString(),
      mensaje: null,
    });
  } catch (error) {
    await actualizarEnvio(l.id, {
      envio: 'pendiente',
      mensaje: error instanceof ErrorDeRed ? 'Se cortó la señal durante el envío. Se reintentará.' : null,
    });
    throw error;
  }
}

async function sincronizarUnaVez(): Promise<ResultadoSync> {
  const pendientes = await lecturasPorEnviar();
  if (pendientes.length === 0) return 'sin-pendientes';
  for (const lectura of pendientes) {
    try {
      await procesar(lectura);
    } catch (error) {
      // Sin red o sin configurar: no tiene sentido seguir con las demás.
      if (error instanceof ErrorDeRed) return 'sin-red';
      if (error instanceof ErrorConfiguracion) return 'error';
      await actualizarEnvio(lectura.id, {
        envio: 'pendiente',
        mensaje: `No se pudo enviar: ${error instanceof Error ? error.message : 'error desconocido'}. Se reintentará.`,
      });
    }
  }
  return 'completo';
}

// Nunca corren dos sincronizaciones a la vez (otra causa de duplicados).
let enCurso: Promise<ResultadoSync> | null = null;
let repetir = false;

export function sincronizar(): Promise<ResultadoSync> {
  if (enCurso) {
    repetir = true; // llegó algo nuevo mientras se enviaba: otra vuelta al terminar
    return enCurso;
  }
  enCurso = (async () => {
    let resultado: ResultadoSync;
    do {
      repetir = false;
      resultado = await sincronizarUnaVez();
    } while (repetir && resultado !== 'sin-red');
    return resultado;
  })().finally(() => {
    enCurso = null;
  });
  return enCurso;
}
