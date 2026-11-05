import { Linking, Text, View } from 'react-native';

import { Boton } from '@/components/Boton';
import { Insignia } from '@/components/Insignia';
import { MapaLeaflet } from '@/components/mapa/MapaLeaflet';
import { tx } from '@/constants/clases';
import { textoCoordenadas, textoOrigen, type Ubicacion } from '@/domain/ubicacion';

interface Props {
  ubicacion: Ubicacion | null;
  titulo?: string;
}

// Taller 7: al consultar una lectura (o su medidor) se ve en el mapa el
// marcador del lugar donde se registró. Mapa de solo lectura.
export function UbicacionLectura({ ubicacion, titulo = 'Ubicación de la lectura' }: Props) {
  return (
    <View className="gap-3">
      <View className="flex-row items-center justify-between gap-2 flex-wrap">
        <Text className={tx.subtitulo}>{titulo}</Text>
        {ubicacion ? (
          <Insignia texto={ubicacion.origen === 'gps' ? 'GPS' : 'Manual'} tono="neutro" />
        ) : null}
      </View>
      {ubicacion ? (
        <>
          <MapaLeaflet ubicacion={ubicacion} alto={220} />
          <Text className={`text-[15px] text-noche ${tx.codigo}`}>{textoCoordenadas(ubicacion)}</Text>
          <Text className={tx.pequeno}>{textoOrigen(ubicacion)}</Text>
          <Boton
            titulo="Abrir en OpenStreetMap"
            variante="texto"
            onPress={() =>
              void Linking.openURL(
                `https://www.openstreetmap.org/?mlat=${ubicacion.latitud}&mlon=${ubicacion.longitud}#map=18/${ubicacion.latitud}/${ubicacion.longitud}`,
              )
            }
          />
        </>
      ) : (
        <Text className={tx.pequeno}>Esta lectura se registró sin ubicación.</Text>
      )}
    </View>
  );
}
