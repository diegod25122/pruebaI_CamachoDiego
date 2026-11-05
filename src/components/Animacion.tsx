// Taller 7: animaciones Lottie que comunican un estado real de la app.
//  cargando: se están obteniendo datos (medidor de la oficina, señal GPS).
//  exito: la lectura quedó guardada / el ingreso fue correcto.
//  error: el ingreso falló (datos incorrectos).
// Los .json están en assets/lottie/ (se pueden reemplazar por otros de
// LottieFiles o IconScout con el mismo nombre).

import LottieView from 'lottie-react-native';
import { Text, View } from 'react-native';

import { tx } from '@/constants/clases';

const FUENTES = {
  cargando: require('../../assets/lottie/cargando.json'),
  exito: require('../../assets/lottie/exito.json'),
  error: require('../../assets/lottie/error.json'),
} as const;

interface Props {
  tipo: keyof typeof FUENTES;
  tamano?: number;
  texto?: string;
  /** Clases extra para el texto (por ejemplo, otro color sobre fondo oscuro). */
  claseTexto?: string;
}

export function Animacion({ tipo, tamano = 120, texto, claseTexto = '' }: Props) {
  return (
    <View
      className="items-center gap-2"
      accessibilityRole={tipo === 'cargando' ? 'progressbar' : tipo === 'error' ? 'alert' : undefined}
      accessibilityLabel={texto}>
      <LottieView
        source={FUENTES[tipo]}
        autoPlay
        // La carga se repite mientras dure; el éxito y el error, una vez.
        loop={tipo === 'cargando'}
        style={{ width: tamano, height: tamano }}
        webStyle={{ width: tamano, height: tamano }}
      />
      {texto ? <Text className={`${tx.cuerpo} text-center font-bold ${claseTexto}`}>{texto}</Text> : null}
    </View>
  );
}
