// Deber 5 · Uniwind: Metro compila global.css y genera los tipos de className.
// withUniwindConfig debe ser el envoltorio más externo de la configuración.
const { getDefaultConfig } = require('expo/metro-config');
const { withUniwindConfig } = require('uniwind/metro');

const config = getDefaultConfig(__dirname);
config.resolver.assetExts.push('wasm');

module.exports = withUniwindConfig(config, {
  cssEntryFile: './global.css',
  dtsFile: './src/uniwind-types.d.ts',
});
