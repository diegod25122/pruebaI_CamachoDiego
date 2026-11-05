// Taller 7: página HTML con Leaflet + OpenStreetMap que se carga dentro de un
// WebView (Android/iOS) o de un <iframe> (web).
//
// Comunicación entre la app y el mapa (mensajes JSON):
//   App  -> mapa: { tipo: 'poner', lat, lng, precision }  (mueve el marcador)
//   Mapa -> app : { tipo: 'listo' }                         (Leaflet cargó)
//                 { tipo: 'sinMapa' }                       (sin internet: no cargó Leaflet)
//                 { tipo: 'mover', lat, lng }               (el técnico movió el marcador)
//
// Leaflet y los mosaicos (tiles) se descargan de internet. Sin señal el mapa no
// se ve, pero la ubicación del GPS se guarda igual.

export interface OpcionesMapa {
  latitud: number;
  longitud: number;
  zoom: number;
  editable: boolean; // true: el marcador se arrastra y un toque lo mueve
  conMarcador: boolean; // false: todavía no hay ubicación, solo se centra el mapa
}

export type MensajeDelMapa =
  | { tipo: 'listo' }
  | { tipo: 'sinMapa' }
  | { tipo: 'mover'; lat: number; lng: number };

export interface MensajeAlMapa {
  tipo: 'poner';
  lat: number;
  lng: number;
  precision: number | null;
}

export function leerMensajeDelMapa(datos: unknown): MensajeDelMapa | null {
  if (typeof datos !== 'string') return null;
  try {
    const m = JSON.parse(datos) as MensajeDelMapa;
    if (m.tipo === 'listo' || m.tipo === 'sinMapa') return m;
    if (m.tipo === 'mover' && Number.isFinite(m.lat) && Number.isFinite(m.lng)) return m;
    return null;
  } catch {
    return null;
  }
}

export function htmlLeaflet(o: OpcionesMapa): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>
  html, body, #mapa { height: 100%; margin: 0; padding: 0; background: #d7e8f3; }
  .leaflet-container { font-family: sans-serif; }
  /* Marcador con la identidad de la app: amarillo chaleco y borde de tinta. */
  .pin { width: 30px; height: 30px; border-radius: 50% 50% 50% 0; background: #f5b700;
         border: 3px solid #0b1f33; transform: rotate(-45deg); box-shadow: 3px 3px 0 #0b1f33;
         box-sizing: border-box; display: flex; align-items: center; justify-content: center; }
  .pin::after { content: ''; width: 9px; height: 9px; border-radius: 50%; background: #0b1f33; }
</style>
</head>
<body>
<div id="mapa"></div>
<script>
  // Envía un mensaje a la app (WebView en el teléfono, ventana padre en web).
  function enviar(m) {
    var s = JSON.stringify(m);
    if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(s);
    else if (window.parent !== window) window.parent.postMessage(s, '*');
  }

  if (typeof L === 'undefined') {
    enviar({ tipo: 'sinMapa' });
  } else {
    var editable = ${o.editable};
    var mapa = L.map('mapa', { zoomControl: true, attributionControl: true })
      .setView([${o.latitud}, ${o.longitud}], ${o.zoom});

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap'
    }).addTo(mapa);

    var icono = L.divIcon({ className: '', html: '<div class="pin"></div>', iconSize: [30, 30], iconAnchor: [15, 36] });
    var marcador = null;
    var circulo = null;

    function ponerMarcador(lat, lng) {
      if (!marcador) {
        marcador = L.marker([lat, lng], { icon: icono, draggable: editable }).addTo(mapa);
        marcador.on('dragend', function () {
          var p = marcador.getLatLng();
          if (circulo) { mapa.removeLayer(circulo); circulo = null; }
          enviar({ tipo: 'mover', lat: p.lat, lng: p.lng });
        });
      } else {
        marcador.setLatLng([lat, lng]);
      }
    }

    // Mensajes de la app.
    window.recibir = function (m) {
      if (!m || m.tipo !== 'poner') return;
      ponerMarcador(m.lat, m.lng);
      if (circulo) { mapa.removeLayer(circulo); circulo = null; }
      if (m.precision) {
        circulo = L.circle([m.lat, m.lng], { radius: m.precision, color: '#0e5a8a', weight: 1, fillOpacity: 0.12 }).addTo(mapa);
      }
      if (!mapa.getBounds().pad(-0.2).contains([m.lat, m.lng])) mapa.setView([m.lat, m.lng], Math.max(mapa.getZoom(), 17));
    };
    window.addEventListener('message', function (e) {
      try { window.recibir(typeof e.data === 'string' ? JSON.parse(e.data) : e.data); } catch (err) {}
    });

    // Modo manual: un toque en el mapa mueve el marcador ahí.
    if (editable) {
      mapa.on('click', function (e) {
        ponerMarcador(e.latlng.lat, e.latlng.lng);
        if (circulo) { mapa.removeLayer(circulo); circulo = null; }
        enviar({ tipo: 'mover', lat: e.latlng.lat, lng: e.latlng.lng });
      });
    }

    if (${o.conMarcador}) ponerMarcador(${o.latitud}, ${o.longitud});
    enviar({ tipo: 'listo' });
  }
</script>
</body>
</html>`;
}
