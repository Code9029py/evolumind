import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const FIREBASE_CONFIG_STORAGE_KEY = 'evolumind_firebase_config_v1';

export const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyBW2Sjk74ltNiEWrDpUuTkXuQSDMavUAxM",
  authDomain: "evolumind-7759f.firebaseapp.com",
  projectId: "evolumind-7759f",
  storageBucket: "evolumind-7759f.firebasestorage.app",
  messagingSenderId: "71029083186",
  appId: "1:71029083186:web:7946cb333892eb8138802b",
  measurementId: "G-DPV9FT4KH4"
};

/**
 * Retrieves Firebase configuration from environment variables, localStorage, or defaults.
 */
export function getFirebaseConfig() {
  // 1. Check localStorage first (allows overriding config from Admin UI if needed)
  try {
    const customConfigStr = localStorage.getItem(FIREBASE_CONFIG_STORAGE_KEY);
    if (customConfigStr) {
      const parsed = JSON.parse(customConfigStr);
      if (parsed && parsed.apiKey && parsed.projectId) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading custom Firebase config:', e);
  }

  // 2. Check Vite environment variables
  if (import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.VITE_FIREBASE_PROJECT_ID) {
    return {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    };
  }

  // 3. Fall back to project's official Firebase credentials
  return DEFAULT_FIREBASE_CONFIG;
}

export function isFirebaseConfigured() {
  const config = getFirebaseConfig();
  return Boolean(config && config.apiKey && config.projectId);
}

export function saveFirebaseConfig(config) {
  try {
    if (!config || !config.apiKey || !config.projectId) {
      throw new Error('Configuración incompleta de Firebase.');
    }
    localStorage.setItem(FIREBASE_CONFIG_STORAGE_KEY, JSON.stringify(config));
    window.dispatchEvent(new Event('evolumind_firebase_config_changed'));
    return true;
  } catch (err) {
    console.error('Error al guardar Firebase config:', err);
    return false;
  }
}

export function clearFirebaseConfig() {
  localStorage.removeItem(FIREBASE_CONFIG_STORAGE_KEY);
  window.dispatchEvent(new Event('evolumind_firebase_config_changed'));
}

let appInstance = null;
let dbInstance = null;

export function getDb() {
  const config = getFirebaseConfig();
  if (!config) return null;

  try {
    if (!appInstance) {
      const existingApps = getApps();
      appInstance = existingApps.length > 0 ? getApp() : initializeApp(config);
    }
    if (!dbInstance) {
      dbInstance = getFirestore(appInstance);
    }
    return dbInstance;
  } catch (error) {
    console.error('Error inicializando Firestore:', error);
    return null;
  }
}
