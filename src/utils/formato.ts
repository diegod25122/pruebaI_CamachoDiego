// Formatos en español sin depender de Intl (funciona igual en cualquier Android).

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

export function miles(n: number): string {
  const signo = n < 0 ? '-' : '';
  const [entero, decimales] = Math.abs(n).toString().split('.');
  const conPuntos = entero.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return signo + conPuntos + (decimales ? `,${decimales.slice(0, 1)}` : '');
}

export function m3(n: number | null): string {
  return n === null ? '—' : `${miles(n)} m³`;
}

function dosDigitos(n: number): string {
  return String(n).padStart(2, '0');
}

// Acepta '2026-09-14' o una fecha ISO completa.
export function fecha(iso: string): string {
  if (!iso) return '—';
  const soloFecha = /^\d{4}-\d{2}-\d{2}$/.test(iso);
  const d = soloFecha ? new Date(`${iso}T12:00:00`) : new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getDate()} ${MESES[d.getMonth()].slice(0, 3)} ${d.getFullYear()}`;
}

export function fechaHora(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${fecha(iso)} · ${dosDigitos(d.getHours())}:${dosDigitos(d.getMinutes())}`;
}

export function hora(ms: number): string {
  const d = new Date(ms);
  return `${dosDigitos(d.getHours())}:${dosDigitos(d.getMinutes())}`;
}

export function nombrePeriodo(periodo: string): string {
  const [anio, mes] = periodo.split('-').map(Number);
  if (!anio || !mes) return periodo;
  return `${MESES[mes - 1]} ${anio}`;
}

export function veces(n: number | null): string {
  if (n === null) return '—';
  return `${n.toFixed(1).replace('.', ',')}×`;
}
