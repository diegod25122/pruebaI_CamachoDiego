/**
 * Conexión con Firebase (SDK web de JavaScript, funciona en Expo Go).
 * Igual que en el taller: los valores vienen de .env.local y Expo solo
 * expone a la app las variables que empiezan con EXPO_PUBLIC_.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, getReactNativePersistence, initializeAuth, type Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Si falta .env.local, Firebase lanza un "auth/invalid-api-key" poco claro.
const faltantes = Object.entries(firebaseConfig)
  .filter(([, valor]) => !valor)
  .map(([clave]) => clave);
if (faltantes.length) {
  throw new Error(
    `Falta la configuración de Firebase (${faltantes.join(', ')}). ` +
      'Copia .env.example como .env.local, pon los valores de tu proyecto y reinicia con "npx expo start -c".',
  );
}

// Con Fast Refresh este módulo puede ejecutarse más de una vez:
// getApps() evita el error "Firebase App named '[DEFAULT]' already exists".
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// initializeAuth solo se puede llamar una vez por app; si ya existe, se reutiliza.
function crearAuth(): Auth {
  try {
    // La sesión se guarda en AsyncStorage: el técnico sigue conectado
    // aunque cierre la app (R1).
    return initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
  } catch {
    return getAuth(app);
  }
}

export const auth = crearAuth();

// Los correos de recuperación y de verificación llegan en español.
auth.languageCode = 'es';
