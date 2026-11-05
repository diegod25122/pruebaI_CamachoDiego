import { useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Alert, Image, Text, View } from 'react-native';

import { Animacion } from '@/components/Animacion';
import { Aviso } from '@/components/Aviso';
import { Boton } from '@/components/Boton';
import { Contador } from '@/components/Contador';
import { Encabezado } from '@/components/Encabezado';
import { Ficha } from '@/components/Ficha';
import { InsigniaEnvio, InsigniaVerificacion } from '@/components/Insignia';
import { Pantalla } from '@/components/Pantalla';
import { UbicacionLectura } from '@/components/UbicacionLectura';
import { useColor } from '@/animaciones/useColores';
import { tx } from '@/constants/clases';
import { esEditable, tituloEstado, type LecturaLocal } from '@/domain/lectura';
import type { Medidor } from '@/domain/medidor';
import { claves } from '@/query/keys';
import { useLecturaLocal } from '@/query/hooks';
import { uriDeFoto } from '@/services/fotos';
import { RUTA_PASO, useBorrador } from '@/state/borrador';
import { fechaHora, m3, nombrePeriodo } from '@/utils/formato';

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <View className="flex-1 gap-1">
      <Text className={tx.etiqueta}>{etiqueta}</Text>
      <Text className="text-base font-bold text-noche">{valor}</Text>
    </View>
  );
}

function AvisoEstado({ l, recienGuardada }: { l: LecturaLocal; recienGuardada: boolean }) {
  switch (l.envio) {
    case 'pendiente':
      return (
        <Aviso tipo="pendiente" titulo={recienGuardada ? 'Lectura guardada en el teléfono' : 'Por enviar'}>
          {l.mensaje ??
            'Se enviará sola cuando haya señal. Antes se comparará con la lectura anterior de la oficina. Mientras tanto puedes corregirla.'}
        </Aviso>
      );
    case 'enviando':
      return (
        <Aviso tipo="info" titulo="Enviando a la oficina…">
          Espera a que termine. Si la señal se corta, se comprobará en la oficina antes de reenviarla para no duplicarla.
        </Aviso>
      );
    case 'revision':
      return (
        <Aviso tipo="alerta" titulo="Debes corregirla">
          {l.mensaje ?? 'Con los datos actualizados no cumple las reglas.'}
        </Aviso>
      );
    case 'enviada':
      return (
        <Aviso tipo="ok" titulo={`Enviada · ${fechaHora(l.enviadaEn)}`}>
          La oficina ya la tiene. Una lectura enviada no se puede modificar.
        </Aviso>
      );
    case 'rechazada':
      return (
        <Aviso tipo="alerta" titulo="Rechazada">
          {l.mensaje ?? 'La oficina no la aceptó.'}
        </Aviso>
      );
  }
}

