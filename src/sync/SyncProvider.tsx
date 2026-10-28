// Dispara la sincronización sin que el técnico haga nada (R9):
//  - al recuperar la señal,
//  - al volver a la app,
//  - al guardar una lectura,
//  - y cada 20 s mientras haya pendientes y señal.

import { useQueryClient } from '@tanstack/react-query';
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';

import { refrescarLocales, useResumenLocal } from '@/query/hooks';
import { iniciarConexion, useConexion, type EstadoConexion } from '@/sync/conexion';
import { sincronizar } from '@/sync/sincronizador';

interface SyncCtx {
  conexion: EstadoConexion;
  enviando: boolean;
  sincronizarAhora: () => void;
}

const Contexto = createContext<SyncCtx | null>(null);

iniciarConexion();

export function SyncProvider({ children }: { children: ReactNode }) {
  const client = useQueryClient();
  const conexion = useConexion();
  const { porEnviar, enRevision } = useResumenLocal();
  const [enviando, setEnviando] = useState(false);
  const pendientesEnviables = porEnviar - enRevision;

  // Valores actuales para los temporizadores y oyentes, sin reiniciarlos.
  const conexionRef = useRef(conexion);
  const pendientesRef = useRef(pendientesEnviables);
  useEffect(() => {
    conexionRef.current = conexion;
    pendientesRef.current = pendientesEnviables;
  }, [conexion, pendientesEnviables]);

  const sincronizarAhora = useCallback(() => {
    if (conexionRef.current !== 'con-red') return;
    if (pendientesRef.current > 0) setEnviando(true);
    // Mientras se envía, la lista se refresca para ver "Enviando…".
    void refrescarLocales(client);
    sincronizar()
      .catch(() => undefined)
      .finally(() => {
        setEnviando(false);
        void refrescarLocales(client);
      });
  }, [client]);

  // Al recuperar la señal.
  useEffect(() => {
    if (conexion === 'con-red') sincronizarAhora();
  }, [conexion, sincronizarAhora]);

  // Al volver a la app.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') sincronizarAhora();
    });
    return () => sub.remove();
  }, [sincronizarAhora]);

  // Reintento periódico mientras queden pendientes que se puedan enviar.
  useEffect(() => {
    if (conexion !== 'con-red' || pendientesEnviables === 0) return;
    const id = setInterval(sincronizarAhora, 20_000);
    return () => clearInterval(id);
  }, [conexion, pendientesEnviables, sincronizarAhora]);

  return <Contexto.Provider value={{ conexion, enviando, sincronizarAhora }}>{children}</Contexto.Provider>;
}

export function useSync(): SyncCtx {
  const ctx = useContext(Contexto);
  if (!ctx) throw new Error('useSync debe usarse dentro de SyncProvider');
  return ctx;
}
