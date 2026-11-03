// Versión web de fotos.ts (Metro la usa automáticamente en el navegador).
// expo-file-system (Directory/File) no funciona en web, así que la foto se
// convierte a data URL y se guarda en localStorage. Si no cabe (límite de
// ~5 MB del navegador), queda solo en memoria mientras la pestaña esté abierta.
// Misma API que fotos.ts: se guarda el nombre y la URI se obtiene al mostrarla.

const PREFIJO = 'foto-medidor:';
const enMemoria = new Map<string, string>();

function leerComoDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const lector = new FileReader();
    lector.onload = () => resolve(lector.result as string);
    lector.onerror = () => reject(lector.error);
    lector.readAsDataURL(blob);
  });
}

export async function guardarFoto(uriTemporal: string, lecturaId: string): Promise<string> {
  const nombre = `${lecturaId}-${Date.now()}.jpg`;
  const dataUrl = uriTemporal.startsWith('data:')
    ? uriTemporal
    : await leerComoDataUrl(await (await fetch(uriTemporal)).blob());
  enMemoria.set(nombre, dataUrl);
  try {
    localStorage.setItem(PREFIJO + nombre, dataUrl);
  } catch {
    // Sin espacio o almacenamiento bloqueado: se mantiene solo en memoria.
  }
  return nombre;
}

export function uriDeFoto(nombre: string): string | null {
  const enCache = enMemoria.get(nombre);
  if (enCache) return enCache;
  try {
    return localStorage.getItem(PREFIJO + nombre);
  } catch {
    return null;
  }
}

export function borrarFoto(nombre: string | null): void {
  if (!nombre) return;
  enMemoria.delete(nombre);
  try {
    localStorage.removeItem(PREFIJO + nombre);
  } catch {
    // Si no se puede borrar, no es grave.
  }
}
