import { router, useLocalSearchParams } from 'expo-router';
import type { ReactNode } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';

import { ErrorConfiguracion } from '@/api/oficina';
import { Aviso } from '@/components/Aviso';
import { Boton } from '@/components/Boton';
import { Encabezado } from '@/components/Encabezado';
import { FichaMedidor } from '@/components/FichaMedidor';
import { Pantalla } from '@/components/Pantalla';
import { Color, Espacio, Texto } from '@/constants/theme';
import { periodoDe } from '@/domain/lectura';
import { referenciaDe, validarCodigoMedidor, type Medidor } from '@/domain/medidor';
import { useLecturasLocales, useLecturasOficina, useMedidor } from '@/query/hooks';
import { RUTA_PASO, useBorrador } from '@/state/borrador';
import { useSync } from '@/sync/SyncProvider';
import { hora, nombrePeriodo } from '@/utils/formato';

export default function MedidorScreen() {
  const params = useLocalSearchParams<{ codigo: string }>();
  // R2: se valida de nuevo aquí; con un código inválido la consulta queda
  // desactivada (codigo queda en null y enabled en false).
  const validacion = validarCodigoMedidor(params.codigo ?? '');
  const codigo = validacion.ok ? validacion.codigo : null;

  const { conexion } = useSync();
  const periodo = periodoDe(new Date());
  const medidorQ = useMedidor(codigo);
  const oficinaQ = useLecturasOficina(codigo, periodo);
  const { data: locales } = useLecturasLocales();
  const { borrador, iniciarNueva, descartar } = useBorrador();

  if (!validacion.ok) {
    return (
      <Pantalla encabezado={<Encabezado antetitulo="Medidor" titulo="Código inválido" volver />}>
        <Aviso tipo="alerta" titulo="No se consultó la oficina">
          {validacion.error}
        </Aviso>
      </Pantalla>
    );
  }

  // R10: ¿ya hay lectura de este medidor en el mes (en el teléfono o en la oficina)?
  const local = locales?.find((l) => l.medidorCodigo === codigo && l.periodo === periodo);
  const enOficina = oficinaQ.data?.find((r) => r.clientId !== local?.id);

  const empezar = async (medidor: Medidor | null) => {
    const arrancar = async () => {
      await iniciarNueva(validacion.codigo, medidor, medidor ? referenciaDe(medidor) : null);
      router.push(RUTA_PASO[1]);
    };
    if (!borrador) return arrancar();
    if (borrador.medidorCodigo === validacion.codigo && !borrador.editando) {
      router.push(RUTA_PASO[borrador.paso]);
      return;
    }
    Alert.alert(
      'Tienes un registro sin terminar',
      `Del medidor ${borrador.medidorCodigo}. Solo puede haber uno a la vez.`,
      [
        { text: 'Continuar ese', onPress: () => router.push(RUTA_PASO[borrador.paso]) },
        {
          text: 'Descartarlo y empezar',
          style: 'destructive',
          onPress: () => void descartar().then(arrancar),
        },
      ],
    );
  };

  const botonRegistrar = (medidor: Medidor | null) => {
    if (local) {
      return (
        <View style={styles.bloque}>
          <Aviso tipo="alerta" titulo={`Ya registrado en ${nombrePeriodo(periodo)}`}>
            No se puede registrar dos veces el mismo medidor en el mismo mes.
          </Aviso>
          <Boton
            titulo="Ver la lectura registrada"
            variante="secundario"
            onPress={() => router.push({ pathname: '/lectura/[id]', params: { id: local.id } })}
          />
        </View>
      );
    }
    if (enOficina) {
      return (
        <Aviso tipo="alerta" titulo={`La oficina ya tiene su lectura de ${nombrePeriodo(periodo)}`}>
          {`Registrada por ${enOficina.tecnicoCodigo}. No se puede registrar dos veces en el mismo mes.`}
        </Aviso>
      );
    }
    return (
      <Boton
        titulo="Registrar lectura"
        onPress={() => void empezar(medidor)}
        detalle={conexion === 'sin-red' ? 'Sin señal: se guardará y se enviará después' : undefined}
      />
    );
  };

  const { data, isFetching, dataUpdatedAt, fetchStatus, isError, error, refetch } = medidorQ;

  let contenido: ReactNode;
  if (data) {
    const origen = isFetching
      ? 'Actualizando con la oficina…'
      : conexion === 'sin-red'
        ? `Sin señal · datos guardados de las ${hora(dataUpdatedAt)}`
        : `Datos de la oficina de las ${hora(dataUpdatedAt)} (guardados para la jornada)`;
    contenido = (
      <>
        <View style={styles.origen}>
          <View style={[styles.puntoOrigen, conexion === 'sin-red' && styles.puntoSinRed]} />
          <Text style={Texto.pequeno}>{origen}</Text>
        </View>
        <FichaMedidor medidor={data} />
        {botonRegistrar(data)}
      </>
    );
  } else if (data === null) {
    contenido = (
      <Aviso tipo="alerta" titulo="Medidor no encontrado">
        {`${validacion.codigo} no existe en el sistema de la oficina. Revisa la etiqueta.`}
      </Aviso>
    );
  } else if (fetchStatus === 'paused') {
    // Sin señal y sin haberlo consultado antes: igual se puede registrar (R4).
    contenido = (
      <>
        <Aviso tipo="pendiente" titulo="Sin señal y sin datos guardados">
          Este medidor no se consultó antes en este teléfono. Puedes registrar la lectura: quedará pendiente de
          verificar y se comparará con la anterior cuando vuelva la señal.
        </Aviso>
        {botonRegistrar(null)}
      </>
    );
  } else if (isError) {
    contenido = (
      <View style={styles.bloque}>
        <Aviso tipo="alerta" titulo="No se pudo consultar la oficina">
          {error instanceof ErrorConfiguracion ? error.message : 'La oficina no respondió. Intenta de nuevo.'}
        </Aviso>
        <Boton titulo="Reintentar" variante="secundario" onPress={() => void refetch()} />
      </View>
    );
  } else {
    contenido = (
      <View style={styles.cargando}>
        <ActivityIndicator size="large" color={Color.noche} />
        <Text style={Texto.cuerpo}>Consultando a la oficina…</Text>
      </View>
    );
  }

  return (
    <Pantalla encabezado={<Encabezado antetitulo="Medidor" titulo={validacion.codigo} volver />}>
      {contenido}
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  bloque: { gap: Espacio.m },
  cargando: { alignItems: 'center', gap: Espacio.m, paddingVertical: Espacio.xxl },
  origen: { flexDirection: 'row', alignItems: 'center', gap: Espacio.s },
  puntoOrigen: { width: 10, height: 10, borderRadius: 5, backgroundColor: Color.ok },
  puntoSinRed: { backgroundColor: Color.pendiente },
});
