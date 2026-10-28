import { useQueryClient } from '@tanstack/react-query';
import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, StyleSheet, Text, View } from 'react-native';

import { Aviso } from '@/components/Aviso';
import { Boton } from '@/components/Boton';
import { CabeceraRegistro } from '@/components/CabeceraRegistro';
import { Contador } from '@/components/Contador';
import { Ficha } from '@/components/Ficha';
import { Pantalla } from '@/components/Pantalla';
import { Color, Espacio, Radio, Texto } from '@/constants/theme';
import { ErrorLecturaDuplicada, ErrorNoEditable } from '@/db/lecturasRepo';
import { tituloEstado } from '@/domain/lectura';
import { CAMPOS_PASO_1, erroresDe, hayErrores } from '@/domain/reglas';
import { refrescarLocales } from '@/query/hooks';
import { guardarCaptura } from '@/services/registro';
import { uriDeFoto } from '@/services/fotos';
import { useSesion } from '@/state/sesion';
import { useRegistro } from '@/state/useRegistro';
import { useSync } from '@/sync/SyncProvider';
import { m3, nombrePeriodo, veces } from '@/utils/formato';

function Linea({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <View style={styles.linea}>
      <Text style={Texto.etiqueta}>{etiqueta}</Text>
      <Text style={styles.valor}>{valor}</Text>
    </View>
  );
}

// Paso 3: revisar todo y guardar en el teléfono. El envío lo hace el
// sincronizador (ahora si hay señal, o cuando vuelva).
export default function PasoResumen() {
  const client = useQueryClient();
  const { sesion } = useSesion();
  const { conexion, sincronizarAhora } = useSync();
  const { borrador, cargado, evaluacion, irA, salir, terminar } = useRegistro(3);
  const [guardando, setGuardando] = useState(false);

  if (!cargado) return null;
  if (!borrador || !evaluacion || !sesion) return <Redirect href="/" />;

  const { datos } = borrador;
  const fotoUri = datos.fotoNombre ? uriDeFoto(datos.fotoNombre) : null;
  const pendientesDePaso1 = hayErrores(erroresDe(evaluacion.errores, CAMPOS_PASO_1));
  const valido = !hayErrores(evaluacion.errores);

  const guardar = async () => {
    setGuardando(true);
    try {
      const lectura = await guardarCaptura(borrador, sesion.tecnico.codigo);
      router.dismissTo('/');
      router.push({ pathname: '/lectura/[id]', params: { id: lectura.id, guardada: '1' } });
      await terminar();
      await refrescarLocales(client);
      sincronizarAhora();
    } catch (error) {
      if (error instanceof ErrorLecturaDuplicada) {
        Alert.alert('Lectura duplicada', error.message, [
          { text: 'Entendido', onPress: () => void terminar().then(() => router.dismissTo('/')) },
        ]);
      } else if (error instanceof ErrorNoEditable) {
        Alert.alert('No se puede corregir', error.message, [
          { text: 'Entendido', onPress: () => void terminar().then(() => router.dismissTo('/')) },
        ]);
      } else {
        Alert.alert('No se pudo guardar', error instanceof Error ? error.message : 'Intenta de nuevo.');
      }
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Pantalla
      encabezado={<CabeceraRegistro borrador={borrador} paso={3} onSalir={salir} />}
      pie={
        <>
          <View style={styles.pieBoton}>
            <Boton titulo="Anterior" variante="secundario" onPress={() => irA(2)} />
          </View>
          <View style={styles.pieBoton}>
            <Boton
              titulo={borrador.editando ? 'Guardar corrección' : 'Guardar lectura'}
              onPress={() => void guardar()}
              cargando={guardando}
              deshabilitado={!valido}
            />
          </View>
        </>
      }>
      {!valido ? (
        <Aviso tipo="alerta" titulo="Falta completar">
          {Object.values(evaluacion.errores)[0] ?? ''}
        </Aviso>
      ) : null}
      {!valido ? (
        <Boton
          titulo={pendientesDePaso1 ? 'Ir al paso 1' : 'Ir al paso 2'}
          variante="secundario"
          onPress={() => (pendientesDePaso1 ? router.dismissTo('/registro/estado') : irA(2))}
        />
      ) : null}

      <Ficha acento={evaluacion.anomalo ? Color.alerta : Color.chaleco}>
        <View style={styles.bloque}>
          <Linea etiqueta="Medidor" valor={borrador.medidorCodigo} />
          <Linea etiqueta="Mes" valor={nombrePeriodo(borrador.periodo)} />
          <Linea etiqueta="Estado" valor={datos.estadoMedidor ? tituloEstado(datos.estadoMedidor) : '—'} />
          {datos.estadoMedidor !== 'inaccesible' ? (
            <View style={styles.linea}>
              <Text style={Texto.etiqueta}>Lectura</Text>
              <Contador valor={evaluacion.lectura} tamano="pequeno" alerta={evaluacion.anomalo} />
            </View>
          ) : null}
          {evaluacion.consumo !== null ? (
            <Linea
              etiqueta="Consumo"
              valor={`${m3(evaluacion.consumo)}${evaluacion.anomalo ? ` · anómalo (${veces(evaluacion.veces)}) · revisado` : ''}`}
            />
          ) : null}
          {datos.estadoMedidor === 'inaccesible' ? <Linea etiqueta="Motivo" valor={datos.motivo} /> : null}
          {datos.estadoMedidor === 'danado' ? <Linea etiqueta="Daño" valor={datos.descripcionDanio} /> : null}
          <Linea etiqueta="Foto" valor={fotoUri ? 'Adjunta' : 'Sin foto'} />
          {fotoUri ? <Image source={{ uri: fotoUri }} style={styles.foto} /> : null}
        </View>
      </Ficha>

      {conexion === 'sin-red' ? (
        <Aviso tipo="pendiente" titulo="Sin señal">
          Se guardará en el teléfono como pendiente de verificar y se enviará sola cuando vuelva la señal. Mientras no
          se envíe, podrás corregirla.
        </Aviso>
      ) : (
        <Aviso tipo="info" titulo="Con señal">
          Se guardará en el teléfono y se enviará enseguida a la oficina.
        </Aviso>
      )}
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  pieBoton: { flex: 1 },
  bloque: { gap: Espacio.m },
  linea: { gap: 4 },
  valor: { fontSize: 17, fontWeight: '700', color: Color.noche },
  foto: { width: '100%', aspectRatio: 4 / 3, borderRadius: Radio.m, borderWidth: 2, borderColor: Color.noche },
});
