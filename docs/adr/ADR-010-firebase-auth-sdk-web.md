# ADR-010: Usar Firebase Authentication con el SDK web (`firebase`) para el inicio de sesión

## Estado
Aceptado. Reemplaza a ADR-009.

## Fecha
2026-11-03

## Requisitos relacionados
R1 (el técnico se identifica y la app lo recuerda hasta que cierre sesión). Deber 5: migrar el login a Firebase con la lógica del taller (registro, recuperación, cambio de contraseña, verificación de correo) y editar el nombre con `updateProfile`.

## Contexto
En la Prueba I los técnicos estaban quemados en el código y la sesión se guardaba con expo-secure-store (ADR-009). El Deber 5 pide cuentas reales: crear cuenta, recuperar la contraseña por correo, cambiarla, verificar el correo antes de entrar y cambiar el nombre visible. La app se prueba en Expo Go (SDK 57) y se compila con EAS. No hay un servidor propio. Las lecturas siguen funcionando sin señal (ADR-002 y ADR-008), así que la sesión también debe sobrevivir al cierre de la app y a la falta de señal una vez iniciada.

## Alternativas consideradas

| Alternativa | Ventajas en este proyecto | Desventajas en este proyecto |
|---|---|---|
| SDK web de Firebase (`firebase`) con `initializeAuth` + `getReactNativePersistence(AsyncStorage)` | JavaScript puro: funciona en Expo Go, sin compilar una versión propia. Trae todas las funciones del taller (`signInWithEmailAndPassword`, `createUserWithEmailAndPassword`, `sendPasswordResetEmail`, `sendEmailVerification`, `updatePassword`, `reauthenticateWithCredential`, `updateProfile`). La sesión queda en AsyncStorage, que ya está en el proyecto (ADR-003). | TypeScript lee por defecto los tipos del navegador y marca un error falso con `getReactNativePersistence`: hay que agregar una ruta en `tsconfig.json`. Pesa más que llamar a la API REST a mano. |
| `@react-native-firebase/auth` | SDK nativo, más completo y rápido. | No funciona en Expo Go: obliga a un development build y a configurar archivos nativos (`google-services.json`). Más pasos para el mismo resultado. |
| Mantener los usuarios quemados (ADR-009) | Sin dependencias nuevas; funciona sin señal desde el primer ingreso. | No cumple el Deber 5: no hay registro, ni recuperación, ni verificación de correo. |

## Decisión
Se usa el SDK web de Firebase, igual que en el taller:
- `src/config/firebase.ts`: `initializeApp` con los valores de `.env.local` (ADR-011), `initializeAuth` con `getReactNativePersistence(AsyncStorage)` y `auth.languageCode = 'es'`.
- `src/state/sesion.tsx`: único archivo que llama a Firebase. `onAuthStateChanged` es la fuente de verdad; las pantallas no navegan solas.
- **Reto 1 (verificación de correo):** tras `createUserWithEmailAndPassword` se llama a `sendEmailVerification`. En `_layout.tsx` hay tres grupos con `Stack.Protected`: sin cuenta (login, crear cuenta, recuperar), con cuenta no verificada (solo `verificar-correo`) y con cuenta verificada (toda la app). `comprobarVerificacion` usa `user.reload()` porque `emailVerified` no se actualiza solo.
- **Editar nombre:** `cambiarNombre` usa `updateProfile(user, { displayName })` y actualiza el estado `nombre`, porque `updateProfile` cambia el mismo objeto `user` y React no lo detectaría.
- Las lecturas guardan el correo del técnico en `tecnicoCodigo`.

## Consecuencias
- El técnico crea su propia cuenta y solo entra con el correo verificado.
- La sesión sobrevive al cierre de la app (AsyncStorage) y funciona sin señal una vez iniciada.
- Se elimina `expo-secure-store` del proyecto (ADR-009 queda reemplazado).
- Desventaja: el **primer** ingreso necesita internet; con los usuarios quemados se podía entrar sin señal.
- Desventaja: el registro es abierto. Cualquier persona con un correo puede crear una cuenta; para restringirlo habría que crear las cuentas desde la consola o validar el dominio en un servidor.
- Riesgo: los correos de Firebase suelen llegar a spam; la pantalla lo advierte.

## Verificación
- `src/state/sesion.tsx`: todas las llamadas a Firebase están ahí (`grep -r "firebase/auth" src` solo muestra este archivo y `src/config/firebase.ts`).
- `src/app/_layout.tsx`: los tres `Stack.Protected`.
- En el teléfono: crear cuenta → aparece "Verifica tu correo"; sin abrir el enlace, "Ya verifiqué" dice "Todavía no"; tras abrirlo entra a la app. Cerrar la app y abrirla → sigue dentro. En la consola de Firebase → Authentication → Users aparece la cuenta.

## Uso de IA
Se le dio a la IA el documento del taller y se le pidió aplicar la misma lógica a la app de la Prueba I. Propuso mantener `Stack.Protected` y agregar un tercer grupo para la cuenta sin verificar, que se aceptó. Se le pidió renombrar la pantalla `registro` del taller a `crear-cuenta`, porque en esta app "registro" ya es el registro de lecturas.
