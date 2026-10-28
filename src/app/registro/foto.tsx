import { Redirect } from 'expo-router';
import { useState } from 'react';
import { Image, Linking, StyleSheet, Text, View } from 'react-native';

import { Aviso } from '@/components/Aviso';
import { Boton } from '@/components/Boton';
import { CabeceraRegistro } from '@/components/CabeceraRegistro';
import { Casilla } from '@/components/Casilla';
import { Contador } from '@/components/Contador';
import { Ficha } from '@/components/Ficha';
import { Insignia } from '@/components/Insignia';
import { Pantalla } from '@/components/Pantalla';
import { Color, Espacio, Radio, Texto } from '@/constants/theme';
import { FACTOR_ANOMALIA } from '@/config';
import { CAMPOS_PASO_2, erroresDe, hayErrores } from '@/domain/reglas';
import { tomarFoto } from '@/services/camara';
import { borrarFoto, guardarFoto, uriDeFoto } from '@/services/fotos';
import { useRegistro } from '@/state/useRegistro';
import { m3, veces } from '@/utils/formato';

// Paso 2 (R6, R7): consumo, advertencia de anomalía y foto del medidor.
export default function PasoFoto() {
  const { borrador, cargado, cambiarDatos, evaluacion, irA, salir } = useRegistro(2);
  const [mostrarErrores, setMostrarErrores] = useState(false);
  const [sinPermiso, setSinPermiso] = useState<{ puedePreguntar: boolean } | null>(null);
  const [tomando, setTomando] = useState(false);

  if (!cargado) return null;
  if (!borrador || !evaluacion) return <Redirect href="/" />;

  const { datos, referencia } = borrador;
  const errores = mostrarErrores ? erroresDe(evaluacion.errores, CAMPOS_PASO_2) : {};
  const fotoUri = datos.fotoNombre ? uriDeFoto(datos.fotoNombre) : null;

  // La foto nueva reemplaza a la anterior del borrador; la original de una
  // lectura que se corrige se conserva hasta guardar.
  const soltarFotoActual = () => {
    if (datos.fotoNombre && datos.fotoNombre !== borrador.fotoOriginal) borrarFoto(datos.fotoNombre);
  };

  const fotografiar = async () => {
    setTomando(true);
    try {
      const r = await tomarFoto();
      if (r.tipo === 'sinPermiso') {
        setSinPermiso({ puedePreguntar: r.puedePreguntar });
        return;
      }
      setSinPermiso(null);
      if (r.tipo === 'foto') {
        const nombre = await guardarFoto(r.uri, borrador.id);
        soltarFotoActual();
        cambiarDatos({ fotoNombre: nombre });
      }
    } finally {
      setTomando(false);
    }
  };

  const quitarFoto = () => {
    soltarFotoActual();
    cambiarDatos({ fotoNombre: null });
  };

  const siguiente = () => {
    if (hayErrores(erroresDe(evaluacion.errores, CAMPOS_PASO_2))) {
      setMostrarErrores(true);
      return;
    }
    irA(3);
  };

  const motivoFoto = evaluacion.anomalo
    ? 'Consumo anómalo: la foto es obligatoria.'
    : datos.estadoMedidor === 'danado'
      ? 'Medidor dañado: la foto es obligatoria.'
      : 'En este caso la foto es opcional, pero sirve de respaldo ante reclamos.';

  return (
    <Pantalla
      encabezado={<CabeceraRegistro borrador={borrador} paso={2} onSalir={salir} />}
      pie={
        <>
          <View style={styles.pieBoton}>
            <Boton titulo="Anterior" variante="secundario" onPress={() => irA(1)} />
          </View>
          <View style={styles.pieBoton}>
            <Boton titulo="Siguiente" onPress={siguiente} />
          </View>
        </>
      }>
      {/* R6: consumo del mes */}
      <Ficha acento={evaluacion.anomalo ? Color.alerta : Color.agua}>
        <View style={styles.bloque}>
          <Text style={Texto.subtitulo}>Consumo del mes</Text>
          {evaluacion.lectura === null ? (
            <Text style={Texto.cuerpo}>Sin lectura: no se calcula consumo.</Text>
          ) : !referencia ? (
            <Aviso tipo="pendiente" titulo="Pendiente de verificar">
              Sin datos del medidor en el teléfono. Al recuperar la señal se comparará con la lectura anterior de la
              oficina antes de enviarla.
            </Aviso>
          ) : (
            <>
              <View style={styles.fila}>
                <Text style={Texto.etiqueta}>Anterior</Text>
                <Contador valor={referencia.lecturaAnterior} tamano="pequeno" />
              </View>
              <View style={styles.fila}>
                <Text style={Texto.etiqueta}>Actual</Text>
                <Contador valor={evaluacion.lectura} tamano="pequeno" alerta={evaluacion.anomalo} />
              </View>
              <View style={styles.separador} />
              <View style={styles.fila}>
                <Text style={styles.consumo}>{m3(evaluacion.consumo)}</Text>
                <Text style={Texto.pequeno}>
                  Promedio {m3(referencia.consumoPromedio)} · límite {m3(referencia.consumoPromedio * FACTOR_ANOMALIA)}
                </Text>
              </View>
            </>
          )}
        </View>
      </Ficha>

      {evaluacion.anomalo ? (
        <View style={styles.bloque}>
          <Aviso tipo="alerta" titulo={`Consumo anómalo: ${veces(evaluacion.veces)} el promedio`}>
            Supera el triple del consumo promedio. Revisa el medidor (fugas, dígitos mal leídos) antes de continuar.
          </Aviso>
          <Casilla
            marcada={datos.anomaliaConfirmada}
            onCambiar={(v) => cambiarDatos({ anomaliaConfirmada: v })}
            texto="Revisé el medidor y la lectura es correcta"
            error={errores.confirmacion}
          />
        </View>
      ) : null}

      {/* R7: foto del medidor */}
      <View style={styles.bloque}>
        <View style={styles.fila}>
          <Text style={Texto.subtitulo}>Foto del medidor</Text>
          <Insignia
            texto={evaluacion.fotoObligatoria ? 'Obligatoria' : 'Opcional'}
            tono={evaluacion.fotoObligatoria ? 'alerta' : 'neutro'}
          />
        </View>
        <Text style={Texto.pequeno}>{motivoFoto}</Text>

        {fotoUri ? (
          <Image source={{ uri: fotoUri }} style={styles.foto} accessibilityLabel="Foto del medidor" />
        ) : null}

        {sinPermiso ? (
          <Aviso tipo={evaluacion.fotoObligatoria ? 'alerta' : 'info'} titulo="Sin permiso para usar la cámara">
            <Text style={styles.textoAviso}>
              La app necesita la cámara para fotografiar el medidor. Esa foto es el respaldo de lo que marcaba el
              medidor el día de la visita: protege al técnico y a la empresa cuando un cliente reclama por un consumo
              alto o el medidor está dañado. Solo se usa cuando tú tocas «Tomar foto».
            </Text>
            <Text style={[styles.textoAviso, styles.negrita]}>
              {evaluacion.fotoObligatoria
                ? 'En este caso la foto es obligatoria: concede el permiso para poder guardar la lectura.'
                : 'Aquí la foto es opcional: puedes continuar sin ella.'}
            </Text>
            {!sinPermiso.puedePreguntar ? (
              <Boton titulo="Abrir ajustes de la app" variante="secundario" onPress={() => void Linking.openSettings()} />
            ) : null}
          </Aviso>
        ) : null}

        <Boton
          titulo={fotoUri ? 'Repetir foto' : 'Tomar foto'}
          variante={evaluacion.fotoObligatoria && !fotoUri ? 'principal' : 'secundario'}
          onPress={() => void fotografiar()}
          cargando={tomando}
        />
        {fotoUri ? <Boton titulo="Quitar foto" variante="texto" onPress={quitarFoto} /> : null}
        {errores.foto ? <Text style={styles.error}>✕ {errores.foto}</Text> : null}
      </View>
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  pieBoton: { flex: 1 },
  bloque: { gap: Espacio.m },
  fila: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Espacio.s, flexWrap: 'wrap' },
  separador: { height: 2, backgroundColor: Color.linea },
  consumo: { fontSize: 28, fontWeight: '900', color: Color.noche },
  foto: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: Radio.m,
    borderWidth: 2,
    borderColor: Color.noche,
    backgroundColor: Color.linea,
  },
  textoAviso: { fontSize: 15, color: Color.noche, lineHeight: 21 },
  negrita: { fontWeight: '800' },
  error: { color: Color.alerta, fontSize: 14, fontWeight: '700' },
});
