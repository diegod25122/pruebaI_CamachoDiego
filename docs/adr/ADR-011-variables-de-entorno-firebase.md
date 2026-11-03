# ADR-011: Guardar la configuración de Firebase en variables de entorno `EXPO_PUBLIC_` (`.env.local`)

## Estado
Aceptado.

## Fecha
2026-11-03

## Requisitos relacionados
R1 y el Deber 5 (conexión con Firebase), siguiendo el taller.

## Contexto
Firebase entrega seis valores (`apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`). No son secretos: viajan dentro de la app y cualquiera podría leerlos; la seguridad la ponen la consola y las reglas. Aun así, no conviene subirlos al repositorio (cada estudiante usa su propio proyecto) y debe poder cambiarse de proyecto sin tocar el código.

## Alternativas consideradas

| Alternativa | Ventajas en este proyecto | Desventajas en este proyecto |
|---|---|---|
| Variables `EXPO_PUBLIC_*` en `.env.local` (+ `.env.example` en el repo) | Expo las lee solo, sin librerías. `.env*.local` ya está en `.gitignore`. Cambiar de proyecto es cambiar un archivo. | Hay que reiniciar con `npx expo start -c` al cambiarlas. EAS Build ignora `.env.local` porque está en `.gitignore`: hace falta un `.easignore`. |
| Escribir los valores en `src/config/firebase.ts` | Lo más simple. | Quedan en GitHub y atados a un proyecto. |
| `app.config.js` con `extra` + `expo-constants` | Centraliza la configuración. | Más código para lo mismo que Expo ya resuelve con `EXPO_PUBLIC_`. |

## Decisión
`src/config/firebase.ts` lee `process.env.EXPO_PUBLIC_FIREBASE_*`. En el repositorio va `.env.example` con valores de ejemplo; los reales van en `.env.local`.

## Consecuencias
- Los valores reales no llegan a GitHub.
- Desventaja: quien clone el repositorio debe crear su `.env.local` antes de ejecutar.
- Riesgo: si falta `.env.local`, Firebase falla con `auth/invalid-api-key`; `mensajeDeError` lo traduce a "Revisa el archivo .env.local".
- Para el APK con EAS: `eas build` sube la carpeta excluyendo lo que dice `.gitignore`, y ahí está `.env.local`. Por eso el proyecto tiene un `.easignore` (EAS lo usa en lugar de `.gitignore`) que no excluye `.env.local`. Sin él, el APK saldría sin configuración de Firebase.

## Verificación
- `git status` no muestra `.env.local`.
- `.easignore` existe y no menciona `.env`.
- `src/config/firebase.ts` no tiene valores escritos a mano.

## Uso de IA
La IA siguió la sección 5 del taller. Se revisó que el archivo `.gitignore` ya excluyera `.env*.local`.
