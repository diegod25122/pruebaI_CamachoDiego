# ADR-009: Guardar la sesión del técnico con expo-secure-store, sin guardar la clave

## Estado
Aceptado.

## Fecha
2026-10-28

## Requisitos relacionados
R1 (el técnico se identifica con código y clave; la app lo recuerda hasta que cierre sesión).

## Contexto
Al iniciar la jornada el técnico ingresa su código de empleado y su clave. Los usuarios son datos quemados (lo permite la prueba). La app debe recordarlo aunque se cierre o se reinicie el teléfono, hasta que toque «Salir». Lo que se guarda identifica a un empleado, y el teléfono se usa en la calle y puede perderse.

## Alternativas consideradas

| Alternativa | Ventajas en este proyecto | Desventajas en este proyecto |
|---|---|---|
| expo-secure-store | Guarda el dato cifrado con el Keystore de Android; incluido en Expo Go; API de tres funciones. | Pensado para datos pequeños (unos 2 KB por valor); es asíncrono, así que al abrir la app hay que esperar a leerlo antes de decidir qué pantalla mostrar. |
| AsyncStorage | Ya está en el proyecto (ADR-003); sin dependencia nueva. | Guarda en texto plano: cualquiera con acceso al almacenamiento de la app podría leer o falsificar la sesión. |
| SQLite (ADR-002) | Ya está en el proyecto. | También en texto plano; mezcla datos de identidad con datos de trabajo. |

## Decisión
Se usa expo-secure-store con la clave `sesion-tecnico`. Se guarda `{ tecnico: { codigo, nombre, zona }, inicio }`. **La clave del técnico nunca se guarda**: `autenticar()` la compara contra la lista quemada en `src/domain/tecnicos.ts` y devuelve el técnico sin ella. Mientras se lee la sesión, la pantalla de bienvenida (splash) sigue visible.

## Consecuencias
- El técnico sigue identificado tras cerrar la app o reiniciar el teléfono; al tocar «Salir» se borra la sesión y vuelve el ingreso (ADR-001).
- Cerrar sesión no borra las lecturas pendientes: quedan en el teléfono y se envían cuando haya señal (se avisa antes de salir).
- Desventaja: una dependencia más solo para R1.
- Desventaja: los usuarios y claves están en el código fuente; en un sistema real se validarían contra un servidor.

## Verificación
- `src/state/sesion.tsx` y `src/domain/tecnicos.ts`.
- `npm test`: «autentica con código y clave, sin devolver la clave».
- En el teléfono: iniciar sesión, quitar la app de recientes y abrirla → sigue dentro; tocar «Salir» → pide código y clave.

## Uso de IA
Le pregunté a la IA dónde guardar la sesión. Me propuso expo-secure-store y lo acepté porque cifra los datos y AsyncStorage no. También le pedí que no se guarde la clave, solo el código y el nombre del técnico.
