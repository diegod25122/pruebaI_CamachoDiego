import { Redirect } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Linking, Platform, Text, View } from 'react-native';

import { Animacion } from '@/components/Animacion';
import { Aviso } from '@/components/Aviso';
import { Boton } from '@/components/Boton';
import { CabeceraRegistro } from '@/components/CabeceraRegistro';
import { Ficha } from '@/components/Ficha';
import { Insignia } from '@/components/Insignia';
import { MapaLeaflet } from '@/components/mapa/MapaLeaflet';
import { Pantalla } from '@/components/Pantalla';
import { tx } from '@/constants/clases';
import { CAMPOS_PASO_3, erroresDe, hayErrores } from '@/domain/reglas';
import { textoCoordenadas, textoOrigen, ubicacionValida } from '@/domain/ubicacion';
import { ubicacionActual, type ResultadoGps } from '@/services/gps';
import { useRegistro } from '@/state/useRegistro';

type Problema = Exclude<ResultadoGps, { tipo: 'ok' }>;

// Paso 3 (Taller 7): la app obliga a registrar dónde se hizo la lectura.
// Por defecto la toma el GPS al entrar; si no es exacta (o no hay GPS), el
// técnico arrastra el marcador o toca el mapa para ponerla a mano.
export default function PasoUbicacion() {
  const { borrador, cargado, cambiarDatos, evaluacion, irA, salir } = useRegistro(3);
  const [buscando, setBuscando] = useState(false);
  const [problema, setProblema] = useState<Problema | null>(null);
  const [mostrarErrores, setMostrarErrores] = useState(false);
  const [tocandoMapa, setTocandoMapa] = useState(false);
  const pedidaAlEntrar = useRef(false);

  const usarGps = async () => {
    setBuscando(true);
    setProblema(null);
    try {
      const r = await ubicacionActual();
      if (r.tipo === 'ok') cambiarDatos({ ubicacion: r.ubicacion });
      else setProblema(r);
    } finally {
      setBuscando(false);
    }
  };

  // Automática: al entrar por primera vez sin ubicación, se pide al GPS.
  const yaTiene = ubicacionValida(borrador?.datos.ubicacion);
  useEffect(() => {
    if (!cargado || !borrador || yaTiene || pedidaAlEntrar.current) return;
    pedidaAlEntrar.current = true;
    void usarGps();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cargado, borrador, yaTiene]);

  if (!cargado) return null;
  if (!borrador || !evaluacion) return <Redirect href="/" />;

  const ubicacion = ubicacionValida(borrador.datos.ubicacion) ? borrador.datos.ubicacion : null;
  const errores = mostrarErrores ? erroresDe(evaluacion.errores, CAMPOS_PASO_3) : {};

  // Manual: el técnico movió el marcador o tocó el mapa.
  const alMover = (latitud: number, longitud: number) => {
    setProblema(null);
    cambiarDatos({ ubicacion: { latitud, longitud, precision: null, origen: 'manual' } });
  };

  const siguiente = () => {
    if (hayErrores(erroresDe(evaluacion.errores, CAMPOS_PASO_3))) {
      setMostrarErrores(true);
      return;
    }
    irA(4);
  };

  return (
    <Pantalla
      desplazable={!tocandoMapa}
      encabezado={<CabeceraRegistro borrador={borrador} paso={3} onSalir={salir} />}
      pie={
        <>
          <View className="flex-1">
            <Boton titulo="Anterior" variante="secundario" onPress={() => irA(2)} />
          </View>
          <View className="flex-1">
            <Boton titulo="Siguiente" onPress={siguiente} deshabilitado={buscando} />
          </View>
        </>
      }>
      <View className="flex-row items-center justify-between gap-2 flex-wrap">
        <Text className={tx.subtitulo}>Ubicación de la lectura</Text>
        <Insignia texto="Obligatoria" tono="alerta" />
      </View>
      <Text className={tx.pequeno}>
        Se toma con el GPS del teléfono. Si el punto no es exacto, arrastra el marcador o toca el mapa donde está el
        medidor.
      </Text>

      <MapaLeaflet ubicacion={ubicacion} editable onMover={alMover} onTocando={setTocandoMapa} alto={300} />

      <Ficha acento={ubicacion ? (ubicacion.origen === 'gps' ? 'bg-agua' : 'bg-chaleco') : 'bg-alerta'}>
        <View className="gap-2">
          <Text className={tx.etiqueta}>Coordenadas</Text>
          {buscando ? (
            <Animacion tipo="cargando" tamano={80} texto="Buscando señal GPS…" />
          ) : ubicacion ? (
            <>
              <Text className={`text-[17px] text-noche ${tx.codigo}`}>{textoCoordenadas(ubicacion)}</Text>
              <Text className={tx.pequeno}>{textoOrigen(ubicacion)}</Text>
            </>
          ) : (
            <Text className={tx.cuerpo}>Todavía sin ubicación.</Text>
          )}
        </View>
      </Ficha>

      {problema?.tipo === 'sinPermiso' ? (
        <Aviso tipo="alerta" titulo="Sin permiso de ubicación">
          <Text className="text-[15px] text-noche leading-[21px]">
            La ubicación demuestra que la lectura se hizo junto al medidor. Concede el permiso o marca el punto a mano
            tocando el mapa.
          </Text>
          {!problema.puedePreguntar ? (
            <Boton titulo="Abrir ajustes de la app" variante="secundario" onPress={() => void Linking.openSettings()} />
          ) : null}
        </Aviso>
      ) : problema?.tipo === 'apagado' ? (
        <Aviso tipo="pendiente" titulo="La ubicación del teléfono está apagada">
          <Text className="text-[15px] text-noche leading-[21px]">
            Actívala y toca «Usar mi ubicación actual», o marca el punto a mano tocando el mapa.
          </Text>
          {Platform.OS === 'android' ? (
            <Boton
              titulo="Abrir ajustes de ubicación"
              variante="secundario"
              onPress={() => void Linking.sendIntent('android.settings.LOCATION_SOURCE_SETTINGS')}
            />
          ) : null}
        </Aviso>
      ) : problema?.tipo === 'error' ? (
        <Aviso tipo="pendiente" titulo="No se pudo leer el GPS">
          {`${problema.mensaje} Intenta de nuevo o marca el punto a mano en el mapa.`}
        </Aviso>
      ) : null}

      <Boton
        titulo={ubicacion?.origen === 'gps' ? 'Volver a leer el GPS' : 'Usar mi ubicación actual (GPS)'}
        variante={ubicacion ? 'secundario' : 'principal'}
        onPress={() => void usarGps()}
        cargando={buscando}
      />
      {errores.ubicacion ? <Text className={tx.error}>✕ {errores.ubicacion}</Text> : null}
    </Pantalla>
  );
}
