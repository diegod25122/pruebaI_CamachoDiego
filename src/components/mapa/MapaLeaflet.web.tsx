// Versión web de MapaLeaflet.tsx: la misma página de Leaflet en un <iframe>.
// La comunicación usa window.postMessage en vez del puente del WebView.

import { createElement, useCallback, useEffect, useRef } from 'react';

import type { MensajeAlMapa } from '@/components/mapa/htmlLeaflet';
import { MarcoMapa } from '@/components/mapa/MarcoMapa';
import { useMapa, type PropsMapa } from '@/components/mapa/useMapa';

export function MapaLeaflet(props: PropsMapa) {
  const { alto = 260 } = props;
  const marco = useRef<HTMLIFrameElement | null>(null);

  const enviarAlMapa = useCallback((m: MensajeAlMapa) => {
    marco.current?.contentWindow?.postMessage(JSON.stringify(m), '*');
  }, []);

  const { html, sinMapa, alRecibir } = useMapa(props, enviarAlMapa);

  // Mapa -> app: solo se aceptan mensajes de este iframe.
  const alRecibirRef = useRef(alRecibir);
  alRecibirRef.current = alRecibir;
  useEffect(() => {
    const oyente = (e: MessageEvent) => {
      if (e.source === marco.current?.contentWindow) alRecibirRef.current(e.data);
    };
    window.addEventListener('message', oyente);
    return () => window.removeEventListener('message', oyente);
  }, []);

  return (
    <MarcoMapa alto={alto} sinMapa={sinMapa}>
      {createElement('iframe', {
        ref: marco,
        srcDoc: html,
        title: 'Mapa de la ubicación de la lectura',
        style: { border: 0, width: '100%', height: '100%' },
      })}
    </MarcoMapa>
  );
}
