# ADR-014: Calcular la seguridad de la contraseña con una función propia

## Estado
Aceptado.

## Fecha
2026-11-03

## Requisitos relacionados
Deber 5 · punto 1 (indicador débil, media o fuerte debajo del campo mientras se escribe).

## Contexto
En crear cuenta y en cambiar contraseña hay que mostrar, mientras se escribe, si la contraseña es débil, media o fuerte. Se recalcula en cada tecla, sin red. Firebase exige 6 caracteres y la app pide 8 (taller); la guía NIST SP 800-63B-4 recomienda 15 cuando la contraseña es el único factor.

## Alternativas consideradas

| Alternativa | Ventajas en este proyecto | Desventajas en este proyecto |
|---|---|---|
| Función pura propia (`evaluarFortaleza` en `src/lib/fortalezaClave.ts`) | Sin dependencias. Reglas claras y explicables en la defensa. Devuelve el nivel y sugerencias en español. Se prueba con Jest. | Es una estimación simple: no detecta patrones como "Ecuador2026!" que un atacante probaría primero. |
| zxcvbn (`@zxcvbn-ts/core`) | Estimación realista basada en diccionarios y patrones. | Paquete pesado (diccionarios), mensajes en inglés salvo con otro paquete de idioma; una dependencia grande para un indicador. |
| Usar la política de contraseñas de Firebase | La valida el servidor. | Solo responde al enviar, no mientras se escribe. |

## Decisión
`evaluarFortaleza(clave)` suma un punto por: 8+ caracteres, 12+ caracteres, mayúsculas y minúsculas, número y símbolo. Con 4 o más puntos es fuerte, con 3 media y si no débil. Siempre es débil con menos de 8 caracteres, si es una contraseña muy común o si repite un solo carácter. Con 15 o más caracteres es al menos media (NIST). El componente `IndicadorClave` la muestra con tres barras animadas (ADR-013).

## Consecuencias
- El indicador orienta, pero **no bloquea**: el mínimo obligatorio sigue siendo 8 caracteres (`validarClave`).
- Desventaja: la estimación es básica; una contraseña predecible con símbolos puede salir "fuerte".

## Verificación
- `npm test`: `src/lib/__tests__/cuenta.test.ts` (vacía, débil, media, fuerte, comunes, repetidas, NIST).
- En el teléfono: escribir `medidores` → débil; `Medidor26` → media; `RutaLecturas#2026` → fuerte.

## Uso de IA
La IA propuso zxcvbn y una función propia; se eligió la función propia para no agregar una dependencia grande y poder explicar cada regla.
