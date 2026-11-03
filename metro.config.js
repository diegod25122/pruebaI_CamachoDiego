// Deber 5 · Uniwind: Metro compila global.css y genera los tipos de className.
// withUniwindConfig debe ser el envoltorio más externo de la configuración.
const { getDefaultConfig } = require('expo/metro-config');
const { withUniwindConfig } = require('uniwind/metro');

const config = getDefaultConfig(__dirname);
config.resolver.assetExts.push('wasm');

// expo-sqlite en web usa SharedArrayBuffer, que el navegador solo habilita
// si la página está "aislada entre orígenes" (cabeceras COOP + COEP).
// Se agregan a TODAS las respuestas del servidor de desarrollo (incluido el
// HTML), porque enhanceMiddleware de Expo solo cubre los bundles.
const http = require('http');
const writeHeadOriginal = http.ServerResponse.prototype.writeHead;
http.ServerResponse.prototype.writeHead = function (...args) {
  if (!this.headersSent) {
    this.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
    this.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  }
  return writeHeadOriginal.apply(this, args);
};

module.exports = withUniwindConfig(config, {
  cssEntryFile: './global.css',
  dtsFile: './src/uniwind-types.d.ts',
});
