import { StyleSheet, Text, View } from 'react-native';

import { Encabezado } from '@/components/Encabezado';
import { Pasos } from '@/components/Pasos';
import { Color, Espacio } from '@/constants/theme';
import type { Borrador } from '@/db/borradorRepo';

interface Props {
  borrador: Borrador;
  paso: 1 | 2 | 3;
  onSalir: () => void;
}

export function CabeceraRegistro({ borrador, paso, onSalir }: Props) {
  return (
    <View>
      <Encabezado
        antetitulo={borrador.editando ? 'Corregir lectura' : 'Nueva lectura'}
        titulo={borrador.medidorCodigo}
        volver={onSalir}
      />
      <View style={styles.pasos}>
        <Pasos actual={paso} />
        {borrador.medidor ? (
          <Text style={styles.direccion} numberOfLines={1}>
            {borrador.medidor.direccion} · {borrador.medidor.sector}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pasos: { paddingHorizontal: Espacio.l, paddingTop: Espacio.m, gap: Espacio.s, backgroundColor: Color.papel },
  direccion: { fontSize: 14, fontWeight: '700', color: Color.agua },
});
