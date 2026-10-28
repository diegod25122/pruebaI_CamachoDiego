# ADR-004: Compartir el registro entre pantallas con React Context y guardarlo en SQLite en cada cambio

## Estado
Aceptado.

## Fecha
2026-10-28

## Requisitos relacionados
R8 (registro en varias pantallas que se puede continuar o descartar tras cerrar la app). También R10 (corregir una lectura usa el mismo flujo).

## Contexto
El registro de una lectura ocupa tres pantallas (ADR-001): estado y lectura, consumo y foto, revisión. Las tres leen y modifican los mismos datos. Si la app se cierra en cualquier paso, al abrirla hay que ofrecer continuar con todo lo ingresado o descartarlo (R8). Solo puede haber un registro en curso a la vez. Ya existe SQLite en el proyecto (ADR-002).

## Alternativas consideradas

| Alternativa | Ventajas en este proyecto | Desventajas en este proyecto |
|---|---|---|
| React Context + escritura del borrador en SQLite en cada cambio | Sin dependencias: Context viene con React. El borrador queda guardado en el mismo instante en que el técnico escribe, en la misma base que las lecturas. | Context vuelve a dibujar todas las pantallas que lo usan en cada cambio (aceptable con tres pantallas). Hay que encadenar las escrituras para que la última siempre sea la que queda. |
| Zustand con `persist` | Estado global simple y con persistencia integrada. | Una dependencia más; su persistencia usa AsyncStorage (JSON completo), con el riesgo de escritura a medias descrito en ADR-002. Resuelve algo que Context + SQLite ya cubren. |
| Parámetros de ruta entre pasos | Sin estado global. | Se pierden al cerrar la app: no cumple R8. La foto y los textos largos no caben bien en la URL. |
| Redux Toolkit + redux-persist | Herramientas de depuración. | Mucha estructura para un solo formulario; dos dependencias sin un requisito que las pida. |

## Decisión
`BorradorProvider` (React Context) mantiene el borrador en memoria y lo escribe en la tabla `borrador` de SQLite en cada cambio, en una cola de promesas para conservar el orden. El borrador guarda: el paso actual, el código, una copia del medidor, la referencia (lectura anterior y promedio), los datos capturados y si es una corrección. Al abrir la app, `ModalBorrador` ofrece «Continuar registro» (navega al paso guardado) o «Descartar».

## Consecuencias
- Cerrar la app no pierde nada: lo último escrito ya está en SQLite.
- Continuar funciona sin señal, porque el borrador lleva su propia copia de los datos del medidor.
- Descartar borra la foto nueva, pero nunca la foto original de una lectura que se estaba corrigiendo.
- Desventaja: se escribe en la base en cada tecla. Con un solo registro pequeño no se nota, pero no escalaría a formularios grandes.
- Riesgo: si se muestran dos registros a la vez se mezclarían; por eso la tabla solo admite una fila y la app pregunta qué hacer con el anterior antes de empezar otro.

## Verificación
- `src/state/borrador.tsx`: `persistir` encadena `guardarBorrador`.
- `src/db/database.ts`: tabla `borrador` con `CHECK (id = 1)`.
- `src/components/ModalBorrador.tsx` y `src/state/useRegistro.ts` (guarda el paso al entrar a cada pantalla).
- En el teléfono: llegar al paso 2, quitar la app de recientes, abrirla → aparece «Registro sin terminar» y al continuar los datos siguen ahí.

## Uso de IA
La IA propuso Context más una tabla de borrador en SQLite. Se aceptó porque reutiliza la base de ADR-002 y no agrega dependencias. Se evaluó su mención de Zustand con `persist` y se descartó por depender de AsyncStorage. Se le pidió que el aviso de «registro sin terminar» se muestre una sola vez por apertura, y no cada vez que se vuelve al inicio.
