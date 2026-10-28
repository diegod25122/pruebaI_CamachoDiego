// Carga los medidores de prueba en MockAPI.
//
//   node scripts/semilla.mjs https://TU-PROYECTO.mockapi.io/api/v1
//   node scripts/semilla.mjs https://TU-PROYECTO.mockapi.io/api/v1 --reiniciar
//
// --reiniciar borra todos los medidores y lecturas antes de cargar
// (útil para dejar la demo limpia antes de la defensa).

const [base, ...opciones] = process.argv.slice(2);
if (!base || !base.startsWith('https://')) {
  console.error('Uso: node scripts/semilla.mjs https://TU-PROYECTO.mockapi.io/api/v1 [--reiniciar]');
  process.exit(1);
}
const BASE = base.replace(/\/+$/, '');
const reiniciar = opciones.includes('--reiniciar');

// Casos pensados para probar R6: consumo = lectura - ultimaLectura y es
// anómalo si supera 3 × consumoPromedio.
const MEDIDORES = [
  { codigo: 'MED-000101', direccion: 'Vía a Nono km 12, lote 4', sector: 'Nono', numeroCuenta: '1100457', estado: 'Activo', ultimaLectura: 1520, fechaUltimaLectura: '2026-09-15', consumoPromedio: 18 },
  { codigo: 'MED-000102', direccion: 'Calle Principal y San Luis', sector: 'Lloa', numeroCuenta: '1100488', estado: 'Activo', ultimaLectura: 860, fechaUltimaLectura: '2026-09-16', consumoPromedio: 12 },
  { codigo: 'MED-000103', direccion: 'Barrio El Paraíso s/n', sector: 'Pacto', numeroCuenta: '1100512', estado: 'Activo', ultimaLectura: 3410, fechaUltimaLectura: '2026-09-17', consumoPromedio: 25 },
  { codigo: 'MED-000104', direccion: 'Vía Calacalí–La Independencia km 54', sector: 'Nanegalito', numeroCuenta: '1100533', estado: 'Activo', ultimaLectura: 512, fechaUltimaLectura: '2026-09-18', consumoPromedio: 9 },
  { codigo: 'MED-000105', direccion: 'Calle Quito N2-34', sector: 'Calacalí', numeroCuenta: '1100561', estado: 'Suspendido', ultimaLectura: 2290, fechaUltimaLectura: '2026-09-18', consumoPromedio: 30 },
  { codigo: 'MED-000106', direccion: 'Juan León Mera N24-56 y Wilson', sector: 'La Mariscal', numeroCuenta: '2204410', estado: 'Activo', ultimaLectura: 10450, fechaUltimaLectura: '2026-09-20', consumoPromedio: 40 },
  { codigo: 'MED-000107', direccion: 'Calle S43 y Oe7, conjunto Los Pinos', sector: 'Chillogallo', numeroCuenta: '3307721', estado: 'Activo', ultimaLectura: 7720, fechaUltimaLectura: '2026-09-21', consumoPromedio: 22 },
  { codigo: 'MED-000108', direccion: 'Pasaje Las Retamas 12', sector: 'Cumbayá', numeroCuenta: '4401193', estado: 'Corte programado', ultimaLectura: 4300, fechaUltimaLectura: '2026-09-22', consumoPromedio: 35 },
];

async function pedir(url, init) {
  const r = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...init });
  if (r.status === 404 && (!init || init.method === undefined)) return [];
  if (!r.ok) throw new Error(`${init?.method ?? 'GET'} ${url} → ${r.status}`);
  return r.json();
}

async function vaciar(recurso) {
  const filas = await pedir(`${BASE}/${recurso}`);
  for (const f of filas) await pedir(`${BASE}/${recurso}/${f.id}`, { method: 'DELETE' });
  console.log(`  ${recurso}: ${filas.length} borrados`);
}

if (reiniciar) {
  console.log('Reiniciando…');
  await vaciar('lecturas');
  await vaciar('medidores');
}

const existentes = await pedir(`${BASE}/medidores`);
const codigos = new Set(existentes.map((m) => m.codigo));
for (const m of MEDIDORES) {
  if (codigos.has(m.codigo)) {
    console.log(`  ${m.codigo} ya existe`);
    continue;
  }
  await pedir(`${BASE}/medidores`, { method: 'POST', body: JSON.stringify(m) });
  console.log(`  ${m.codigo} creado (${m.sector})`);
}
console.log('Listo.');
