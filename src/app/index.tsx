import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Aviso } from '@/components/Aviso';
import { Boton } from '@/components/Boton';
import { Campo } from '@/components/Campo';
import { Encabezado } from '@/components/Encabezado';
import { Ficha } from '@/components/Ficha';
import { Pantalla } from '@/components/Pantalla';
import { TarjetaLectura } from '@/components/TarjetaLectura';
import { Color, Espacio, Texto } from '@/constants/theme';
import { periodoDe } from '@/domain/lectura';
import { validarCodigoMedidor } from '@/domain/medidor';
import { useResumenLocal } from '@/query/hooks';
import { RUTA_PASO, useBorrador } from '@/state/borrador';
import { useSesion } from '@/state/sesion';
import { useSync } from '@/sync/SyncProvider';
import { nombrePeriodo } from '@/utils/formato';

export default function InicioScreen() {
  const { sesion, cerrarSesion } = useSesion();
  const { borrador } = useBorrador();
  const { conexion, enviando, sincronizarAhora } = useSync();
  const { lecturas, porEnviar, enRevision, enviadas } = useResumenLocal();
  const [codigo, setCodigo] = useState('');
  const [error, setError] = useState<string | null>(null);

  const periodo = periodoDe(new Date());

  // R2: con un código incompleto o mal escrito se muestra el error y no se
  // navega ni se consulta a la oficina.
  const consultar = () => {
    const r = validarCodigoMedidor(codigo);
    if (!r.ok) {
      setError(r.error);
      return;
    }
    setError(null);
    setCodigo(r.codigo);
    router.push({ pathname: '/medidor/[codigo]', params: { codigo: r.codigo } });
  };

  const salir = () => {
    const aviso =
      porEnviar > 0
        ? `Tienes ${porEnviar} lectura(s) sin enviar. Quedan guardadas en el teléfono y se enviarán cuando haya señal.`
        : 'Se te pedirá tu código y clave para volver a entrar.';
    Alert.alert('¿Cerrar sesión?', aviso, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar sesión', style: 'destructive', onPress: () => void cerrarSesion() },
    ]);
  };

  return (
    <Pantalla
      encabezado={
        <Encabezado
          antetitulo={`${sesion?.tecnico.codigo ?? ''} · ${sesion?.tecnico.zona ?? ''}`}
          titulo={`Hola, ${sesion?.tecnico.nombre.split(' ')[0] ?? ''}`}
          derecha={
            <Pressable onPress={salir} hitSlop={10} accessibilityRole="button" style={styles.salir}>
              <Text style={styles.salirTexto}>Salir</Text>
            </Pressable>
          }
        />
      }>
      {borrador ? (
        <Pressable onPress={() => router.push(RUTA_PASO[borrador.paso])} accessibilityRole="button">
          <Aviso tipo="pendiente" titulo={`Registro sin terminar · ${borrador.medidorCodigo}`}>
            {`Vas en el paso ${borrador.paso} de 3. Toca para continuar.`}
          </Aviso>
        </Pressable>
      ) : null}

      <Ficha acento={Color.chaleco}>
        <View style={styles.busqueda}>
          <Text style={Texto.subtitulo}>Consultar medidor</Text>
          <Campo
            etiqueta="Código de la etiqueta"
            value={codigo}
            onChangeText={(t) => {
              setCodigo(t.toUpperCase());
              setError(null);
            }}
            placeholder="MED-000000"
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={14}
            returnKeyType="search"
            onSubmitEditing={consultar}
            error={error ?? undefined}
            ayuda="Formato: MED- y seis números."
            style={Texto.codigo}
          />
          <Boton titulo="Consultar" onPress={consultar} />
        </View>
      </Ficha>

      <View style={styles.resumen}>
        <Resumen numero={porEnviar} texto="por enviar" color={Color.pendiente} />
        <Resumen numero={enRevision} texto="por corregir" color={Color.alerta} />
        <Resumen numero={enviadas} texto="enviadas" color={Color.ok} />
      </View>

      {porEnviar - enRevision > 0 && conexion === 'con-red' ? (
        <Boton
          titulo={enviando ? 'Enviando…' : 'Enviar ahora'}
          variante="secundario"
          cargando={enviando}
          onPress={sincronizarAhora}
          detalle="También se envían solas cada pocos segundos"
        />
      ) : null}

      <View style={styles.lista}>
        <Text style={Texto.etiqueta}>Lecturas de {nombrePeriodo(periodo)} y anteriores</Text>
        {lecturas.length === 0 ? (
          <Text style={Texto.pequeno}>Aún no registras lecturas en este teléfono.</Text>
        ) : (
          lecturas.map((l) => (
            <TarjetaLectura
              key={l.id}
              lectura={l}
              onPress={() => router.push({ pathname: '/lectura/[id]', params: { id: l.id } })}
            />
          ))
        )}
      </View>
    </Pantalla>
  );
}

function Resumen({ numero, texto, color }: { numero: number; texto: string; color: string }) {
  return (
    <View style={[styles.cajaResumen, { borderColor: color }]}>
      <Text style={[styles.numeroResumen, { color }]}>{numero}</Text>
      <Text style={styles.textoResumen}>{texto}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  salir: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 2, borderColor: Color.noche },
  salirTexto: { fontWeight: '900', color: Color.noche },
  busqueda: { gap: Espacio.m },
  resumen: { flexDirection: 'row', gap: Espacio.s },
  cajaResumen: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 10,
    backgroundColor: Color.tarjeta,
    paddingVertical: Espacio.s,
    alignItems: 'center',
  },
  numeroResumen: { fontSize: 28, fontWeight: '900' },
  textoResumen: { fontSize: 12, fontWeight: '800', color: Color.tenue },
  lista: { gap: Espacio.m },
});
