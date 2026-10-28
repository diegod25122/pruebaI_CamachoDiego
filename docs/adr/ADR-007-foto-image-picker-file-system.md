# ADR-007: Tomar la foto con expo-image-picker y conservarla con expo-file-system

## Estado
Aceptado.

## Fecha
2026-10-28

## Requisitos relacionados
R7 (foto obligatoria con consumo anómalo o medidor dañado; se conserva días aunque no se envíe; explicar si se niega el permiso). También R6 (la anomalía vuelve obligatoria la foto).

## Contexto
El técnico necesita fotografiar el medidor como respaldo ante reclamos. La foto debe seguir disponible después de reiniciar el teléfono y hasta que la lectura se envíe, aunque pasen días. Si el técnico niega el permiso de cámara, la app debe explicar por qué lo necesita y dejarlo continuar cuando la foto no es obligatoria. No hace falta escanear códigos ni controlar la cámara (zoom, flash) desde la app.

## Alternativas consideradas

**Captura**

| Alternativa | Ventajas en este proyecto | Desventajas en este proyecto |
|---|---|---|
| expo-image-picker (`launchCameraAsync`) | Abre la cámara del sistema, que el técnico ya conoce; una función pide el permiso y devuelve la foto. Informa si se puede volver a preguntar (`canAskAgain`) para ofrecer «Abrir ajustes». | La interfaz de la cámara es la del sistema, no se puede personalizar. La foto queda en una carpeta temporal. |
| expo-camera | Cámara dentro de la app, personalizable. | Hay que construir la pantalla de cámara, el botón de disparo y la vista previa: más código para algo que el picker ya resuelve. |

**Conservación**

| Alternativa | Ventajas en este proyecto | Desventajas en este proyecto |
|---|---|---|
| expo-file-system: copiar a `Paths.document` | La carpeta de documentos de la app no la borra el sistema; sobrevive a reinicios. | Las fotos ocupan espacio hasta que se borran; hay que limpiar las descartadas. |
| Dejar la foto donde la dejó la cámara | Sin código extra. | Es una carpeta de caché: Android puede vaciarla y la foto de una lectura pendiente desaparecería (incumple R7). |
| Guardar la foto en base64 dentro de SQLite | Todo en un solo lugar. | Las imágenes inflan la base y cada consulta de la lista cargaría megas en memoria. |
| expo-media-library (galería) | Visible para el usuario. | Necesita otro permiso y deja las fotos expuestas en la galería personal del técnico. |

## Decisión
Se usa expo-image-picker con `quality: 0.6` (se leen los dígitos y pesa poco) y expo-file-system para copiar cada foto a `Paths.document/fotos-medidores/<uuid>-<hora>.jpg`. En SQLite y en el borrador se guarda solo el **nombre** del archivo; la ruta completa se arma al mostrarla, porque la ruta de la carpeta de la app puede cambiar entre actualizaciones. En `app.json` se configura el texto del permiso de cámara y se desactivan los permisos de galería y micrófono.

## Consecuencias
- La foto de una lectura pendiente sigue ahí tras reiniciar el teléfono.
- Si se niega el permiso, la pantalla explica para qué sirve la foto; si la foto es opcional, permite seguir sin ella; si el sistema ya no deja volver a preguntar, ofrece «Abrir ajustes».
- Al descartar un registro o reemplazar una foto se borra el archivo que ya no se usa.
- Desventaja: las fotos de lecturas enviadas siguen ocupando espacio en el teléfono (no se implementó limpieza).
- Desventaja: no se implementó el requisito opcional de subir la foto a un servicio externo; la oficina recibe `tieneFoto` y `fotoNombre`, no la imagen.

## Verificación
- `src/services/camara.ts` y `src/services/fotos.ts`.
- `src/app/registro/foto.tsx`: bloque «Sin permiso para usar la cámara».
- `app.json`: plugin `expo-image-picker` con `cameraPermission`.
- En el teléfono: negar el permiso muestra la explicación; registrar con foto en modo avión, reiniciar el teléfono y abrir la lectura → la foto aparece.

## Uso de IA
La IA propuso expo-image-picker y copiar la foto a la carpeta de documentos. Se aceptó porque la cámara del sistema basta. Se revisó que usara la API nueva de expo-file-system del SDK 57 (`File`, `Directory`, `Paths`) y no la antigua, que en el SDK 57 está en `expo-file-system/legacy`. Se le pidió guardar solo el nombre del archivo en lugar de la ruta completa.
