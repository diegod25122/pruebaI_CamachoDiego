import { router, usePathname } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';

import { Boton } from '@/components/Boton';
import { Cinta } from '@/components/Cinta';
import { Borde, Color, Espacio, Radio, Texto } from '@/constants/theme';
import { tituloEstado } from '@/domain/lectura';
import { useSesion } from '@/state/sesion';
import { RUTA_PASO, useBorrador } from '@/state/borrador';
import { fechaHora } from '@/utils/formato';

// R8: al abrir la app con un registro a medias, ofrece continuarlo o
// descartarlo. Se revisa una sola vez por apertura (o al iniciar sesión).
export function ModalBorrador() {
  const { sesion } = useSesion();
  const { borrador, cargado, descartar } = useBorrador();
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const revisado = useRef(false);

  // Se decide una sola vez: cuando ya se leyó el borrador y hay sesión.
  useEffect(() => {
    if (revisado.current || !cargado || sesion === null) return;
    revisado.current = true;
    if (borrador !== null && !pathname.startsWith('/registro')) setVisible(true);
  }, [cargado, sesion, borrador, pathname]);

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
    <Modal transparent animationType="fade" visible onRequestClose={() => setVisible(false)}>
      <View style={styles.fondo}>
        <View style={styles.tarjeta}>
          <Cinta alto={12} />
          <View style={styles.cuerpo}>
            <Text style={Texto.etiqueta}>{borrador.editando ? 'Corrección sin terminar' : 'Registro sin terminar'}</Text>
            <Text style={[Texto.codigo, styles.codigo]}>{borrador.medidorCodigo}</Text>
            <Text style={Texto.cuerpo}>
              La app se cerró en el paso {borrador.paso} de 3. {resumen}.
            </Text>
            <Text style={Texto.pequeno}>Empezado: {fechaHora(borrador.iniciadoEn)}</Text>
            <View style={styles.botones}>
              <Boton titulo="Continuar registro" onPress={continuar} />
              <Boton titulo="Descartar" variante="secundario" onPress={tirar} detalle="Se borra lo ingresado" />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: 'rgba(11,31,51,0.7)', justifyContent: 'center', padding: Espacio.l },
  tarjeta: {
    backgroundColor: Color.papel,
    borderRadius: Radio.l,
    borderWidth: Borde,
    borderColor: Color.noche,
    overflow: 'hidden',
  },
  cuerpo: { padding: Espacio.l, gap: Espacio.s },
  codigo: { fontSize: 26, color: Color.noche },
  botones: { gap: Espacio.s, marginTop: Espacio.m },
});
