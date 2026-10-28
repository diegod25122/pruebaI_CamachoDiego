# ADR-002: Guardar las lecturas en el teléfono con expo-sqlite

## Estado
Aceptado.

## Fecha
2026-10-28

## Requisitos relacionados
R4 (registrar sin señal), R8 (registro a medias), R9 (pendientes por enviar) y R10 (corregir solo lo no enviado; una lectura por medidor y mes).

## Contexto
Durante la jornada el técnico puede pasar horas sin señal. Todo lo que registra tiene que quedar en el teléfono hasta que llegue a la oficina, y **no se puede volver a descargar**: si se pierde, la lectura se pierde. La app puede cerrarse en cualquier momento, incluso a mitad de una escritura. Además hay que consultar las lecturas por estado («cuántas faltan por enviar», «las pendientes en orden») e impedir dos lecturas del mismo medidor en el mismo mes. El volumen es pequeño: decenas de lecturas por jornada.

## Alternativas consideradas

| Alternativa | Ventajas en este proyecto | Desventajas en este proyecto |
|---|---|---|
| expo-sqlite | Cada escritura es atómica: si la app muere a mitad, la fila queda completa o no queda. Consultas con `WHERE envio IN (...)` para contar pendientes. `UNIQUE(medidor_codigo, periodo)` hace cumplir R10 en la propia base. El `UPDATE ... WHERE envio IN ('pendiente','revision')` impide corregir una enviada aunque la pantalla esté desactualizada. | Hay que escribir SQL y convertir filas (snake_case) a objetos. Hay que crear el esquema al abrir la app. Es una dependencia nativa (incluida en Expo Go). |
| AsyncStorage con un JSON | Muy simple de usar; ya se usa para la caché (ADR-003). | Cada cambio reescribe todo el arreglo: si la app se cierra durante la escritura, se puede corromper la lista completa. Sin consultas ni restricciones: contar pendientes o impedir duplicados es código manual que puede fallar. |
| WatermelonDB / Realm | Bases pensadas para sincronización. | Exigen compilación nativa propia (no funcionan en Expo Go), mucha configuración y un modelo de sincronización que este caso no necesita. |

## Decisión
Se usa expo-sqlite con dos tablas: `lecturas` (con `UNIQUE (medidor_codigo, periodo)`) y `borrador` (una sola fila, `CHECK (id = 1)`). El esquema se crea con `CREATE TABLE IF NOT EXISTS` y cada función de acceso espera `baseLista()`.

## Consecuencias
- Las lecturas sobreviven a cerrar la app y reiniciar el teléfono.
- R10 se cumple dos veces: en la pantalla y en la base (la base no deja insertar el duplicado).
- Obligación: todo acceso a SQLite pasa por `src/db/*Repo.ts`; las pantallas no escriben SQL.
- Desventaja: si el esquema cambia en una versión futura hay que escribir migraciones a mano.
- Desventaja: los datos de la oficina (medidores) no van aquí; conviven dos almacenamientos (SQLite y la caché de ADR-003) y hay que saber cuál usar.

## Verificación
- `src/db/database.ts`: esquema con `UNIQUE (medidor_codigo, periodo)`.
- `src/db/lecturasRepo.ts`: `corregirLectura` usa `WHERE id = ? AND envio IN ('pendiente', 'revision')` y lanza `ErrorNoEditable` si no cambió ninguna fila.
- En el teléfono: registrar en modo avión, quitar la app de recientes, reiniciar el teléfono → la lectura sigue en la lista.

## Uso de IA
La IA propuso separar los datos: caché de la oficina en AsyncStorage y lecturas del técnico en SQLite. Se aceptó porque las lecturas no se pueden recuperar si se pierden y necesitan integridad. Se descartó su primera idea de usar las mutaciones pausadas de TanStack Query como almacenamiento, porque no permiten corregir una lectura antes de enviarla (R10).
