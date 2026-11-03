import { Pressable, Text, View } from 'react-native';

import { Contador } from '@/components/Contador';
import { Ficha } from '@/components/Ficha';
import { InsigniaEnvio, InsigniaVerificacion } from '@/components/Insignia';
import { tx } from '@/constants/clases';
import { tituloEstado, type LecturaLocal } from '@/domain/lectura';
import { fechaHora, m3 } from '@/utils/formato';

const ACENTO: Record<LecturaLocal['envio'], string> = {
  pendiente: 'bg-chaleco',
  enviando: 'bg-agua',
  revision: 'bg-alerta',
  enviada: 'bg-ok',
  rechazada: 'bg-alerta',
};

export function TarjetaLectura({ lectura, onPress }: { lectura: LecturaLocal; onPress: () => void }) {
  const sinEnviar = lectura.envio !== 'enviada';
  return (
    <Pressable onPress={onPress} accessibilityRole="button">
      <Ficha acento={ACENTO[lectura.envio]} punteada={sinEnviar} contenido="gap-2 p-3">
        <View className="flex-row items-center justify-between gap-2 flex-wrap">
          <Text className={`${tx.codigo} text-lg text-noche`}>{lectura.medidorCodigo}</Text>
          <InsigniaEnvio envio={lectura.envio} />
        </View>
        <View className="flex-row items-center justify-between gap-2 flex-wrap">
          {lectura.lectura !== null ? (
            <Contador valor={lectura.lectura} tamano="pequeno" alerta={lectura.anomalo} />
          ) : (
            <Text className="text-[15px] font-extrabold text-pendiente">
              {tituloEstado(lectura.estadoMedidor)} · sin lectura
            </Text>
          )}
          <Text className={`text-[15px] font-extrabold ${lectura.anomalo ? 'text-alerta' : 'text-agua'}`}>
            {lectura.consumo !== null ? `+${m3(lectura.consumo)}` : ''}
          </Text>
        </View>
        <View className="flex-row items-center justify-between gap-2 flex-wrap">
          <Text className={tx.pequeno}>
            {tituloEstado(lectura.estadoMedidor)} · {fechaHora(lectura.registradaEn)}
          </Text>
          {lectura.envio !== 'enviada' && lectura.envio !== 'rechazada' ? (
            <InsigniaVerificacion verificacion={lectura.verificacion} />
          ) : null}
        </View>
      </Ficha>
    </Pressable>
  );
}
