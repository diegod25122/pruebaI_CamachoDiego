# ADR-013: Usar React Native Reanimated para las animaciones

## Estado
Aceptado.

## Fecha
2026-11-03

## Requisitos relacionados
Deber 5 · punto 3 (al menos 5 animaciones con Reanimated) y reto 2 del taller (sacudida cuando el login falla). Apoya R5, R6 y R9 (dar a entender estados).

## Contexto
El deber pide al menos cinco animaciones de Reanimated "que hagan match" con la app. La app se usa en campo, a veces al sol y con apuro: una animación solo vale si comunica algo (un error, un cambio de señal, una lectura nueva), no como adorno. Reanimated ya viene en la plantilla de Expo SDK 57 junto con `react-native-worklets`, y Expo Go trae su parte nativa.

## Alternativas consideradas

| Alternativa | Ventajas en este proyecto | Desventajas en este proyecto |
|---|---|---|
| React Native Reanimated 4 | Corre en el hilo de interfaz: no se traba aunque JavaScript esté ocupado (por ejemplo, durante el envío de lecturas). Trae animaciones de entrada listas (`FadeInDown`, `ZoomIn`, `SlideInDown`), transiciones de lista (`LinearTransition`) y funciones para componer (`withSequence`, `withRepeat`, `withSpring`). Respeta "reducir movimiento" del sistema. Viene con Expo. | Hay que entender `useSharedValue`, `useAnimatedStyle` y los worklets. La versión debe coincidir con la nativa de Expo Go (4.5.1 con worklets 0.10.1 en SDK 57). |
| `Animated` de React Native | Sin dependencias. | API más verbosa, sin animaciones de entrada ni de lista; el deber pide Reanimated. |
| Lottie | Animaciones muy vistosas desde archivos. | Otra dependencia y archivos de animación; no reacciona a los datos de la app. |
| Moti | API más corta sobre Reanimated. | Una dependencia más encima de Reanimated. |

## Decisión
Se usan estas animaciones, cada una ligada a algo de la app:

1. **Sacudida en error** (`src/animaciones/useSacudida.ts`, reto 2): `withSequence` de `withTiming` en `translateX`. En login, crear cuenta, cambiar clave y editar nombre.
2. **Cinta reflectiva en movimiento** (`Cinta.tsx`): `withRepeat` + `Easing.linear`, avanza un paso de franja y repite.
3. **Contador de rodillos** (`Contador.tsx`): cada dígito entra desde arriba con `withSpring`, escalonado con `withDelay`.
4. **Botón con resorte** (`Boton.tsx`): `scale` con `withSpring` al tocar.
5. **Barra de señal viva** (`BarraConexion.tsx`): `interpolateColor` del fondo al perder señal y punto que late con `withRepeat` + `withSequence`.
6. **Medidor de fuerza de la contraseña** (`IndicadorClave.tsx`): ancho con `withTiming` y color con `interpolateColor`.
7. **Lista escalonada** (`(app)/index.tsx`): `FadeInDown.delay(i * 70).springify()` y `LinearTransition` al cambiar de estado.

Además: avisos con `FadeInUp`, modal de borrador con `SlideInDown`, saludo con `FadeInDown` (como en el taller) y barra de pasos con `withTiming`.

## Consecuencias
- Cada animación comunica un estado: error, señal, lectura, progreso.
- Las repetitivas usan `ReduceMotion.System`: si el técnico activa "reducir movimiento", no se mueven.
- Desventaja: los colores animados necesitan su valor real en JavaScript; se leen de `global.css` con `useCSSVariable` (ADR-012).
- Riesgo: si `react-native-reanimated` no coincide con la versión nativa de Expo Go, la app falla al abrir. Por eso se fijan 4.5.1 y 0.10.1 en `package.json`.

## Verificación
- En el teléfono: login con datos incorrectos → la hoja se sacude; activar modo avión → la barra pasa a gris y el punto late; abrir un medidor → los dígitos ruedan.
- `grep -rn "react-native-reanimated" src` muestra los archivos listados.

## Uso de IA
Se le pidió a la IA proponer animaciones que tuvieran sentido en una app de lectura de medidores, no animaciones decorativas. Se aceptaron las siete y se descartaron efectos sin función.
