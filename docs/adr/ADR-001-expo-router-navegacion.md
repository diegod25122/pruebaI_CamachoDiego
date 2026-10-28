# ADR-001: Usar Expo Router con rutas protegidas para la navegación

## Estado
Aceptado.

## Fecha
2026-10-28

## Requisitos relacionados
R1 (solo se entra a la app con sesión) y R8 (registro en varias pantallas y volver al paso pendiente).

## Contexto
La app tiene un ingreso, una pantalla de inicio con la búsqueda de medidores y la lista de lecturas, la ficha del medidor, un registro de lectura en tres pasos y el detalle de cada lectura. Sin sesión, el técnico solo debe ver el ingreso; con sesión, nunca debe volver a verlo hasta que cierre sesión (R1). Si la app se cierra a mitad del registro, al abrirla hay que llevar al técnico directamente al paso en que se quedó (R8). El proyecto se crea con la plantilla de Expo SDK 57.

## Alternativas consideradas

| Alternativa | Ventajas en este proyecto | Desventajas en este proyecto |
|---|---|---|
| Expo Router (rutas por archivos) | Viene en la plantilla: no agrega dependencias. `Stack.Protected` decide por sí solo qué rutas existen con o sin sesión (R1). Se puede navegar a una ruta concreta (`/registro/foto`) para retomar el paso pendiente (R8). | Estructura de carpetas obligatoria: todo archivo dentro de `src/app` es una ruta. Es una capa sobre React Navigation que hay que entender cuando algo falla. |
| React Navigation configurado a mano | Control total de cada navegador; mucha documentación. | Agrega dependencias y configuración que la plantilla ya resuelve. La protección por sesión hay que programarla con condicionales en el árbol de navegadores. |
| Una sola pantalla de registro con pasos condicionales | No necesita rutas para el registro. | El botón atrás de Android no retrocede entre pasos sin código extra; un componente gigante mezcla la lógica de los tres pasos. |

## Decisión
Se usa Expo Router. Las pantallas internas se envuelven en `<Stack.Protected guard={sesion !== null}>` y el ingreso en `<Stack.Protected guard={sesion === null}>`. El registro son tres rutas: `/registro/estado`, `/registro/foto`, `/registro/resumen`.

## Consecuencias
- No se agrega ninguna dependencia para navegar.
- Al iniciar o cerrar sesión no hay que redirigir a mano: al cambiar la sesión, el Stack muestra las rutas permitidas.
- Los componentes que no son pantallas van en `src/components`, fuera de `src/app`.
- La navegación no guarda lo que el técnico escribe; eso se decide en ADR-004.
- Riesgo: si se navega al paso pendiente antes de leer el borrador guardado, el paso se vería vacío. Por eso `ModalBorrador` solo actúa cuando el borrador ya está cargado (`cargado === true`).

## Verificación
- `src/app/_layout.tsx`: los dos bloques `Stack.Protected`.
- En el teléfono: tras iniciar sesión, el botón atrás no vuelve al ingreso; tras «Salir», no se puede volver a la app.
- `src/app/` contiene solo pantallas y el layout.
- `package.json` no tiene paquetes de React Navigation agregados a mano.

## Uso de IA
Se le pidió a la IA la estructura de pantallas para un registro en varios pasos. Propuso Expo Router con `Stack.Protected`, que se aceptó porque evita lógica de redirección manual. Se descartó guardar el paso actual en los parámetros de la ruta, porque se pierden al cerrar la app y no resuelven R8; el paso se guarda en el borrador (ADR-004).
