import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated';

import { Aviso } from '@/components/Aviso';
import { Boton } from '@/components/Boton';
import { Campo } from '@/components/Campo';
import { Encabezado } from '@/components/Encabezado';
import { Ficha } from '@/components/Ficha';
import { Pantalla } from '@/components/Pantalla';
import { TarjetaLectura } from '@/components/TarjetaLectura';
import { tx } from '@/constants/clases';
import { periodoDe } from '@/domain/lectura';
import { validarCodigoMedidor } from '@/domain/medidor';
import { useResumenLocal } from '@/query/hooks';
import { RUTA_PASO, useBorrador } from '@/state/borrador';
import { useSesion } from '@/state/sesion';
import { useSync } from '@/sync/SyncProvider';
import { nombrePeriodo } from '@/utils/formato';

export default function InicioScreen() {
  const { usuario, nombre } = useSesion();
  const { borrador } = useBorrador();
  const { conexion, enviando, sincronizarAhora } = useSync();
  const { lecturas, porEnviar, enRevision, enviadas } = useResumenLocal();
  const [codigo, setCodigo] = useState('');
  const [error, setError] = useState<string | null>(null);

  const periodo = periodoDe(new Date());
  // Para el saludo basta el primer nombre (como en el taller).
  const primerNombre = nombre?.split(' ')[0] || usuario?.email?.split('@')[0] || 'técnico';

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

  return (
    <Pantalla
      encabezado={
        <Encabezado
          antetitulo="Bienvenido a la APP"
          titulo={`Hola, ${primerNombre}`}
          derecha={
            <Pressable
              onPress={() => router.push('/cuenta')}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Mi cuenta"
              className="px-3 py-2 rounded-full border-2 border-noche bg-tarjeta">
              <Text className="font-black text-noche">Mi cuenta</Text>
            </Pressable>
          }
          extra={
            // Saludo animado (como en el taller): confirma que el ingreso funcionó.
            <Animated.Text entering={FadeInDown.duration(800).delay(150)} className={tx.pequeno}>
              Técnico de campo · {usuario?.email}
            </Animated.Text>
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

      <Ficha acento="bg-chaleco" contenido="p-4 gap-3">
        <Text className={tx.subtitulo}>Consultar medidor</Text>
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
          className="font-mono font-bold tracking-wide"
        />
        <Boton titulo="Consultar" onPress={consultar} />
      </Ficha>

      <View className="flex-row gap-2">
        <Resumen numero={porEnviar} texto="por enviar" borde="border-pendiente" color="text-pendiente" />
        <Resumen numero={enRevision} texto="por corregir" borde="border-alerta" color="text-alerta" />
        <Resumen numero={enviadas} texto="enviadas" borde="border-ok" color="text-ok" />
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

      <View className="gap-3">
        <Text className={tx.etiqueta}>Lecturas de {nombrePeriodo(periodo)} y anteriores</Text>
        {lecturas.length === 0 ? (
          <Text className={tx.pequeno}>Aún no registras lecturas en este teléfono.</Text>
        ) : (
          lecturas.map((l, i) => (
            // Animación 7 · Lista escalonada: cada tarjeta entra un poco después
            // de la anterior y, si cambia de estado, se reacomoda con resorte.
            <Animated.View
              key={l.id}
              entering={FadeInDown.delay(Math.min(i, 8) * 70).springify().damping(16)}
              layout={LinearTransition.springify()}>
              <TarjetaLectura
                lectura={l}
                onPress={() => router.push({ pathname: '/lectura/[id]', params: { id: l.id } })}
              />
            </Animated.View>
          ))
        )}
      </View>
    </Pantalla>
  );
}

function Resumen({ numero, texto, borde, color }: { numero: number; texto: string; borde: string; color: string }) {
  return (
    <View className={`flex-1 border-2 rounded-[10px] bg-tarjeta py-2 items-center ${borde}`}>
      <Text className={`text-[28px] font-black ${color}`}>{numero}</Text>
      <Text className="text-xs font-extrabold text-tenue">{texto}</Text>
    </View>
  );
}
