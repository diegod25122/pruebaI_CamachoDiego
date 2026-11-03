import { useState } from 'react';
import { Pressable, Text, TextInput, View, type TextInputProps } from 'react-native';

import { tx } from '@/constants/clases';

interface Props extends TextInputProps {
  etiqueta: string;
  error?: string | null;
  ayuda?: string;
  obligatorio?: boolean;
  /** "contador": campo grande negro, como los rodillos del medidor. */
  estilo?: 'normal' | 'contador';
  /** Contraseña: oculta el texto y muestra el botón Mostrar/Ocultar (como en el taller). */
  esClave?: boolean;
}

export function Campo({
  etiqueta,
  error,
  ayuda,
  obligatorio,
  estilo = 'normal',
  esClave = false,
  className = '',
  ...input
}: Props) {
  const [enfocado, setEnfocado] = useState(false);
  const [claveVisible, setClaveVisible] = useState(false);

  // El borde dice el estado: error > foco > reposo.
  const borde = error ? 'border-alerta border-[3px]' : enfocado ? 'border-noche border-b-chaleco border-b-[3px]' : 'border-noche';
  const contador = estilo === 'contador';

  return (
    <View className="gap-1">
      <Text className={tx.etiqueta}>
        {etiqueta}
        {obligatorio ? <Text className="text-alerta"> · obligatorio</Text> : null}
      </Text>
      <View
        className={`flex-row items-center border-2 rounded-[10px] px-3 ${
          contador ? 'bg-contador min-h-16' : 'bg-tarjeta min-h-[52px]'
        } ${borde}`}>
        <TextInput
          {...input}
          secureTextEntry={esClave && !claveVisible}
          autoCapitalize={input.autoCapitalize ?? (esClave ? 'none' : undefined)}
          autoCorrect={esClave ? false : input.autoCorrect}
          accessibilityLabel={etiqueta}
          accessibilityHint={error ?? ayuda}
          placeholderTextColorClassName={contador ? 'accent-tenue' : 'accent-niebla'}
          cursorColorClassName="accent-chaleco"
          onFocus={(e) => {
            setEnfocado(true);
            input.onFocus?.(e);
          }}
          onBlur={(e) => {
            setEnfocado(false);
            input.onBlur?.(e);
          }}
          className={`flex-1 py-3 ${
            contador
              ? 'text-blanco font-mono text-[32px] font-bold tracking-[6px] text-center'
              : 'text-noche text-[17px]'
          } ${className}`}
        />
        {esClave ? (
          <Pressable
            onPress={() => setClaveVisible((v) => !v)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={claveVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
            <Text className="pl-2 text-sm font-extrabold text-agua">{claveVisible ? 'Ocultar' : 'Mostrar'}</Text>
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <Text className={tx.error} accessibilityLiveRegion="polite">
          ✕ {error}
        </Text>
      ) : ayuda ? (
        <Text className={tx.pequeno}>{ayuda}</Text>
      ) : null}
    </View>
  );
}
