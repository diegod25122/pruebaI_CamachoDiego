import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Boton } from '@/components/Boton';
import { Campo } from '@/components/Campo';
import { Cinta } from '@/components/Cinta';
import { Contador } from '@/components/Contador';
import { Ficha } from '@/components/Ficha';
import { Pantalla } from '@/components/Pantalla';
import { Color, Espacio, Texto } from '@/constants/theme';
import { useSesion } from '@/state/sesion';

// R1: el técnico se identifica con su código de empleado y su clave.
export default function LoginScreen() {
  const { iniciarSesion } = useSesion();
  const [codigo, setCodigo] = useState('');
  const [clave, setClave] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const ingresar = async () => {
    if (!codigo.trim() || !clave) {
      setError('Escribe tu código de empleado y tu clave.');
      return;
    }
    setCargando(true);
    const ok = await iniciarSesion(codigo, clave);
    setCargando(false);
    if (!ok) setError('Código de empleado o clave incorrectos.');
    // Si es correcto, el layout cambia solo a la pantalla de inicio.
  };

  return (
    <Pantalla
      encabezado={
        <View>
          <View style={styles.marca}>
            <Text style={styles.antetitulo}>Agua potable · Quito</Text>
            <Text style={styles.titulo}>Ruta de{'\n'}Lecturas</Text>
            <Contador valor={2026} digitos={6} tamano="pequeno" />
          </View>
          <Cinta alto={12} />
        </View>
      }>
      <Ficha acento={Color.chaleco}>
        <View style={styles.formulario}>
          <Text style={Texto.subtitulo}>Iniciar jornada</Text>
          <Campo
            etiqueta="Código de empleado"
            value={codigo}
            onChangeText={(t) => {
              setCodigo(t);
              setError(null);
            }}
            placeholder="EMP-0000"
            autoCapitalize="characters"
            autoCorrect={false}
            returnKeyType="next"
          />
          <Campo
            etiqueta="Clave"
            value={clave}
            onChangeText={(t) => {
              setClave(t);
              setError(null);
            }}
            placeholder="••••••"
            secureTextEntry
            autoCapitalize="none"
            returnKeyType="go"
            onSubmitEditing={ingresar}
            error={error ?? undefined}
          />
          <Boton titulo="Ingresar" onPress={ingresar} cargando={cargando} />
          <Text style={Texto.pequeno}>Tu sesión queda abierta hasta que la cierres.</Text>
        </View>
      </Ficha>

    </Pantalla>
  );
}

const styles = StyleSheet.create({
  marca: { backgroundColor: Color.noche, paddingHorizontal: Espacio.l, paddingTop: Espacio.xl, paddingBottom: Espacio.l, gap: Espacio.s },
  antetitulo: { ...Texto.etiqueta, color: Color.chaleco },
  titulo: { fontSize: 44, lineHeight: 46, fontWeight: '900', color: Color.blanco, letterSpacing: -1 },
  lema: { color: '#C9D3DE', fontSize: 15, fontWeight: '600' },
  formulario: { gap: Espacio.l },
  prueba: { gap: 4, padding: Espacio.m, borderWidth: 2, borderStyle: 'dashed', borderColor: Color.linea, borderRadius: 10 },
  credencial: { fontSize: 15, color: Color.noche },
});
