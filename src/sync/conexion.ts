// Estado de la red con expo-network. También se lo pasa a TanStack Query
// (onlineManager) para que, sin señal, no intente descargar y use la caché.

import { onlineManager } from '@tanstack/react-query';
import * as Network from 'expo-network';
import { useSyncExternalStore } from 'react';

export type EstadoConexion = 'comprobando' | 'con-red' | 'sin-red';

let estado: EstadoConexion = 'comprobando';
const oyentes = new Set<() => void>();

function interpretar(s: Network.NetworkState): EstadoConexion {
  // isInternetReachable puede venir null mientras Android lo averigua:
  // solo un false explícito cuenta como "sin internet".
  return s.isConnected === true && s.isInternetReachable !== false ? 'con-red' : 'sin-red';
}

function publicar(nuevo: EstadoConexion): void {
  if (nuevo === estado) return;
  estado = nuevo;
  oyentes.forEach((o) => o());
}

let iniciado = false;

export function iniciarConexion(): void {
  if (iniciado) return;
  iniciado = true;
  onlineManager.setEventListener((setOnline) => {
    const aplicar = (s: Network.NetworkState) => {
      const nuevo = interpretar(s);
      publicar(nuevo);
      setOnline(nuevo === 'con-red');
    };
    Network.getNetworkStateAsync().then(aplicar).catch(() => publicar('sin-red'));
    const suscripcion = Network.addNetworkStateListener(aplicar);
    return () => suscripcion.remove();
  });
}

export function useConexion(): EstadoConexion {
  return useSyncExternalStore(
    (oyente) => {
      oyentes.add(oyente);
      return () => oyentes.delete(oyente);
    },
    () => estado,
  );
}

export function hayConexion(): boolean {
  return estado === 'con-red';
}
