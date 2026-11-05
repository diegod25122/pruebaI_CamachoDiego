import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

interface Props {
  alto: number;
  sinMapa: boolean;
  children: ReactNode;
}

// Borde de tinta como el resto de fichas de la app. Si Leaflet no cargó (sin
// internet), se tapa el mapa con un aviso: la ubicación sigue guardándose.
export function MarcoMapa({ alto, sinMapa, children }: Props) {
  return (
    <View
      className="w-full rounded-[14px] border-2 border-noche overflow-hidden bg-agua-claro"
      style={{ height: alto }}>
      {children}
      {sinMapa ? (
        <View className="absolute inset-0 items-center justify-center bg-agua-claro p-4 gap-1">
          <Text className="text-base font-black text-agua">Mapa no disponible sin internet</Text>
          <Text className="text-[13px] text-tenue text-center">
            La ubicación se guarda igual con el GPS. El mapa se verá cuando vuelva la señal.
          </Text>
        </View>
      ) : null}
    </View>
  );
}
