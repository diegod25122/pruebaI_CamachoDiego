# Ruta de Lecturas

App móvil para que los técnicos de agua potable registren en campo la lectura de
los medidores, con foto de respaldo, **aunque no haya señal**. Prueba I técnica
de Desarrollo Móvil (ESFOT).

- React Native + **Expo SDK 57** + TypeScript (expo-router)
- Sistema de la oficina simulado con **MockAPI** (`medidores` y `lecturas`)
- Análisis, requisitos y justificación de cada dependencia:
  [`docs/analisis-y-decisiones.md`](docs/analisis-y-decisiones.md)
- Guion de la demostración y preguntas de la defensa: [`docs/defensa.md`](docs/defensa.md)

## 1. Instalar

```bash
npm install
npx expo install --fix   # alinea las versiones con el SDK 57
npm test                 # 31 pruebas de reglas y sincronización
```

## 2. Configurar MockAPI

1. Entra a <https://mockapi.io>, crea un proyecto y copia su URL
   (`https://XXXX.mockapi.io/api/v1`).
2. Crea el recurso **`medidores`** (pon 0 en la cantidad de datos generados).
   En *Schema* deja solo `id` y agrega:

   | Campo | Tipo |
   |---|---|
   | codigo | String |
   | direccion | String |
   | sector | String |
   | numeroCuenta | String |
   | estado | String |
   | ultimaLectura | Number |
   | fechaUltimaLectura | String |
   | consumoPromedio | Number |

3. Crea el recurso **`lecturas`** (también con 0 datos) con este schema:

   | Campo | Tipo |
   |---|---|
   | clientId | String |
   | medidorCodigo | String |
   | periodo | String |
   | tecnicoCodigo | String |
   | estadoMedidor | String |
   | lectura | Number |
   | lecturaAnterior | Number |
   | consumo | Number |
   | anomalo | Boolean |
   | anomaliaConfirmada | Boolean |
   | motivo | String |
   | descripcionDanio | String |
   | tieneFoto | Boolean |
   | fotoNombre | String |
   | registradaEn | String |

4. Pega la URL en `src/config.ts` → `MOCKAPI_BASE_URL` (sin barra final).
5. Carga los 8 medidores de prueba:

   ```bash
   node scripts/semilla.mjs https://XXXX.mockapi.io/api/v1
   # para dejar todo limpio antes de la defensa:
   node scripts/semilla.mjs https://XXXX.mockapi.io/api/v1 --reiniciar
   ```

## 3. Probar en el teléfono

```bash
npx expo start
```

Escanea el QR con **Expo Go para SDK 57** (o escribe la IP a mano). Usuarios:
`EMP-1001 / agua2026` y `EMP-1002 / lloa2026`.

## 4. Generar el APK (obligatorio para la defensa)

```bash
npm install -g eas-cli
eas login
eas build -p android --profile preview
```

La primera vez pregunta si crea el proyecto en EAS: responde que sí. Al terminar
da un enlace/QR para descargar el `.apk` e instalarlo en el teléfono. La cola
gratuita puede tardar: lánzalo apenas tengas MockAPI configurado.

> Cada vez que cambies `src/config.ts` hay que volver a generar el APK.

## 5. Subir a GitHub

```bash
git init
git add .
git commit -m "Ruta de Lecturas: prueba I de desarrollo móvil"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/ruta-lecturas.git
git push -u origin main
```

Pega el enlace del repositorio en el documento de la prueba.

## 6. Estructura

```
src/app        pantallas (login, inicio, medidor, registro en 3 pasos, detalle)
src/domain     reglas de negocio puras + pruebas
src/db         SQLite: lecturas y registro a medias
src/api        MockAPI
src/query      TanStack Query con caché persistida
src/sync       conexión y envío automático sin duplicados
src/state      sesión y borrador
src/services   cámara y fotos
src/components diseño (contador de rodillos, cinta reflectiva, fichas)
docs/          análisis, decisiones y guía de defensa
.github/       instrucciones que se dieron a la IA (SDD)
```
