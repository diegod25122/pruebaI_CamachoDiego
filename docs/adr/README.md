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
| [ADR-009](ADR-009-sesion-secure-store.md) | expo-secure-store para la sesión, sin guardar la clave | R1 | Aceptado |

## Dependencias de `package.json` y su ADR

| Dependencia | ADR |
|---|---|
| `@tanstack/react-query` | ADR-003 |
| `@tanstack/react-query-persist-client` | ADR-003 |
| `@tanstack/query-async-storage-persister` | ADR-003 |
| `@react-native-async-storage/async-storage` | ADR-003 |
| `expo-sqlite` | ADR-002 |
| `expo-network` | ADR-008 |
| `expo-crypto` | ADR-008 |
| `expo-image-picker` | ADR-007 |
| `expo-file-system` | ADR-007 |
| `expo-secure-store` | ADR-009 |

Las demás (`expo`, `expo-router`, `react`, `react-native`, `expo-status-bar`, `expo-splash-screen`, `expo-constants`, `expo-linking`, `expo-system-ui`, `react-native-safe-area-context`, `react-native-screens`, `react-dom`, `react-native-web`) las crea Expo al generar el proyecto.
