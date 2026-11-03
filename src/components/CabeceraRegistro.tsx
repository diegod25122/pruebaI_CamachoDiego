import { Text, View } from 'react-native';

import { Encabezado } from '@/components/Encabezado';
import { Pasos } from '@/components/Pasos';
import type { Borrador } from '@/db/borradorRepo';

interface Props {
  borrador: Borrador;
  paso: 1 | 2 | 3;
  onSalir: () => void;
}

export function CabeceraRegistro({ borrador, paso, onSalir }: Props) {
  return (
    <View>
      <Encabezado
        antetitulo={borrador.editando ? 'Corregir lectura' : 'Nueva lectura'}
        titulo={borrador.medidorCodigo}
        volver={onSalir}
      />
      <View className="px-4 pt-3 gap-2 bg-papel">
        <Pasos actual={paso} />
        {borrador.medidor ? (
          <Text className="text-sm font-bold text-agua" numberOfLines={1}>
            {borrador.medidor.direccion} · {borrador.medidor.sector}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
