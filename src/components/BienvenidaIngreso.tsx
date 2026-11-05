// Taller 7 · Lottie: confirma que el ingreso fue correcto.
//
// Va en el layout raíz y no en login.tsx porque, al iniciar sesión, Firebase
// cambia la sesión y Stack.Protected desmonta el login al instante: una
// animación puesta ahí no alcanzaría a verse.
//
// Solo aparece cuando se pasa de "sin sesión" a "con sesión verificada"
// mientras la app está abierta. Al abrir la app con la sesión ya guardada no
// aparece (no hubo ingreso).

import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { Animacion } from '@/components/Animacion';
import { useSesion } from '@/state/sesion';

const DURACION_MS = 2600; // lo que dura exito.json (2,5 s) y un respiro

export function BienvenidaIngreso() {
  const { usuario, verificado, cargando, nombre } = useSesion();
  const dentro = usuario !== null && verificado;
  const antes = useRef<boolean | null>(null); // null = todavía no se sabe
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (cargando) return;
    if (antes.current === false && dentro) setVisible(true);
    antes.current = dentro;
  }, [cargando, dentro]);

  useEffect(() => {
    if (!visible) return;
    const id = setTimeout(() => setVisible(false), DURACION_MS);
    return () => clearTimeout(id);
  }, [visible]);

  if (!visible) return null;

  const saludo = nombre ? `¡Bienvenido, ${nombre.split(' ')[0]}!` : '¡Bienvenido!';
  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(300)}
      pointerEvents="none"
      className="absolute inset-0 items-center justify-center bg-velo">
      <View className="mx-8 px-8 py-6 rounded-2xl border-2 border-noche bg-tarjeta items-center">
        <Animacion tipo="exito" tamano={140} texto={saludo} />
      </View>
    </Animated.View>
  );
}
