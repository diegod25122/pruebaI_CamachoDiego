// Clases de texto que se repiten en toda la app (Uniwind / Tailwind).
// Son textos completos a propósito: Tailwind solo genera las clases que
// encuentra escritas tal cual en el código.
export const tx = {
  titulo: 'text-[26px] font-black text-noche tracking-tight',
  subtitulo: 'text-lg font-extrabold text-noche',
  etiqueta: 'text-xs font-extrabold text-tenue tracking-widest uppercase',
  cuerpo: 'text-base text-noche leading-[22px]',
  pequeno: 'text-[13px] text-tenue leading-[18px]',
  codigo: 'font-mono font-bold tracking-wide',
  error: 'text-sm font-bold text-alerta',
} as const;
