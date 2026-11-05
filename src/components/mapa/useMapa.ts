// Lógica común a MapaLeaflet.tsx (WebView) y MapaLeaflet.web.tsx (iframe).

import { useEffect, useState } from 'react';

import { htmlLeaflet, leerMensajeDelMapa, type MensajeAlMapa } from '@/components/mapa/htmlLeaflet';
import { CENTRO_POR_DEFECTO, type Ubicacion } from '@/domain/ubicacion';

export interface PropsMapa {
  ubicacion: Ubicacion | null;
  editable?: boolean;
  onMover?: (latitud: number, longitud: number) => void;
  /** Avisa cuando el dedo está sobre el mapa (para pausar el scroll de la pantalla). */
  onTocando?: (tocando: boolean) => void;
  alto?: number;
}

export function useMapa(
  { ubicacion, editable = false, onMover }: PropsMapa,
  enviarAlMapa: (m: MensajeAlMapa) => void,
) {
  // El HTML se arma una sola vez: si cambiara, el WebView recargaría el mapa.
  // Los cambios de ubicación posteriores viajan como mensajes.
  const [html] = useState(() =>
    htmlLeaflet({
      latitud: ubicacion?.latitud ?? CENTRO_POR_DEFECTO.latitud,
      longitud: ubicacion?.longitud ?? CENTRO_POR_DEFECTO.longitud,
      zoom: ubicacion ? 17 : 13,
      editable,
      conMarcador: ubicacion !== null,
    }),
  );
  const [listo, setListo] = useState(false);
  const [sinMapa, setSinMapa] = useState(false);

  const lat = ubicacion?.latitud;
  const lng = ubicacion?.longitud;
  const precision = ubicacion?.origen === 'gps' ? ubicacion.precision : null;

  // Cada vez que cambia la ubicación (GPS o "usar mi ubicación"), se mueve el marcador.
  useEffect(() => {
    if (listo && lat !== undefined && lng !== undefined) enviarAlMapa({ tipo: 'poner', lat, lng, precision });
  }, [listo, lat, lng, precision, enviarAlMapa]);

  const alRecibir = (datos: unknown) => {
    const m = leerMensajeDelMapa(datos);
    if (!m) return;
    if (m.tipo === 'listo') setListo(true);
    else if (m.tipo === 'sinMapa') setSinMapa(true);
    else onMover?.(m.lat, m.lng);
  };

  return { html, sinMapa, alRecibir };
}
