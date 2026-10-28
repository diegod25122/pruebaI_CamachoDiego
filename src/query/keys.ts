// Claves de caché en un solo lugar.
export const claves = {
  medidor: (codigo: string) => ['medidor', codigo] as const,
  lecturasOficina: (codigo: string, periodo: string) => ['lecturasOficina', codigo, periodo] as const,
  // Datos que vienen de SQLite (no de la red).
  locales: ['local', 'lecturas'] as const,
  local: (id: string) => ['local', 'lecturas', id] as const,
};
