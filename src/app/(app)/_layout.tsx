// Grupo protegido (como en el taller): estas pantallas solo existen con una
// cuenta verificada. El paréntesis hace que "(app)" no aparezca en la ruta.
import { Stack } from 'expo-router';

import { useColor } from '@/animaciones/useColores';

export default function LayoutApp() {
  const papel = useColor('papel');
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: papel }, animation: 'slide_from_right' }} />;
}
