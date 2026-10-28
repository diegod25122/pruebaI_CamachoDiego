import { router, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { Alert } from 'react-native';

import type { PasoRegistro } from '@/db/borradorRepo';
import { evaluarCaptura } from '@/domain/reglas';
import { RUTA_PASO, useBorrador } from '@/state/borrador';

// Lo común a las tres pantallas del registro (R8).
export function useRegistro(paso: PasoRegistro) {
  const ctx = useBorrador();
  const { borrador, irAPaso, descartar } = ctx;
  const pasoGuardado = borrador?.paso;

  // Al entrar a la pantalla se guarda el paso: si la app se cierra aquí,
  // al volver se retoma en este mismo paso.
  useFocusEffect(
    useCallback(() => {
      if (pasoGuardado !== undefined && pasoGuardado !== paso) irAPaso(paso);
    }, [pasoGuardado, paso, irAPaso]),
  );

  const evaluacion = borrador ? evaluarCaptura(borrador.datos, borrador.referencia) : null;

  const irA = (destino: PasoRegistro) => {
    if (destino > paso) router.push(RUTA_PASO[destino]);
    else if (router.canGoBack()) router.back();
    else router.replace(RUTA_PASO[destino]);
  };

  // Salir del registro: guardarlo para después o descartarlo.
  const salir = () => {
    Alert.alert('¿Salir del registro?', 'Puedes dejarlo guardado y continuar después, o descartarlo.', [
      { text: 'Seguir aquí', style: 'cancel' },
      { text: 'Guardar para después', onPress: () => router.dismissTo('/') },
      {
        text: 'Descartar',
        style: 'destructive',
        onPress: () => {
          // Primero se sale y luego se borra, para no redibujar el paso vacío.
          router.dismissTo('/');
          void descartar();
        },
      },
    ]);
  };

  return { ...ctx, evaluacion, irA, salir };
}
