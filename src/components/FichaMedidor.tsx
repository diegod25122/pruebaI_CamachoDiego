import { Text, View } from 'react-native';

import { Contador } from '@/components/Contador';
import { Ficha } from '@/components/Ficha';
import { tx } from '@/constants/clases';
import type { Medidor } from '@/domain/medidor';
import { fecha, m3 } from '@/utils/formato';

function Dato({ etiqueta, valor, ancho }: { etiqueta: string; valor: string; ancho?: boolean }) {
  return (
    <View className={`gap-0.5 pr-2 ${ancho ? 'w-full' : 'w-1/2'}`}>
      <Text className={tx.etiqueta}>{etiqueta}</Text>
      <Text className="text-base font-bold text-noche">{valor || '—'}</Text>
    </View>
  );
}

// R3: los siete datos del medidor que envía la oficina.
export function FichaMedidor({ medidor }: { medidor: Medidor }) {
  const activo = medidor.estado.toLowerCase() === 'activo';
  return (
    <Ficha acento="bg-agua">
      <View className="flex-row items-center justify-between gap-2">
        <Text className={`${tx.codigo} text-[22px] text-noche`}>{medidor.codigo}</Text>
        <View
          className={`rounded-full px-2.5 py-0.5 border-[1.5px] ${
            activo ? 'bg-ok-fondo border-ok' : 'bg-pendiente-fondo border-pendiente'
          }`}>
          <Text className={`font-extrabold text-[13px] ${activo ? 'text-ok' : 'text-pendiente'}`}>
            {medidor.estado || 'Sin estado'}
          </Text>
        </View>
      </View>

      <View className="flex-row flex-wrap mt-3 gap-y-3">
        <Dato etiqueta="1 · Dirección" valor={medidor.direccion} ancho />
        <Dato etiqueta="2 · Sector" valor={medidor.sector} />
        <Dato etiqueta="3 · Nº de cuenta" valor={medidor.numeroCuenta} />
        <Dato etiqueta="4 · Estado" valor={medidor.estado} />
        <Dato etiqueta="7 · Consumo promedio" valor={`${m3(medidor.consumoPromedio)}/mes`} />
      </View>

      <View className="mt-4 pt-3 border-t-2 border-dashed border-linea gap-2">
        <Text className={tx.etiqueta}>5 · Última lectura</Text>
        <Contador valor={medidor.ultimaLectura} tamano="mediano" />
        <Text className="text-sm font-bold text-tenue">6 · Tomada el {fecha(medidor.fechaUltimaLectura)}</Text>
      </View>
    </Ficha>
  );
}
