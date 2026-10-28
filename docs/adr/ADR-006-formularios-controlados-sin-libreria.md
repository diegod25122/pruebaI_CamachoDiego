# ADR-006: Manejar los formularios con componentes controlados de React Native, sin librería de formularios

## Estado
Aceptado.

## Fecha
2026-10-28

## Requisitos relacionados
R1 (ingreso), R5 (campos según el estado), R6 (casilla de confirmación) y R8 (lo escrito debe sobrevivir al cierre de la app).

## Contexto
Hay dos formularios: el ingreso (código y clave) y la captura de la lectura, repartida en tres pantallas (ADR-001). En la captura, los campos aparecen o desaparecen según el estado del medidor, y cada cambio debe guardarse de inmediato en el borrador (ADR-004) para cumplir R8. Las reglas de validación ya están decididas en ADR-005. Los errores se muestran al tocar «Siguiente», no mientras el técnico escribe.

## Alternativas consideradas

| Alternativa | Ventajas en este proyecto | Desventajas en este proyecto |
|---|---|---|
| `TextInput` controlados con estado (`useState` o el borrador) + componente propio `Campo` | Sin dependencias. El valor de cada campo es directamente el del borrador, así que se guarda en cada cambio sin pasos extra. Los errores vienen de `evaluarCaptura` (ADR-005). | Hay que escribir a mano cuándo se muestran los errores y limpiar campos que dejan de aplicar (p. ej. borrar la lectura si el medidor pasa a inaccesible). |
| React Hook Form | Menos renderizados; manejo de errores y campos integrado. | Su estado vive dentro de la librería: para cumplir R8 habría que sincronizarlo con el borrador en cada cambio (`watch`), duplicando el estado. Formulario repartido en tres pantallas requiere un contexto extra. Una dependencia más. |
| Formik | Muy conocido. | Mismos problemas que React Hook Form y más renderizados; su mantenimiento es menos activo. |

## Decisión
Componentes controlados. El valor de cada campo del registro sale de `borrador.datos` y cada `onChangeText` llama a `cambiarDatos`. El componente `Campo` agrupa etiqueta, entrada, ayuda y error. Los errores de cada paso se muestran solo después de intentar avanzar (`mostrarErrores`), filtrados por paso con `erroresDe(errores, CAMPOS_PASO_1)`.

## Consecuencias
- El borrador es la única fuente de los datos del formulario; no hay estado duplicado.
- La lectura usa teclado numérico y se filtran los caracteres que no son dígitos.
- Al elegir «Inaccesible» se borra la lectura escrita, para no enviar un dato que la regla prohíbe.
- Desventaja: cada pantalla vuelve a dibujarse en cada tecla (aceptable con pocos campos).
- Desventaja: la lógica de «mostrar errores» se repite en cada paso.

## Verificación
- `src/components/Campo.tsx`.
- `src/app/registro/estado.tsx`: `elegirEstado` limpia la lectura al pasar a inaccesible; `siguiente` usa `CAMPOS_PASO_1`.
- En el teléfono: tocar «Siguiente» sin elegir estado muestra el error; elegir Inaccesible oculta el campo de lectura.

## Uso de IA
La IA propuso componentes controlados unidos al borrador. Se evaluó React Hook Form, que la IA mencionó como opción común, y se descartó porque obligaba a duplicar el estado con el borrador de R8. Se pidió que los errores no aparezcan antes de intentar avanzar, para no mostrar el formulario en rojo apenas se abre.
