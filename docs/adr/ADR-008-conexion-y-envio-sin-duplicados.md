# ADR-008: Detectar la conexión con expo-network y enviar las pendientes con una cola propia en SQLite e identificador único (expo-crypto)

## Estado
Aceptado.

## Fecha
2026-10-28

## Requisitos relacionados
R9 (envío automático, sin duplicados aunque se corte la señal; conexión y pendientes visibles en todas las pantallas) y R4 (comparar con la lectura anterior al recuperar la conexión). También R10 (lo enviado no se corrige; un registro por medidor y mes también en la oficina).

## Contexto
Las lecturas se guardan en SQLite (ADR-002) con un estado de envío. Cuando vuelve la señal deben enviarse solas. El caso difícil: el envío llega a la oficina pero la respuesta no llega al teléfono porque se cortó la señal. Si el teléfono reintenta sin más, la oficina tendría dos lecturas iguales. Antes de enviar, una lectura registrada sin señal debe compararse con la lectura anterior actual de la oficina (R4). La barra de conexión y pendientes debe verse en todas las pantallas. MockAPI no ofrece claves de idempotencia propias.

## Alternativas consideradas

**Detección de la conexión**

| Alternativa | Ventajas en este proyecto | Desventajas en este proyecto |
|---|---|---|
| expo-network | Módulo de Expo, incluido en Expo Go; avisa cambios de red y si hay internet (`isInternetReachable`). Se conecta al `onlineManager` de TanStack Query (ADR-003). | `isInternetReachable` puede llegar como `null` mientras Android lo averigua; hay que tratarlo como «con red» hasta que diga `false`. |
| @react-native-community/netinfo | Muy usado, más opciones de configuración. | Otra dependencia que hace lo mismo que el módulo oficial de Expo. |

**Envío de pendientes**

| Alternativa | Ventajas en este proyecto | Desventajas en este proyecto |
|---|---|---|
| Cola propia sobre SQLite + `clientId` (UUID) + comprobar en la oficina antes del POST | Cada lectura tiene un estado visible (`pendiente → enviando → enviada`, o `revision`, `rechazada`). Se puede corregir mientras no se envía (R10). Antes de enviar se verifica con datos frescos (R4). El `clientId` permite saber si un envío anterior sí llegó. | Hay que programar la cola, los disparadores y los estados. Una consulta extra a la oficina antes de cada envío. |
| Mutaciones pausadas de TanStack Query persistidas | Se reanudan solas al volver la red. | No se pueden corregir antes de enviarse (R10), no se pueden consultar por estado y no hay un lugar para verificar contra la oficina (R4). No evitan el duplicado si se pierde la respuesta. |
| Tarea en segundo plano (expo-background-task) | Envía aunque la app esté cerrada. | El sistema decide cuándo se ejecuta (puede tardar mucho), otra dependencia y más permisos; R9 no exige enviar con la app cerrada. |

**Identificador único**: `Crypto.randomUUID()` de expo-crypto frente a `Date.now()` o `Math.random()`, que pueden repetirse entre lecturas creadas en el mismo instante o no son aleatorios de verdad.

## Decisión
- `src/sync/conexion.ts` escucha expo-network, alimenta el `onlineManager` de TanStack Query y la barra de conexión.
- Cada lectura nace con `id = Crypto.randomUUID()`, que viaja a la oficina como `clientId`.
- `sincronizar()` procesa las lecturas `pendiente` o `enviando` en orden. Para cada una:
  1. Trae el medidor actual de la oficina y vuelve a evaluar las reglas (ADR-005). Si no cumple, queda `revision` y no se envía (R4).
  2. Consulta las lecturas de la oficina de ese medidor y mes. Si ya está su `clientId`, la marca `enviada` sin reenviar. Si hay otra lectura, la marca `rechazada` (R10).
  3. Marca `enviando`, hace el POST y la marca `enviada`. Si se corta la señal, vuelve a `pendiente`.
- Nunca corren dos sincronizaciones a la vez.
- Disparadores: al recuperar la señal, al volver a la app, al guardar una lectura y cada 20 s si quedan pendientes.
- `BarraConexion` va en el layout raíz, fuera del Stack, así aparece en todas las pantallas.

## Consecuencias
- Una lectura llega una sola vez a la oficina aunque la señal se corte durante el envío.
- El técnico ve en cada pantalla si tiene señal y cuántas lecturas le quedan.
- Desventaja: las lecturas solo se envían con la app abierta (en primer plano).
- Desventaja: cada envío hace dos consultas antes del POST (medidor y lecturas del mes); con señal débil tarda más.
- Riesgo: si dos teléfonos registran el mismo medidor sin señal, el segundo en enviar queda `rechazada`; la app lo informa, pero hay que resolverlo en la oficina.

## Verificación
- `npm test`: `src/sync/__tests__/sincronizador.test.ts` («si la señal se corta durante el envío, al reintentar NO la duplica», rechazo por duplicado, lectura anómala sin foto queda en revisión).
- `src/sync/sincronizador.ts` (pasos 1–3) y `src/sync/SyncProvider.tsx` (disparadores).
- En el teléfono: registrar en modo avión, quitar el modo avión sin tocar nada → la barra pasa a «Enviando…» y luego a «Todo enviado»; en MockAPI hay una sola lectura con su `clientId`.

## Uso de IA
Se le planteó a la IA el problema del corte de señal a mitad de envío. Propuso el `clientId` creado en el teléfono y comprobar en la oficina antes de reenviar, que se aceptó. Se descartó su mención de usar mutaciones persistidas de TanStack Query para el envío, por R10 y R4. Se le pidió una prueba automática que simule la oficina recibiendo el POST sin devolver la respuesta.
