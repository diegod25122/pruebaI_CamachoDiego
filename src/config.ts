// Configuración del sistema de la oficina (simulado con MockAPI).
// Pega aquí la URL de tu proyecto de MockAPI, sin la barra final ni el recurso.

export const MOCKAPI_BASE_URL = 'https://6ae1f514bbb5412922996c7d.mockapi.io/';

export const isMockApiConfigured = !MOCKAPI_BASE_URL.includes('TU-PROYECTO');

export const RECURSO_MEDIDORES = 'medidores';
export const RECURSO_LECTURAS = 'lecturas';

// R6: el consumo es anómalo si supera el triple del promedio mensual.
export const FACTOR_ANOMALIA = 3;

// Si cambias la forma de los datos guardados en caché, sube este valor y
// TanStack Query descarta la caché vieja al abrir la app.
export const CACHE_BUSTER = 'ruta-lecturas-v1';

// Tiempo máximo de espera de cada petición a la oficina.
export const TIMEOUT_MS = 12_000;
