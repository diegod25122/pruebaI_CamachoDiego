import { router, usePathname } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Modal, Text, View } from 'react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';

import { Boton } from '@/components/Boton';
import { Cinta } from '@/components/Cinta';
import { tx } from '@/constants/clases';
import { tituloEstado } from '@/domain/lectura';
import { RUTA_PASO, useBorrador } from '@/state/borrador';
import { useSesion } from '@/state/sesion';
import { fechaHora } from '@/utils/formato';

// R8: al abrir la app con un registro a medias, ofrece continuarlo o
// descartarlo. Se revisa una sola vez por apertura (o al iniciar sesión).
// La tarjeta sube desde abajo con resorte (SlideInDown) sobre un velo que aparece.
export function ModalBorrador() {
  const { usuario, verificado } = useSesion();
  const { borrador, cargado, descartar } = useBorrador();
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const revisado = useRef(false);
  const dentro = usuario !== null && verificado;

  useEffect(() => {
    if (revisado.current || !cargado || !dentro) return;
    revisado.current = true;
    if (borrador !== null && !pathname.startsWith('/registro')) setVisible(true);
  }, [cargado, dentro, borrador, pathname]);

  if (!visible || !borrador) return null;

  const datos = borrador.datos;
  const resumen = [
    datos.estadoMedidor ? `Estado: ${tituloEstado(datos.estadoMedidor)}` : 'Aún sin estado',
    datos.lecturaTexto ? `Lectura: ${datos.lecturaTexto} m³` : null,
    datos.fotoNombre ? 'Con foto' : null,
  ]
    .filter(Boolean)
    .join(' · ');

  const continuar = () => {
    setVisible(false);
    router.push(RUTA_PASO[borrador.paso]);
  };
  const tirar = async () => {
    setVisible(false);
    await descartar();
  };

  return (
    <Modal transparent animationType="none" visible onRequestClose={() => setVisible(false)}>
      <Animated.View entering={FadeIn.duration(250)} className="flex-1 bg-velo justify-center p-4">
        <Animated.View
          entering={SlideInDown.springify().damping(16)}
          className="bg-papel rounded-2xl border-2 border-noche overflow-hidden">
          <Cinta alta animada />
          <View className="p-4 gap-2">
            <Text className={tx.etiqueta}>{borrador.editando ? 'Corrección sin terminar' : 'Registro sin terminar'}</Text>
            <Text className={`${tx.codigo} text-[26px] text-noche`}>{borrador.medidorCodigo}</Text>
            <Text className={tx.cuerpo}>
              La app se cerró en el paso {borrador.paso} de 4. {resumen}.
            </Text>
            <Text className={tx.pequeno}>Empezado: {fechaHora(borrador.iniciadoEn)}</Text>
            <View className="gap-2 mt-3">
              <Boton titulo="Continuar registro" onPress={continuar} />
              <Boton titulo="Descartar" variante="secundario" onPress={tirar} detalle="Se borra lo ingresado" />
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}
