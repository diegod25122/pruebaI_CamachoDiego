# Registro de decisiones de arquitectura (ADR)

| ADR | Decisión | Requisitos | Estado |
|---|---|---|---|
| [ADR-001](ADR-001-expo-router-navegacion.md) | Expo Router con rutas protegidas para la navegación | R1, R8 | Aceptado |
| [ADR-002](ADR-002-sqlite-almacenamiento-local.md) | expo-sqlite para guardar las lecturas en el teléfono | R4, R8, R9, R10 | Aceptado |
| [ADR-003](ADR-003-tanstack-query-cache-oficina.md) | fetch + TanStack Query con caché persistida en AsyncStorage | R3, R2 | Aceptado |
| [ADR-004](ADR-004-context-y-borrador-sqlite-estado-registro.md) | React Context + borrador en SQLite para el estado del registro | R8, R10 | Aceptado |
| [ADR-005](ADR-005-validacion-funciones-puras.md) | Validación con funciones TypeScript puras | R2, R5, R6, R7 | Aceptado |
| [ADR-006](ADR-006-formularios-controlados-sin-libreria.md) | Formularios con componentes controlados, sin librería | R1, R5, R6, R8 | Aceptado |
| [ADR-007](ADR-007-foto-image-picker-file-system.md) | expo-image-picker + expo-file-system para la foto | R7, R6 | Aceptado |
| [ADR-008](ADR-008-conexion-y-envio-sin-duplicados.md) | expo-network + cola en SQLite + UUID (expo-crypto) para enviar sin duplicados | R9, R4, R10 | Aceptado |
| [ADR-009](ADR-009-sesion-secure-store.md) | expo-secure-store para la sesión, sin guardar la clave | R1 | Reemplazado por ADR-010 |
| [ADR-010](ADR-010-firebase-auth-sdk-web.md) | Firebase Authentication con el SDK web (login, registro, recuperar, verificar correo, editar nombre) | R1, Deber 5 | Aceptado |
| [ADR-011](ADR-011-variables-de-entorno-firebase.md) | Configuración de Firebase en variables `EXPO_PUBLIC_` (`.env.local`) | R1, Deber 5 | Aceptado |
| [ADR-012](ADR-012-uniwind-estilos.md) | Uniwind (Tailwind 4) en lugar de StyleSheet | Deber 5 | Aceptado |
| [ADR-013](ADR-013-reanimated-animaciones.md) | React Native Reanimated para las animaciones | Deber 5, reto 2 | Aceptado |
| [ADR-014](ADR-014-indicador-fortaleza-clave.md) | Función propia para la seguridad de la contraseña | Deber 5 | Aceptado |

## Dependencias de `package.json` y su ADR

| Dependencia | ADR |
|---|---|
| `@tanstack/react-query` | ADR-003 |
| `@tanstack/react-query-persist-client` | ADR-003 |
| `@tanstack/query-async-storage-persister` | ADR-003 |
| `@react-native-async-storage/async-storage` | ADR-003 y ADR-010 (persistencia de la sesión de Firebase) |
| `expo-sqlite` | ADR-002 |
| `expo-network` | ADR-008 |
| `expo-crypto` | ADR-008 |
| `expo-image-picker` | ADR-007 |
| `expo-file-system` | ADR-007 |
| `firebase` | ADR-010 |
| `uniwind` | ADR-012 |
| `tailwindcss` | ADR-012 |
| `react-native-reanimated` | ADR-013 |
| `react-native-worklets` | ADR-013 (la necesita Reanimated 4) |

Las demás (`expo`, `expo-router`, `react`, `react-native`, `expo-status-bar`, `expo-splash-screen`, `expo-constants`, `expo-linking`, `expo-system-ui`, `react-native-safe-area-context`, `react-native-screens`, `react-dom`, `react-native-web`) las crea Expo al generar el proyecto.
