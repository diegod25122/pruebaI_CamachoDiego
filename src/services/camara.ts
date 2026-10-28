// R7: abre la cámara y avisa si el técnico negó el permiso.

import * as ImagePicker from 'expo-image-picker';

export type ResultadoCamara =
  | { tipo: 'foto'; uri: string }
  | { tipo: 'cancelada' }
  | { tipo: 'sinPermiso'; puedePreguntar: boolean };

export async function tomarFoto(): Promise<ResultadoCamara> {
  const permiso = await ImagePicker.requestCameraPermissionsAsync();
  if (!permiso.granted) {
    return { tipo: 'sinPermiso', puedePreguntar: permiso.canAskAgain };
  }
  const resultado = await ImagePicker.launchCameraAsync({
    mediaTypes: ['images'],
    quality: 0.6, // suficiente para leer los dígitos y liviana
    exif: false,
  });
  if (resultado.canceled || resultado.assets.length === 0) return { tipo: 'cancelada' };
  return { tipo: 'foto', uri: resultado.assets[0].uri };
}
