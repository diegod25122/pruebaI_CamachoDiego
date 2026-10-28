// R7: la foto se copia a la carpeta de documentos de la app, que el sistema
// no borra (la caché de la cámara sí puede vaciarse). Se guarda solo el
// nombre del archivo y la ruta se arma al mostrarla.

import { Directory, File, Paths } from 'expo-file-system';

const carpeta = new Directory(Paths.document, 'fotos-medidores');

function asegurarCarpeta(): void {
  if (!carpeta.exists) carpeta.create({ intermediates: true, idempotent: true });
}

export async function guardarFoto(uriTemporal: string, lecturaId: string): Promise<string> {
  asegurarCarpeta();
  const nombre = `${lecturaId}-${Date.now()}.jpg`;
  await new File(uriTemporal).copy(new File(carpeta, nombre));
  return nombre;
}

export function uriDeFoto(nombre: string): string | null {
  const archivo = new File(carpeta, nombre);
  return archivo.exists ? archivo.uri : null;
}

export function borrarFoto(nombre: string | null): void {
  if (!nombre) return;
  try {
    const archivo = new File(carpeta, nombre);
    if (archivo.exists) archivo.delete();
  } catch {
    // Si no se puede borrar, solo queda un archivo huérfano: no es grave.
  }
}
