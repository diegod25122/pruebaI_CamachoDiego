import type { ReactNode } from 'react';
import { View } from 'react-native';

interface Props {
  children: ReactNode;
  /** Clase del color de la "sombra" desplazada, ej. 'bg-chaleco'. */
  acento?: string;
  punteada?: boolean;
  className?: string;
  /** Clases extra para la cara de la ficha (padding, gap...). */
  contenido?: string;
}

// Ficha impresa con borde de tinta y una sombra dura desplazada, dibujada con
// una capa debajo (funciona igual en cualquier Android).
export function Ficha({ children, acento = 'bg-noche', punteada, className = '', contenido = 'p-4' }: Props) {
  return (
    <View className={`mr-1 mb-1 ${className}`}>
      <View className={`absolute top-1 left-1 -right-1 -bottom-1 rounded-2xl ${acento}`} />
      <View
        className={`bg-tarjeta border-2 border-noche rounded-2xl ${punteada ? 'border-dashed' : ''} ${contenido}`}>
        {children}
      </View>
    </View>
  );
}
