// R1: técnicos con datos quemados .

export interface Tecnico {
  codigo: string;
  nombre: string;
  zona: string;
}

interface TecnicoConClave extends Tecnico {
  clave: string;
}

const TECNICOS: TecnicoConClave[] = [
  { codigo: 'EMP-1001', clave: 'agua2026', nombre: 'María Guamán', zona: 'Ruta Noroccidente' },
  { codigo: 'EMP-1002', clave: 'lloa2026', nombre: 'Luis Tipán', zona: 'Ruta Sur' },
];

export function normalizarCodigoEmpleado(texto: string): string {
  return texto.trim().toUpperCase();
}

// Devuelve el técnico sin su clave: la clave nunca se guarda en el teléfono.
export function autenticar(codigo: string, clave: string): Tecnico | null {
  const buscado = normalizarCodigoEmpleado(codigo);
  const tecnico = TECNICOS.find((t) => t.codigo === buscado && t.clave === clave);
  if (!tecnico) return null;
  return { codigo: tecnico.codigo, nombre: tecnico.nombre, zona: tecnico.zona };
}
