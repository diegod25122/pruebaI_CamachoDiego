import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Cinta } from '@/components/Cinta';
import { tx } from '@/constants/clases';

interface Props {
  titulo: string;
  antetitulo?: string;
  volver?: boolean | (() => void);
  derecha?: ReactNode;
  /** Contenido extra debajo del título (por ejemplo, el saludo animado). */
  extra?: ReactNode;
}

export function Encabezado({ titulo, antetitulo, volver, derecha, extra }: Props) {
  const alVolver =
    typeof volver === 'function' ? volver : () => (router.canGoBack() ? router.back() : router.replace('/'));
  return (
    <View>
      <View className="bg-papel px-4 py-3 gap-1">
        <View className="flex-row items-center gap-3">
          {volver ? (
            <Pressable
              onPress={alVolver}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Volver"
              className="w-11 h-11 rounded-full border-2 border-noche items-center justify-center bg-tarjeta">
              <Text className="text-[30px] leading-8 font-bold text-noche -mt-1">‹</Text>
            </Pressable>
          ) : null}
          <View className="flex-1">
            {antetitulo ? <Text className={`${tx.etiqueta} text-agua`}>{antetitulo}</Text> : null}
            <Text className={tx.titulo} numberOfLines={1} adjustsFontSizeToFit accessibilityRole="header">
              {titulo}
            </Text>
          </View>
          {derecha}
        </View>
        {extra}
      </View>
      <Cinta />
    </View>
  );
}
