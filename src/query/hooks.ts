import { useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';

import { buscarMedidor, lecturasDelPeriodo } from '@/api/oficina';
import { listarLecturas, obtenerLectura } from '@/db/lecturasRepo';
import { cuentaPorEnviar, type LecturaLocal } from '@/domain/lectura';
import { claves } from '@/query/keys';
import { STALE_MEDIDOR } from '@/query/queryClient';

// R2 + R3: solo consulta si el código es válido (enabled). Con caché vigente
// no vuelve a descargar; sin señal muestra lo guardado.
export function useMedidor(codigo: string | null) {
  return useQuery({
    queryKey: claves.medidor(codigo ?? ''),
    queryFn: () => buscarMedidor(codigo as string),
    enabled: codigo !== null,
    // Un medidor encontrado vale toda la jornada; un "no existe" se vuelve a
    // preguntar la próxima vez.
    staleTime: (query) => (query.state.data ? STALE_MEDIDOR : 0),
  });
}

// R10: ¿la oficina ya tiene una lectura de este medidor en el mes?
export function useLecturasOficina(codigo: string | null, periodo: string) {
  return useQuery({
    queryKey: claves.lecturasOficina(codigo ?? '', periodo),
    queryFn: () => lecturasDelPeriodo(codigo as string, periodo),
    enabled: codigo !== null,
    staleTime: 60 * 1000,
  });
}

// Lecturas del teléfono (SQLite). networkMode "always": no dependen de la red.
export function useLecturasLocales() {
  return useQuery({
    queryKey: claves.locales,
    queryFn: listarLecturas,
    networkMode: 'always',
    staleTime: Infinity,
  });
}

export function useLecturaLocal(id: string) {
  return useQuery({
    queryKey: claves.local(id),
    queryFn: () => obtenerLectura(id),
    networkMode: 'always',
    staleTime: Infinity,
  });
}

export function useResumenLocal() {
  const { data } = useLecturasLocales();
  const lecturas: LecturaLocal[] = data ?? [];
  return {
    lecturas,
    porEnviar: lecturas.filter(cuentaPorEnviar).length,
    enRevision: lecturas.filter((l) => l.envio === 'revision').length,
    enviadas: lecturas.filter((l) => l.envio === 'enviada').length,
  };
}

// Tras escribir en SQLite, todas las pantallas que leen lecturas se refrescan.
export function refrescarLocales(client: QueryClient): Promise<void> {
  return client.invalidateQueries({ queryKey: ['local'] });
}

export function useRefrescarLocales() {
  const client = useQueryClient();
  return () => refrescarLocales(client);
}
