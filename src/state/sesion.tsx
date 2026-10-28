// R1: la sesión se guarda cifrada con expo-secure-store y sobrevive al cierre
// de la app hasta que el técnico cierra sesión. La clave no se guarda.

import * as SecureStore from 'expo-secure-store';
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

import { autenticar, type Tecnico } from '@/domain/tecnicos';

const CLAVE = 'sesion-tecnico';

interface Sesion {
  tecnico: Tecnico;
  inicio: string;
}

interface SesionCtx {
  sesion: Sesion | null;
  cargando: boolean;
  iniciarSesion: (codigo: string, clave: string) => Promise<boolean>;
  cerrarSesion: () => Promise<void>;
}

const Contexto = createContext<SesionCtx | null>(null);

export function SesionProvider({ children }: { children: ReactNode }) {
  const [sesion, setSesion] = useState<Sesion | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    SecureStore.getItemAsync(CLAVE)
      .then((guardada) => {
        if (guardada) setSesion(JSON.parse(guardada) as Sesion);
      })
      .catch(() => undefined)
      .finally(() => setCargando(false));
  }, []);

  const iniciarSesion = useCallback(async (codigo: string, clave: string) => {
    const tecnico = autenticar(codigo, clave);
    if (!tecnico) return false;
    const nueva: Sesion = { tecnico, inicio: new Date().toISOString() };
    await SecureStore.setItemAsync(CLAVE, JSON.stringify(nueva));
    setSesion(nueva);
    return true;
  }, []);

  const cerrarSesion = useCallback(async () => {
    await SecureStore.deleteItemAsync(CLAVE);
    setSesion(null);
  }, []);

  return (
    <Contexto.Provider value={{ sesion, cargando, iniciarSesion, cerrarSesion }}>{children}</Contexto.Provider>
  );
}

export function useSesion(): SesionCtx {
  const ctx = useContext(Contexto);
  if (!ctx) throw new Error('useSesion debe usarse dentro de SesionProvider');
  return ctx;
}
