import { Pressable, Text, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';

import { tx } from '@/constants/clases';

interface Props {
  marcada: boolean;
  onCambiar: (marcada: boolean) => void;
  texto: string;
  error?: string;
}

export function Casilla({ marcada, onCambiar, texto, error }: Props) {
  return (
    <View className="gap-1">
      <Pressable
        onPress={() => onCambiar(!marcada)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: marcada }}
        className={`flex-row items-center gap-3 p-3 rounded-[10px] bg-tarjeta ${
          error ? 'border-[3px] border-alerta' : 'border-2 border-noche'
        }`}>
        <View
          className={`w-[30px] h-[30px] rounded-md border-2 border-noche items-center justify-center ${marcada ? 'bg-noche' : ''}`}>
          {marcada ? (
            <Animated.Text entering={ZoomIn.springify()} className="text-chaleco text-xl font-black">
              ✓
            </Animated.Text>
          ) : null}
        </View>
        <Text className="flex-1 text-base font-bold text-noche">{texto}</Text>
      </Pressable>
      {error ? <Text className={tx.error}>✕ {error}</Text> : null}
    </View>
  );
}
