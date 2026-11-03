// Reanimated interpola colores en JavaScript, así que necesita los valores
// reales. Los leemos de global.css con useCSSVariable: un solo lugar para
// los colores, también para las animaciones.
import { useCSSVariable } from 'uniwind';

export function useColor(nombre: string): string {
  const valor = useCSSVariable(`--color-${nombre}`);
  return typeof valor === 'string' ? valor : '#000000';
}

export function useColores<T extends string>(nombres: readonly T[]): Record<T, string> {
  const valores = useCSSVariable(nombres.map((n) => `--color-${n}`));
  const lista = Array.isArray(valores) ? valores : [valores];
  const resultado = {} as Record<T, string>;
  nombres.forEach((n, i) => {
    const v = lista[i];
    resultado[n] = typeof v === 'string' ? v : '#000000';
  });
  return resultado;
}
