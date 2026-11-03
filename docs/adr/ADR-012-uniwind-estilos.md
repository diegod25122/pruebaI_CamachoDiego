# ADR-012: Usar Uniwind (Tailwind CSS 4) para los estilos en lugar de StyleSheet

## Estado
Aceptado.

## Fecha
2026-11-03

## Requisitos relacionados
Deber 5 · punto 4 (diseño visual con Uniwind). Restricción de la Prueba I: diseño no genérico.

## Contexto
Cada componente tenía su `StyleSheet.create` y los colores vivían en `src/constants/theme.ts`. El deber pide reemplazar los StyleSheet por Uniwind. La identidad visual ("libreta de campo + chaleco reflectivo") debe mantenerse. Algunas cosas no se pueden expresar como clases fijas: los valores animados de Reanimated (ADR-013) y las alturas de la barra de estado de cada teléfono.

## Alternativas consideradas

| Alternativa | Ventajas en este proyecto | Desventajas en este proyecto |
|---|---|---|
| Uniwind | Tailwind 4 para React Native, sin preset de Babel. Los colores se definen una vez en `global.css` con `@theme` y se usan como `bg-noche`, `text-alerta`. `useCSSVariable` permite leer esos mismos colores desde JavaScript (los necesita Reanimated). Funciona con los componentes de Reanimated sin envolverlos. | Hay que configurar Metro (`withUniwindConfig`). Los tipos de `className` se generan al iniciar Metro (`uniwind-types.d.ts`). Las clases deben escribirse completas: Tailwind no ve clases armadas con texto variable. |
| NativeWind | Muy usado, misma idea de Tailwind. | El deber pide Uniwind. Necesita preset de Babel y su versión estable usa Tailwind 3. |
| Seguir con StyleSheet + `theme.ts` | Sin dependencias; ya funcionaba. | No cumple el deber. |

## Decisión
- `global.css` en la raíz con `@import 'tailwindcss'; @import 'uniwind';` y `@theme static` con todos los colores de la app (`--color-noche`, `--color-chaleco`, `--color-alerta`...) y `--font-mono`.
- `metro.config.js` con `withUniwindConfig(config, { cssEntryFile: './global.css', dtsFile: './src/uniwind-types.d.ts' })`.
- `global.css` se importa en `src/app/_layout.tsx`.
- Los colores que cambian según el estado se eligen con mapas de clases completas (por ejemplo `CAJA: Record<Tipo, string>` en `Aviso.tsx`).
- Props de color que no son estilo: `placeholderTextColorClassName="accent-niebla"`, `cursorColorClassName="accent-chaleco"`.
- `style` solo queda para valores animados de Reanimated y para los márgenes de la zona segura (`insets.top`, `insets.bottom`).
- Se elimina `src/constants/theme.ts`; los textos repetidos están en `src/constants/clases.ts`.

## Consecuencias
- Ningún archivo usa `StyleSheet.create`.
- Un solo lugar para los colores: `global.css`, tanto para clases como para animaciones (`useColor` en `src/animaciones/useColores.ts`).
- Desventaja: las líneas de `className` son largas y hay que conocer las clases de Tailwind.
- Desventaja: si se arma una clase con texto variable (`bg-${color}`), Tailwind no la genera y el estilo no aparece; por eso se usan mapas.
- Riesgo: Uniwind no soporta todo CSS (sin grid ni herencia de estilos); el diseño usa solo flexbox.

## Verificación
- `grep -r "StyleSheet" src` no devuelve nada.
- `global.css` contiene todos los colores; en `src` no hay colores sueltos (salvo el valor de respaldo `#000000` de `useColores.ts`).
- Al iniciar `npx expo start` aparece `src/uniwind-types.d.ts` y `npm run typecheck` pasa.

## Uso de IA
Se le pidió a la IA migrar todos los estilos a Uniwind sin cambiar el diseño. Se aceptó leer los colores con `useCSSVariable` para no repetirlos en un archivo TypeScript. Se le pidió que el `style` solo quedara donde es necesario (animaciones y zona segura).
