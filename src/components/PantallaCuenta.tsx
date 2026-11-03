/**
 * Plantilla de las pantallas de cuenta sin sesión (ingreso, crear cuenta,
 * recuperar, verificar correo): encabezado azul tinta con la cinta
 * reflectiva en movimiento y la hoja del formulario.
 *
 * La hoja recibe un estilo animado opcional: lo usa el login para sacudirla
 * cuando el ingreso falla (reto 2).
 */
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown, type AnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { ViewStyle } from 'react-native';

import { Cinta } from '@/components/Cinta';
import { Contador } from '@/components/Contador';
import { Ficha } from '@/components/Ficha';
import { tx } from '@/constants/clases';

interface Props {
  titulo: string;
  bajada?: string;
  conVolver?: boolean;
  children: ReactNode;
  pie?: ReactNode;
  estiloHoja?: AnimatedStyle<ViewStyle>;
}

export function PantallaCuenta({ titulo, bajada, conVolver, children, pie, estiloHoja }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView className="flex-1 bg-papel" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        keyboardShouldPersistTaps="handled">
        <View className="bg-noche px-4 pt-5 pb-5 gap-2">
          {conVolver ? (
            <Pressable
              onPress={() => router.back()}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Volver"
              className="self-start mb-1 px-3 py-1.5 rounded-full border-2 border-chaleco">
              <Text className="text-chaleco font-extrabold">‹ Volver</Text>
            </Pressable>
          ) : null}
          <Text className={`${tx.etiqueta} text-chaleco`}>Agua potable · Quito</Text>
          <Animated.Text
            entering={FadeInDown.duration(500)}
            className="text-[42px] leading-[44px] font-black text-blanco tracking-tighter">
            {titulo}
          </Animated.Text>
          <Contador valor={2026} digitos={6} tamano="pequeno" />
          {bajada ? <Text className="text-niebla text-[15px] font-semibold">{bajada}</Text> : null}
        </View>
        <Cinta alta animada />

        <Animated.View className="px-4 pt-5 gap-4" style={estiloHoja}>
          <Ficha acento="bg-chaleco" contenido="p-4 gap-4">
            {children}
          </Ficha>
          {pie}
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
