import { TIMEOUT_MS } from '@/config';

// Sin red, se agotó el tiempo o se cortó la conexión a mitad de camino.
// El sincronizador lo usa para detenerse y reintentar después.
export class ErrorDeRed extends Error {
  constructor(mensaje = 'Sin conexión con la oficina') {
    super(mensaje);
    this.name = 'ErrorDeRed';
  }
}

export class ErrorHttp extends Error {
  constructor(public readonly status: number, mensaje: string) {
    super(mensaje);
    this.name = 'ErrorHttp';
  }
}

export async function pedirJson<T>(url: string, init: RequestInit = {}): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  let respuesta: Response;
  try {
    respuesta = await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', ...(init.headers ?? {}) },
    });
  } catch {
    throw new ErrorDeRed();
  } finally {
    clearTimeout(timer);
  }

  if (!respuesta.ok) {
    throw new ErrorHttp(respuesta.status, `La oficina respondió ${respuesta.status}`);
  }
  try {
    return (await respuesta.json()) as T;
  } catch {
    // La respuesta se cortó a mitad: para la app es lo mismo que no tener red.
    throw new ErrorDeRed('La respuesta llegó incompleta');
  }
}
