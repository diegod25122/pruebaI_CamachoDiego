// Colores, tipografía y medidas de la app. Contraste alto y botones grandes
// porque se usa en la calle, muchas veces al sol.

import { Platform } from 'react-native';

export const Color = {
  // Base
  noche: '#0B1F33', // azul tinta: encabezados, texto principal
  agua: '#0E5A8A', // azul agua: enlaces, datos del medidor
  aguaClaro: '#D7E8F3',
  papel: '#F3EFE6', // fondo tipo libreta
  tarjeta: '#FFFFFF',
  linea: '#D6CFBF',
  tenue: '#5B6470', // texto secundario
  blanco: '#FFFFFF',

  // Chaleco reflectivo: acción principal y cinta
  chaleco: '#F5B700',
  chalecoOscuro: '#8A6300',

  // Estados
  alerta: '#B3261E', // anomalía, error, dígito rojo del contador
  alertaFondo: '#FBE3E1',
  pendiente: '#8A4B00',
  pendienteFondo: '#FFEFD2',
  ok: '#1E6B34',
  okFondo: '#DDF1E2',
  sinRed: '#3A3F47',

  // Contador del medidor
  contador: '#111418',
  contadorBorde: '#2B3036',
} as const;

export const Espacio = { xs: 4, s: 8, m: 12, l: 16, xl: 24, xxl: 32 } as const;

export const Radio = { s: 6, m: 10, l: 16, pastilla: 999 } as const;

export const Borde = 2;

export const Fuente = {
  numeros: Platform.select({ android: 'monospace', ios: 'Menlo', default: 'monospace' }),
} as const;

export const Texto = {
  titulo: { fontSize: 26, fontWeight: '900' as const, color: Color.noche, letterSpacing: -0.3 },
  subtitulo: { fontSize: 18, fontWeight: '800' as const, color: Color.noche },
  etiqueta: {
    fontSize: 12,
    fontWeight: '800' as const,
    color: Color.tenue,
    letterSpacing: 1.2,
    textTransform: 'uppercase' as const,
  },
  cuerpo: { fontSize: 16, color: Color.noche, lineHeight: 22 },
  pequeno: { fontSize: 13, color: Color.tenue, lineHeight: 18 },
  codigo: { fontFamily: Fuente.numeros, fontWeight: '700' as const, letterSpacing: 1 },
} as const;
