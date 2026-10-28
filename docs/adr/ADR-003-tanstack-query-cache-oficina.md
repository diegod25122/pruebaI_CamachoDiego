# ADR-003: Consultar la oficina con fetch y TanStack Query con caché persistida en AsyncStorage

## Estado
Aceptado.

## Fecha
2026-10-28

## Requisitos relacionados
R3 (datos del medidor y caché de lo consultado). También R2 (no consultar con un código incompleto).

## Contexto
El sistema de la oficina (MockAPI) entrega los datos de cada medidor. Si el técnico vuelve a consultar el mismo medidor durante la jornada, no debe esperar una nueva descarga, y si entra en modo avión debe seguir viendo lo que ya consultó (R3), incluso si la app se cerró entre medio. La consulta solo debe hacerse con un código válido (R2). Los datos de la oficina se pueden volver a descargar, así que perder la caché no es grave.

## Alternativas consideradas

| Alternativa | Ventajas en este proyecto | Desventajas en este proyecto |
|---|---|---|
| TanStack Query + `@tanstack/react-query-persist-client` + `@tanstack/query-async-storage-persister` + AsyncStorage | Caché por clave (`['medidor', codigo]`). `staleTime` decide cuándo no volver a descargar. `enabled` impide consultar con código inválido (R2). Sin red no lanza la consulta y muestra lo guardado. El persister guarda la caché en el teléfono y la restaura al abrir. | Cuatro paquetes. Hay que entender `staleTime`, `gcTime` y `maxAge`; si `gcTime` es menor que `maxAge`, la consulta se borra antes de guardarse y la caché queda vacía. |
| `fetch` + `useEffect` + caché propia en AsyncStorage | Sin librerías. | Habría que programar a mano: estado de carga, errores, reintentos, vigencia de cada dato, qué hacer sin red y restaurar al abrir. Mucho código propio para lo que pide R3. |
| SWR | API simple con caché por clave. | No tiene persistencia oficial en React Native ni control de red equivalente al `onlineManager`; habría que construirlo. |

Para las peticiones se comparó `fetch` (incluido en React Native) con **axios**: axios aporta interceptores y cancelación, pero aquí solo hay tres llamadas simples, así que no justifica una dependencia más.

## Decisión
Se usa TanStack Query con `fetch` nativo. Configuración:
- Medidor encontrado: `staleTime` 12 h (una jornada). Medidor no encontrado: `staleTime` 0 (se vuelve a preguntar).
- `gcTime` = `maxAge` del persister = 72 h.
- Solo se persisten las consultas exitosas y nunca las claves `['local', ...]` (las lecturas viven en SQLite, ADR-002).
- `enabled: codigo !== null`, donde `codigo` solo existe si pasó la validación (ADR-005).

## Consecuencias
- Con señal, la segunda consulta del mismo medidor no descarga nada; sin señal, muestra los datos guardados con la hora en que se obtuvieron.
- La caché sobrevive a cerrar la app.
- Desventaja: un dato de la caché puede estar viejo (hasta 12 h). Por eso una lectura registrada sin señal queda «pendiente de verificar» y se compara con datos frescos antes de enviarla (ADR-008).
- Desventaja: cuatro dependencias para un solo requisito.
- Obligación: las claves de caché salen solo de `src/query/keys.ts`.

## Verificación
- `src/query/queryClient.ts`: `STALE_MEDIDOR`, `MAX_AGE_CACHE`, `shouldDehydrateQuery`.
- `src/query/hooks.ts`: `useMedidor` con `enabled` y `staleTime`.
- En el teléfono: consultar `MED-000101` con señal, activar modo avión, consultarlo otra vez → aparecen los siete datos con «Sin señal · datos guardados».

## Uso de IA
Se le pidió a la IA cómo cumplir R3 sin señal y tras cerrar la app. Propuso TanStack Query con persistencia, que se aceptó. Se ajustó su configuración inicial para que un «medidor no encontrado» no quede en caché toda la jornada (`staleTime` 0 si el resultado es nulo), y se le pidió excluir de la persistencia las consultas locales.
