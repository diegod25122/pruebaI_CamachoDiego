import { Redirect } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Aviso } from '@/components/Aviso';
import { Boton } from '@/components/Boton';
import { CabeceraRegistro } from '@/components/CabeceraRegistro';
import { Campo } from '@/components/Campo';
import { Contador } from '@/components/Contador';
import { Pantalla } from '@/components/Pantalla';
import { SelectorEstado } from '@/components/SelectorEstado';
import { Color, Espacio, Texto } from '@/constants/theme';
import type { EstadoMedidor } from '@/domain/lectura';
import { CAMPOS_PASO_1, erroresDe, hayErrores } from '@/domain/reglas';
import { useRegistro } from '@/state/useRegistro';
import { m3, veces } from '@/utils/formato';

const MOTIVOS = ['Predio cerrado', 'Perro suelto', 'Caja tapada o sellada', 'Vehículo encima de la caja'];

// Paso 1 (R5): estado del medidor y, según el estado, lectura / motivo / daño.
export default function PasoEstado() {
  const { borrador, cargado, cambiarDatos, evaluacion, irA, salir } = useRegistro(1);
  const [mostrarErrores, setMostrarErrores] = useState(false);

  if (!cargado) return null;
  if (!borrador || !evaluacion) return <Redirect href="/" />;

  const { datos, referencia } = borrador;
  const errores = mostrarErrores ? erroresDe(evaluacion.errores, CAMPOS_PASO_1) : {};

  const elegirEstado = (estado: EstadoMedidor) => {
    // Inaccesible no admite lectura: se limpia lo que hubiera escrito.
    cambiarDatos(estado === 'inaccesible' ? { estadoMedidor: estado, lecturaTexto: '' } : { estadoMedidor: estado });
  };

  const siguiente = () => {
    if (hayErrores(erroresDe(evaluacion.errores, CAMPOS_PASO_1))) {
      setMostrarErrores(true);
      return;
    }
    irA(2);
  };

  const campoLectura = (obligatoria: boolean) => (
    <View style={styles.bloque}>
      <Campo
        etiqueta={obligatoria ? 'Lectura actual (m³)' : 'Lectura actual (m³) · opcional'}
        obligatorio={obligatoria}
        estilo="contador"
        value={datos.lecturaTexto}
        onChangeText={(t) => cambiarDatos({ lecturaTexto: t.replace(/\D/g, '') })}
        placeholder="000000"
        keyboardType="number-pad"
        maxLength={8}
        error={errores.lectura}
        ayuda={obligatoria ? undefined : 'Si el contador se puede leer, anótalo.'}
      />
      {referencia ? (
        <View style={styles.anterior}>
          <Text style={Texto.etiqueta}>Lectura anterior</Text>
          <Contador valor={referencia.lecturaAnterior} tamano="pequeno" />
        </View>
      ) : (
        <Text style={Texto.pequeno}>Sin datos del medidor: el consumo se calculará al recuperar la señal.</Text>
      )}
      {evaluacion.consumo !== null ? (
        <Text style={[styles.consumo, evaluacion.anomalo && styles.consumoAlerta]}>
          Consumo del mes: {m3(evaluacion.consumo)}
          {evaluacion.anomalo ? ` · ${veces(evaluacion.veces)} el promedio` : ''}
        </Text>
      ) : null}
    </View>
  );

  return (
    <Pantalla
      encabezado={<CabeceraRegistro borrador={borrador} paso={1} onSalir={salir} />}
      pie={
        <View style={styles.pie}>
          <Boton titulo="Siguiente" onPress={siguiente} />
        </View>
      }>
      <Text style={Texto.subtitulo}>¿Cómo encontraste el medidor?</Text>
      <SelectorEstado valor={datos.estadoMedidor} onCambiar={elegirEstado} error={errores.estado} />

      {datos.estadoMedidor === 'normal' ? campoLectura(true) : null}

      {datos.estadoMedidor === 'inaccesible' ? (
        <View style={styles.bloque}>
          <Aviso tipo="pendiente" titulo="No se registra lectura">
            Si no pudiste llegar al medidor, indica el motivo.
          </Aviso>
          <View style={styles.chips}>
            {MOTIVOS.map((m) => (
              <Pressable
                key={m}
                onPress={() => cambiarDatos({ motivo: m })}
                accessibilityRole="button"
                style={[styles.chip, datos.motivo === m && styles.chipActivo]}>
                <Text style={[styles.chipTexto, datos.motivo === m && styles.chipTextoActivo]}>{m}</Text>
              </Pressable>
            ))}
          </View>
          <Campo
            etiqueta="Motivo"
            obligatorio
            value={datos.motivo}
            onChangeText={(t) => cambiarDatos({ motivo: t })}
            placeholder="Ej. el predio estaba cerrado"
            multiline
            error={errores.motivo}
          />
        </View>
      ) : null}

      {datos.estadoMedidor === 'danado' ? (
        <View style={styles.bloque}>
          <Campo
            etiqueta="Descripción del daño"
            obligatorio
            value={datos.descripcionDanio}
            onChangeText={(t) => cambiarDatos({ descripcionDanio: t })}
            placeholder="Ej. vidrio roto, contador empañado"
            multiline
            error={errores.descripcion}
          />
          {campoLectura(false)}
          <Aviso tipo="info" titulo="En el siguiente paso">
            Con el medidor dañado, la foto es obligatoria.
          </Aviso>
        </View>
      ) : null}
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  pie: { flex: 1 },
  bloque: { gap: Espacio.m },
  anterior: { gap: 4 },
  consumo: { fontSize: 16, fontWeight: '800', color: Color.agua },
  consumoAlerta: { color: Color.alerta },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Espacio.s },
  chip: {
    borderWidth: 2,
    borderColor: Color.noche,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: Color.tarjeta,
  },
  chipActivo: { backgroundColor: Color.noche },
  chipTexto: { fontWeight: '700', color: Color.noche },
  chipTextoActivo: { color: Color.chaleco },
});
