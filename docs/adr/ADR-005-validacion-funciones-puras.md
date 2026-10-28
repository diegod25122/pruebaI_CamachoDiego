# ADR-005: Validar con funciones TypeScript puras, sin librería de esquemas

## Estado
Aceptado.

## Fecha
2026-10-28

## Requisitos relacionados
R2 (formato `MED-` + 6 dígitos), R5 (reglas de los tres estados), R6 (consumo y anomalía) y R7 (cuándo la foto es obligatoria). También los datos que llegan de la oficina (R3).

## Contexto
Hay dos tipos de datos que validar:
1. **Lo que escribe el técnico**: el código del medidor (R2) y la captura (R5–R7), con reglas que dependen unas de otras (si el medidor es normal la lectura es obligatoria; si el consumo supera el triple, la foto pasa a ser obligatoria).
2. **Lo que llega de MockAPI**: puede traer números como texto o campos vacíos.

Las mismas reglas se usan en dos lugares: en las pantallas del registro y en el sincronizador, que vuelve a evaluar la lectura con datos frescos antes de enviarla (ADR-008). Los mensajes deben estar en español y decir qué falta.

## Alternativas consideradas

| Alternativa | Ventajas en este proyecto | Desventajas en este proyecto |
|---|---|---|
| Funciones puras propias (`validarCodigoMedidor`, `evaluarCaptura`, `parseMedidor`) | Sin dependencias. Las reglas cruzadas (estado → lectura → consumo → foto) se leen como el enunciado. Devuelven además el consumo, la anomalía y si la foto es obligatoria, que la pantalla necesita mostrar. Se prueban con Jest sin teléfono. | Hay que escribir y mantener cada regla y cada mensaje. No hay un esquema declarativo del dato. |
| Zod | Esquemas declarativos; valida y tipa a la vez los datos de MockAPI. | Las reglas cruzadas se escriben con `refine`/`superRefine`, que terminan siendo funciones igual; los mensajes por defecto están en inglés. Una dependencia para lo que hacen unas pocas funciones. |
| Yup | Muy usado con formularios. | Mismo problema con las reglas cruzadas; tipado de TypeScript más débil. |

## Decisión
Las reglas viven en `src/domain` como funciones sin React ni red:
- `validarCodigoMedidor` → `^MED-\d{6}$` con mensajes específicos («faltan 2 dígitos»).
- `evaluarCaptura(datos, referencia)` → devuelve `{ lectura, consumo, anomalo, veces, fotoObligatoria, errores }`.
- `parseMedidor` → convierte y descarta datos inválidos de la oficina.
- Lectura en m³ enteros; anómalo si `consumo > 3 × promedio` (el triple exacto no es anómalo).

## Consecuencias
- Una sola fuente de verdad para las reglas: la pantalla y el sincronizador no pueden contradecirse.
- R2 se cumple en dos capas: la pantalla no navega con un código inválido y el hook de consulta tiene `enabled: false`.
- Desventaja: si las reglas crecen mucho, mantener validaciones a mano será más costoso que un esquema.
- Desventaja: el tipado de los datos de MockAPI se asegura con `parseMedidor`, no con un esquema; si MockAPI cambia un campo hay que actualizar la función.
- Obligación: cada regla nueva lleva su prueba en `src/domain/__tests__`.

## Verificación
- `npm test`: `reglas.test.ts` y `medidor.test.ts` (código incompleto, tres estados, triple exacto, lectura menor que la anterior).
- En el teléfono: `MED-1234` muestra «faltan 2 dígitos» y no consulta.

## Uso de IA
La IA escribió las funciones y sus pruebas a partir de los requisitos. Se discutió usar Zod para los datos de MockAPI y se descartó porque las reglas importantes son cruzadas y había que escribirlas como funciones de todos modos. Se revisó que «supera el triple» se implementara como mayor estricto y se agregó una prueba para ese caso límite.
