/**
 * Muestra una lectura como el contador de rodillos del medidor de agua.
 *
 * Animación 3 · Rodillos que giran: cada dígito entra desde arriba con un
 * resorte (withSpring), uno tras otro (withDelay), como los rodillos reales
 * del medidor al girar. Si el valor cambia, solo ruedan los dígitos nuevos.
 */
import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSpring } from 'react-native-reanimated';

type Tamano = 'grande' | 'mediano' | 'pequeno';

interface Props {
  valor: number | null;
  digitos?: number;
  tamano?: Tamano;
  alerta?: boolean;
}

const CAJA: Record<Tamano, string> = {
  grande: 'w-[34px] h-12',
  mediano: 'w-6 h-[34px]',
  pequeno: 'w-[17px] h-6',
};
const TEXTO: Record<Tamano, string> = {
  grande: 'text-[30px]',
  mediano: 'text-[21px]',
  pequeno: 'text-[15px]',
};
const UNIDAD: Record<Tamano, string> = {
  grande: 'text-base',
  mediano: 'text-xs',
  pequeno: 'text-[9px]',
};
const ALTO: Record<Tamano, number> = { grande: 48, mediano: 34, pequeno: 24 };

function Rodillo({ digito, orden, tamano, alerta }: { digito: string; orden: number; tamano: Tamano; alerta?: boolean }) {
  const y = useSharedValue(-ALTO[tamano]);

  useEffect(() => {
    y.value = -ALTO[tamano];
    y.value = withDelay(orden * 55, withSpring(0, { damping: 14, stiffness: 160 }));
  }, [digito, orden, tamano, y]);

  const estilo = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));

  return (
    <View
      className={`${CAJA[tamano]} overflow-hidden items-center justify-center rounded border ${
        alerta ? 'bg-alerta border-alerta' : 'bg-contador border-contador-borde'
      }`}>
      <Animated.Text className={`${TEXTO[tamano]} font-mono font-bold text-blanco`} style={estilo}>
        {digito}
      </Animated.Text>
    </View>
  );
}

export function Contador({ valor, digitos = 6, tamano = 'mediano', alerta }: Props) {
  const texto = valor === null ? '–'.repeat(digitos) : String(valor).padStart(digitos, '0');
  return (
    <View
      className="flex-row items-end gap-[3px]"
      accessible
      accessibilityLabel={valor === null ? 'Sin lectura' : `${valor} metros cúbicos`}>
      {texto.split('').map((d, i) => (
        <Rodillo key={i} digito={d} orden={i} tamano={tamano} alerta={alerta} />
      ))}
      <Text className={`ml-1 font-extrabold text-tenue ${UNIDAD[tamano]}`}>m³</Text>
    </View>
  );
}
