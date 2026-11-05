// Taller 7: mapa Leaflet + OpenStreetMap dentro de un WebView (Android / iOS).
// En el navegador Metro usa MapaLeaflet.web.tsx (react-native-webview no
// funciona en web).

import { useCallback, useRef } from 'react';
import { WebView } from 'react-native-webview';

import type { MensajeAlMapa } from '@/components/mapa/htmlLeaflet';
import { MarcoMapa } from '@/components/mapa/MarcoMapa';
import { useMapa, type PropsMapa } from '@/components/mapa/useMapa';

export function MapaLeaflet(props: PropsMapa) {
  const { onTocando, alto = 260 } = props;
  const web = useRef<WebView>(null);

  // App -> mapa: se ejecuta window.recibir(...) dentro de la página.
  const enviarAlMapa = useCallback((m: MensajeAlMapa) => {
    web.current?.injectJavaScript(`window.recibir && window.recibir(${JSON.stringify(m)}); true;`);
  }, []);

  const { html, sinMapa, alRecibir } = useMapa(props, enviarAlMapa);

  return (
    <MarcoMapa alto={alto} sinMapa={sinMapa}>
      <WebView
        ref={web}
        originWhitelist={['*']}
        // baseUrl https: los mosaicos de OpenStreetMap se piden con un origen válido.
        source={{ html, baseUrl: 'https://ruta-lecturas.local/' }}
        // Mapa -> app: window.ReactNativeWebView.postMessage(...)
        onMessage={(e) => alRecibir(e.nativeEvent.data)}
        javaScriptEnabled
        domStorageEnabled
        scrollEnabled={false}
        nestedScrollEnabled
        setSupportMultipleWindows={false}
        onTouchStart={() => onTocando?.(true)}
        onTouchEnd={() => onTocando?.(false)}
        onTouchCancel={() => onTocando?.(false)}
        style={{ flex: 1, backgroundColor: 'transparent' }}
      />
    </MarcoMapa>
  );
}
