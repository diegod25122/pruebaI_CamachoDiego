// R3: TanStack Query guarda en caché cada medidor consultado y esa caché se
// persiste en AsyncStorage, así funciona en modo avión e incluso tras cerrar
// la app.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { QueryClient } from '@tanstack/react-query';
import type { PersistQueryClientOptions } from '@tanstack/react-query-persist-client';

import { ErrorConfiguracion } from '@/api/oficina';
import { CACHE_BUSTER } from '@/config';

const HORA = 60 * 60 * 1000;

// Una jornada: dentro de ella, volver a consultar un medidor no descarga nada.
export const STALE_MEDIDOR = 12 * HORA;
// Lo que se guarda en el teléfono. gcTime debe ser >= maxAge; si no, la
// consulta se borra de memoria antes y el persister ya no la guarda.
export const MAX_AGE_CACHE = 72 * HORA;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: MAX_AGE_CACHE,
      retry: (fallos, error) => !(error instanceof ErrorConfiguracion) && fallos < 2,
    },
  },
});

export const persistOptions: Omit<PersistQueryClientOptions, 'queryClient'> = {
  persister: createAsyncStoragePersister({ storage: AsyncStorage, key: 'ruta-lecturas-cache' }),
  maxAge: MAX_AGE_CACHE,
  buster: CACHE_BUSTER,
  dehydrateOptions: {
    // Las lecturas locales ya viven en SQLite: no se duplican en la caché.
    shouldDehydrateQuery: (query) => query.state.status === 'success' && query.queryKey[0] !== 'local',
  },
};
