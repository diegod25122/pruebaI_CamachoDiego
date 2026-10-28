import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Contador } from '@/components/Contador';
import { Ficha } from '@/components/Ficha';
import { InsigniaEnvio, InsigniaVerificacion } from '@/components/Insignia';
import { Color, Espacio, Texto } from '@/constants/theme';
import { tituloEstado, type LecturaLocal } from '@/domain/lectura';
import { fechaHora, m3 } from '@/utils/formato';

const ACENTO: Record<LecturaLocal['envio'], string> = {
  pendiente: Color.chaleco,
  enviando: Color.agua,
  revision: Color.alerta,
  enviada: Color.ok,
  rechazada: Color.alerta,
};

export function TarjetaLectura({ lectura, onPress }: { lectura: LecturaLocal; onPress: () => void }) {
  const sinEnviar = lectura.envio !== 'enviada';
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => pressed && styles.presionada}>
      <Ficha acento={ACENTO[lectura.envio]} punteada={sinEnviar} contenido={styles.contenido}>
        <View style={styles.fila}>
          <Text style={[Texto.codigo, styles.codigo]}>{lectura.medidorCodigo}</Text>
          <InsigniaEnvio envio={lectura.envio} />
        </View>
        <View style={styles.fila}>
          {lectura.lectura !== null ? (
            <Contador valor={lectura.lectura} tamano="pequeno" alerta={lectura.anomalo} />
          ) : (
            <Text style={styles.sinLectura}>{tituloEstado(lectura.estadoMedidor)} · sin lectura</Text>
          )}
          <Text style={[styles.consumo, lectura.anomalo && styles.consumoAlerta]}>
            {lectura.consumo !== null ? `+${m3(lectura.consumo)}` : ''}
          </Text>
        </View>
        <View style={styles.fila}>
          <Text style={Texto.pequeno}>
            {tituloEstado(lectura.estadoMedidor)} · {fechaHora(lectura.registradaEn)}
          </Text>
          {lectura.envio !== 'enviada' && lectura.envio !== 'rechazada' ? (
            <InsigniaVerificacion verificacion={lectura.verificacion} />
          ) : null}
        </View>
      </Ficha>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  presionada: { opacity: 0.85 },
  contenido: { gap: Espacio.s, padding: Espacio.m },
  fila: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Espacio.s, flexWrap: 'wrap' },
  codigo: { fontSize: 18, color: Color.noche },
  sinLectura: { fontSize: 15, fontWeight: '800', color: Color.pendiente },
  consumo: { fontSize: 15, fontWeight: '800', color: Color.agua },
  consumoAlerta: { color: Color.alerta },
});
