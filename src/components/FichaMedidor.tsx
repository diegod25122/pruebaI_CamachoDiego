import { StyleSheet, Text, View } from 'react-native';

import { Contador } from '@/components/Contador';
import { Ficha } from '@/components/Ficha';
import { Color, Espacio, Texto } from '@/constants/theme';
import type { Medidor } from '@/domain/medidor';
import { fecha, m3 } from '@/utils/formato';

function Dato({ etiqueta, valor, ancho }: { etiqueta: string; valor: string; ancho?: boolean }) {
  return (
    <View style={[styles.dato, ancho && styles.datoAncho]}>
      <Text style={Texto.etiqueta}>{etiqueta}</Text>
      <Text style={styles.valor}>{valor || '—'}</Text>
    </View>
  );
}

// R3: los siete datos del medidor que envía la oficina.
export function FichaMedidor({ medidor }: { medidor: Medidor }) {
  const activo = medidor.estado.toLowerCase() === 'activo';
  return (
    <Ficha acento={Color.agua}>
      <View style={styles.cabecera}>
        <Text style={[Texto.codigo, styles.codigo]}>{medidor.codigo}</Text>
        <View style={[styles.estado, activo ? styles.estadoActivo : styles.estadoOtro]}>
          <Text style={[styles.estadoTexto, activo ? styles.estadoTextoActivo : styles.estadoTextoOtro]}>
            {medidor.estado || 'Sin estado'}
          </Text>
        </View>
      </View>

      <View style={styles.grilla}>
        <Dato etiqueta="1 · Dirección" valor={medidor.direccion} ancho />
        <Dato etiqueta="2 · Sector" valor={medidor.sector} />
        <Dato etiqueta="3 · Nº de cuenta" valor={medidor.numeroCuenta} />
        <Dato etiqueta="4 · Estado" valor={medidor.estado} />
        <Dato etiqueta="7 · Consumo promedio" valor={`${m3(medidor.consumoPromedio)}/mes`} />
      </View>

      <View style={styles.ultima}>
        <Text style={Texto.etiqueta}>5 · Última lectura</Text>
        <Contador valor={medidor.ultimaLectura} tamano="mediano" />
        <Text style={styles.fecha}>6 · Tomada el {fecha(medidor.fechaUltimaLectura)}</Text>
      </View>
    </Ficha>
  );
}

const styles = StyleSheet.create({
  cabecera: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Espacio.s },
  codigo: { fontSize: 22, color: Color.noche },
  estado: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3, borderWidth: 1.5 },
  estadoActivo: { backgroundColor: Color.okFondo, borderColor: Color.ok },
  estadoOtro: { backgroundColor: Color.pendienteFondo, borderColor: Color.pendiente },
  estadoTexto: { fontWeight: '800', fontSize: 13 },
  estadoTextoActivo: { color: Color.ok },
  estadoTextoOtro: { color: Color.pendiente },
  grilla: { flexDirection: 'row', flexWrap: 'wrap', marginTop: Espacio.m, rowGap: Espacio.m },
  dato: { width: '50%', paddingRight: Espacio.s, gap: 2 },
  datoAncho: { width: '100%' },
  valor: { fontSize: 16, fontWeight: '700', color: Color.noche },
  ultima: {
    marginTop: Espacio.l,
    paddingTop: Espacio.m,
    borderTopWidth: 2,
    borderTopColor: Color.linea,
    borderStyle: 'dashed',
    gap: Espacio.s,
  },
  fecha: { fontSize: 14, fontWeight: '700', color: Color.tenue },
});