export default function LecturaScreen() {
  const { id, guardada } = useLocalSearchParams<{ id: string; guardada?: string }>();
  const client = useQueryClient();
  const { data: l, isPending } = useLecturaLocal(id);
  const colorNoche = useColor('noche');
  const { borrador, iniciarCorreccion, descartar } = useBorrador();

  if (isPending) {
    return (
      <Pantalla encabezado={<Encabezado titulo="Lectura" volver />}>
        <ActivityIndicator size="large" color={colorNoche} />
      </Pantalla>
    );
  }
  if (!l) {
    return (
      <Pantalla encabezado={<Encabezado titulo="Lectura" volver />}>
        <Aviso tipo="alerta" titulo="No encontrada">
          Esta lectura no está en el teléfono.
        </Aviso>
      </Pantalla>
    );
  }

  const fotoUri = l.fotoNombre ? uriDeFoto(l.fotoNombre) : null;

  // R10: solo se corrige mientras no se haya enviado.
  const corregir = () => {
    const arrancar = async () => {
      const medidor = client.getQueryData<Medidor | null>(claves.medidor(l.medidorCodigo)) ?? null;
      await iniciarCorreccion(l, medidor);
      router.push(RUTA_PASO[1]);
    };
    if (!borrador) return void arrancar();
    if (borrador.editando && borrador.id === l.id) {
      router.push(RUTA_PASO[borrador.paso]);
      return;
    }
    Alert.alert('Tienes un registro sin terminar', `Del medidor ${borrador.medidorCodigo}.`, [
      { text: 'Continuar ese', onPress: () => router.push(RUTA_PASO[borrador.paso]) },
      { text: 'Descartarlo y corregir esta', style: 'destructive', onPress: () => void descartar().then(arrancar) },
    ]);
  };

  return (
    <Pantalla encabezado={<Encabezado antetitulo={`Lectura de ${nombrePeriodo(l.periodo)}`} titulo={l.medidorCodigo} volver />}>
      <View className="flex-row gap-2 flex-wrap">
        <InsigniaEnvio envio={l.envio} />
        {l.envio !== 'rechazada' ? <InsigniaVerificacion verificacion={l.verificacion} /> : null}
      </View>

      {/* Taller 7 · Lottie 2: confirmación de la lectura recién guardada. */}
      {guardada === '1' ? <Animacion tipo="exito" tamano={130} texto="¡Lectura guardada!" /> : null}

      <AvisoEstado l={l} recienGuardada={guardada === '1'} />

      <Ficha acento={l.anomalo ? 'bg-alerta' : l.envio === 'enviada' ? 'bg-ok' : 'bg-chaleco'} punteada={l.envio !== 'enviada'}>
        <View className="gap-3">
          <Dato etiqueta="Estado del medidor" valor={tituloEstado(l.estadoMedidor)} />
          {l.estadoMedidor !== 'inaccesible' ? (
            <View className="flex-1 gap-1">
              <Text className={tx.etiqueta}>Lectura</Text>
              <Contador valor={l.lectura} tamano="mediano" alerta={l.anomalo} />
            </View>
          ) : null}
          <View className="flex-row gap-3">
            <Dato etiqueta="Lectura anterior" valor={m3(l.lecturaAnterior)} />
            <Dato etiqueta="Consumo" valor={l.consumo === null ? 'Por calcular' : m3(l.consumo)} />
          </View>
          <View className="flex-row gap-3">
            <Dato etiqueta="Promedio mensual" valor={m3(l.consumoPromedio)} />
            <Dato etiqueta="Anomalía" valor={l.anomalo ? (l.anomaliaConfirmada ? 'Sí · revisada' : 'Sí') : 'No'} />
          </View>
          {l.motivo ? <Dato etiqueta="Motivo" valor={l.motivo} /> : null}
          {l.descripcionDanio ? <Dato etiqueta="Daño" valor={l.descripcionDanio} /> : null}
          <View className="flex-row gap-3">
            <Dato etiqueta="Registrada" valor={fechaHora(l.registradaEn)} />
            <Dato etiqueta="Técnico" valor={l.tecnicoCodigo} />
          </View>
          <Dato etiqueta="Identificador de envío" valor={l.id.slice(0, 8)} />
        </View>
      </Ficha>

      <UbicacionLectura ubicacion={l.ubicacion} />

      <View className="gap-3">
        <Text className={tx.subtitulo}>Foto del medidor</Text>
        {l.fotoNombre === null ? (
          <Text className={tx.pequeno}>Sin foto.</Text>
        ) : fotoUri ? (
          <Image source={{ uri: fotoUri }} className="w-full aspect-[4/3] rounded-[10px] border-2 border-noche bg-linea" accessibilityLabel="Foto del medidor" />
        ) : (
          <Aviso tipo="alerta" titulo="No se encontró la foto">
            El archivo ya no está en el teléfono.
          </Aviso>
        )}
      </View>

      {esEditable(l) ? (
        <Boton titulo="Corregir lectura" onPress={corregir} detalle="Solo mientras no se haya enviado" />
      ) : l.envio === 'enviada' ? (
        <View className="p-3 rounded-[10px] border-2 border-dashed border-ok items-center">
          <Text className="font-black text-ok text-base">🔒 Enviada: ya no se puede corregir</Text>
        </View>
      ) : null}
    </Pantalla>
  );
}
