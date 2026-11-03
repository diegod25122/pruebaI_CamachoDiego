/**
 * Deber 5 · punto 1: indicador de seguridad de la contraseña.
 *
 * Función pura: recibe la contraseña y devuelve si es débil, media o fuerte,
 * con sugerencias concretas. No usa librerías (ver ADR-014) y se prueba con Jest.
 *
 * Criterios (un punto por cada uno):
 *   1. 8 caracteres o más     2. 12 caracteres o más
 *   3. mayúsculas y minúsculas  4. al menos un número   5. al menos un símbolo
 *
 * Reglas extra:
 *   - Con menos de 8 caracteres siempre es débil (es el mínimo de la app).
 *   - Las contraseñas muy comunes ("12345678", "password"...) son débiles.
 *   - Un mismo carácter repetido ("aaaaaaaa") es débil.
 *   - 15 caracteres o más es al menos media: es lo que pide la guía NIST
 *     SP 800-63B-4 cuando la contraseña es el único factor.
 */

export type NivelClave = 'vacia' | 'debil' | 'media' | 'fuerte';

export interface FortalezaClave {
  nivel: NivelClave;
  /** 0 = vacía, 1 = débil, 2 = media, 3 = fuerte (lo usa la animación). */
  valor: 0 | 1 | 2 | 3;
  puntos: number;
  sugerencias: string[];
}

const COMUNES = new Set([
  '12345678', '123456789', '1234567890', 'password', 'password1', 'contraseña',
  'qwerty123', 'qwertyui', '11111111', 'abc12345', 'iloveyou', 'admin123', 'ecuador1',
]);

const VALOR: Record<NivelClave, 0 | 1 | 2 | 3> = { vacia: 0, debil: 1, media: 2, fuerte: 3 };

export const TEXTO_NIVEL: Record<NivelClave, string> = {
  vacia: '',
  debil: 'Débil',
  media: 'Media',
  fuerte: 'Fuerte',
};

export function evaluarFortaleza(clave: string): FortalezaClave {
  if (clave.length === 0) return { nivel: 'vacia', valor: 0, puntos: 0, sugerencias: [] };

  const tieneMinus = /[a-zñáéíóú]/.test(clave);
  const tieneMayus = /[A-ZÑÁÉÍÓÚ]/.test(clave);
  const tieneNumero = /\d/.test(clave);
  const tieneSimbolo = /[^A-Za-z0-9ñÑáéíóúÁÉÍÓÚ]/.test(clave);

  const sugerencias: string[] = [];
  let puntos = 0;
  if (clave.length >= 8) puntos++;
  else sugerencias.push('Usa al menos 8 caracteres.');
  if (clave.length >= 12) puntos++;
  else sugerencias.push('Con 12 o más caracteres es más segura.');
  if (tieneMinus && tieneMayus) puntos++;
  else sugerencias.push('Combina mayúsculas y minúsculas.');
  if (tieneNumero) puntos++;
  else sugerencias.push('Agrega un número.');
  if (tieneSimbolo) puntos++;
  else sugerencias.push('Agrega un símbolo, por ejemplo ! # o @.');

  let nivel: NivelClave = puntos >= 4 ? 'fuerte' : puntos === 3 ? 'media' : 'debil';

  if (clave.length >= 15 && nivel === 'debil') nivel = 'media';
  if (clave.length < 8) nivel = 'debil';
  if (COMUNES.has(clave.toLowerCase())) {
    nivel = 'debil';
    sugerencias.unshift('Es una contraseña muy común: elige otra.');
  }
  if (/^(.)\1+$/.test(clave)) {
    nivel = 'debil';
    sugerencias.unshift('No repitas un solo carácter.');
  }

  return { nivel, valor: VALOR[nivel], puntos, sugerencias: nivel === 'fuerte' ? [] : sugerencias.slice(0, 2) };
}
