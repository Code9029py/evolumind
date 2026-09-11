import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import { getDb, isFirebaseConfigured } from './firebase.js';
import {
  getStoredCatalog,
  saveStoredCatalog,
  getStoredThemes,
  saveStoredThemes,
  getStoredCategories,
  saveStoredCategories,
  DEFAULT_THEMES,
  DEFAULT_CATEGORIES,
} from './catalogStorage.js';
import { fallbackCatalog } from '../data/fallbackCatalog.js';

const CATALOG_COLLECTION = 'catalog';
const SETTINGS_COLLECTION = 'settings';
const THEMES_DOC = 'themes';
const CATEGORIES_DOC = 'categories';

/**
 * Subscribes to catalog updates in real-time.
 * If Firebase is configured, listens to Firestore `catalog` collection.
 * Otherwise, falls back to local storage and browser events.
 */
export function subscribeCatalog(onData, onError) {
  const db = getDb();

  if (!db || !isFirebaseConfigured()) {
    // Local mode
    onData(getStoredCatalog());

    const handleLocalUpdate = () => onData(getStoredCatalog());
    window.addEventListener('evolumind_catalog_updated', handleLocalUpdate);

    return () => {
      window.removeEventListener('evolumind_catalog_updated', handleLocalUpdate);
    };
  }

  // Firestore Real-Time Mode
  try {
    const colRef = collection(db, CATALOG_COLLECTION);
    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        if (snapshot.empty) {
          // If Firestore is completely empty, use fallback/local
          const current = getStoredCatalog();
          onData(current.length > 0 ? current : fallbackCatalog);
          return;
        }

        const items = [];
        snapshot.forEach((d) => {
          items.push({ id: d.id, ...d.data() });
        });

        // Update local cache for offline/instant-load
        saveStoredCatalog(items);
        onData(items);
      },
      (err) => {
        console.warn('Firestore subscription error, fallback to local:', err);
        if (onError) onError(err);
        onData(getStoredCatalog());
      }
    );

    return unsubscribe;
  } catch (error) {
    console.warn('Could not establish Firestore subscription:', error);
    onData(getStoredCatalog());
    return () => {};
  }
}

/**
 * Save or update a product online in Firestore and local storage.
 */
export async function saveProductOnline(product) {
  const db = getDb();

  // Save to local storage first
  const currentCatalog = getStoredCatalog();
  const exists = currentCatalog.some((p) => p.id === product.id);
  const updatedCatalog = exists
    ? currentCatalog.map((p) => (p.id === product.id ? product : p))
    : [product, ...currentCatalog];
  saveStoredCatalog(updatedCatalog);

  // If Firebase is ready, persist online
  if (db && isFirebaseConfigured()) {
    try {
      const docRef = doc(db, CATALOG_COLLECTION, product.id);
      await setDoc(docRef, product, { merge: true });
      return { success: true, online: true };
    } catch (error) {
      console.error('Error saving product to Firestore:', error);
      return { success: false, online: false, error };
    }
  }

  return { success: true, online: false };
}

/**
 * Mark product as deleted or permanently remove it.
 */
export async function deleteProductOnline(productId, permanent = false) {
  const db = getDb();

  // Update local storage
  const currentCatalog = getStoredCatalog();
  const updatedCatalog = permanent
    ? currentCatalog.filter((p) => p.id !== productId)
    : currentCatalog.map((p) => (p.id === productId ? { ...p, status: 'eliminado' } : p));
  saveStoredCatalog(updatedCatalog);

  if (db && isFirebaseConfigured()) {
    try {
      const docRef = doc(db, CATALOG_COLLECTION, productId);
      if (permanent) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { status: 'eliminado' }, { merge: true });
      }
      return { success: true, online: true };
    } catch (error) {
      console.error('Error deleting product in Firestore:', error);
      return { success: false, online: false, error };
    }
  }

  return { success: true, online: false };
}

/**
 * Seed initial fallback catalog into Firestore if it's currently empty.
 */
export async function seedCatalogOnline() {
  const db = getDb();
  if (!db || !isFirebaseConfigured()) {
    throw new Error('Firebase no está configurado.');
  }

  const snapshot = await getDocs(collection(db, CATALOG_COLLECTION));
  if (!snapshot.empty) {
    if (!confirm('La base de datos online ya tiene cuadernillos. ¿Deseas sobreescribir/añadir los predeterminados?')) {
      return false;
    }
  }

  for (const item of fallbackCatalog) {
    const docRef = doc(db, CATALOG_COLLECTION, item.id);
    await setDoc(docRef, item, { merge: true });
  }

  // Also seed themes and categories
  const themesRef = doc(db, SETTINGS_COLLECTION, THEMES_DOC);
  await setDoc(themesRef, { list: DEFAULT_THEMES }, { merge: true });

  const catsRef = doc(db, SETTINGS_COLLECTION, CATEGORIES_DOC);
  await setDoc(catsRef, { list: DEFAULT_CATEGORIES }, { merge: true });

  return true;
}

/**
 * Subscribe to themes.
 */
export function subscribeThemes(onData) {
  const db = getDb();
  if (!db || !isFirebaseConfigured()) {
    onData(getStoredThemes());
    return () => {};
  }

  try {
    const docRef = doc(db, SETTINGS_COLLECTION, THEMES_DOC);
    return onSnapshot(
      docRef,
      (snap) => {
        if (snap.exists() && Array.isArray(snap.data().list)) {
          const remoteThemes = snap.data().list;
          saveStoredThemes(remoteThemes);
          onData(remoteThemes);
        } else {
          onData(getStoredThemes());
        }
      },
      () => onData(getStoredThemes())
    );
  } catch (e) {
    onData(getStoredThemes());
    return () => {};
  }
}

export async function saveThemesOnline(themes) {
  saveStoredThemes(themes);
  const db = getDb();
  if (db && isFirebaseConfigured()) {
    try {
      const docRef = doc(db, SETTINGS_COLLECTION, THEMES_DOC);
      await setDoc(docRef, { list: themes }, { merge: true });
    } catch (e) {
      console.warn('Error syncing themes to Firestore:', e);
    }
  }
}

/**
 * Subscribe to categories.
 */
export function subscribeCategories(onData) {
  const db = getDb();
  if (!db || !isFirebaseConfigured()) {
    onData(getStoredCategories());
    return () => {};
  }

  try {
    const docRef = doc(db, SETTINGS_COLLECTION, CATEGORIES_DOC);
    return onSnapshot(
      docRef,
      (snap) => {
        if (snap.exists() && Array.isArray(snap.data().list)) {
          const remoteCats = snap.data().list;
          saveStoredCategories(remoteCats);
          onData(remoteCats);
        } else {
          onData(getStoredCategories());
        }
      },
      () => onData(getStoredCategories())
    );
  } catch (e) {
    onData(getStoredCategories());
    return () => {};
  }
}

export async function saveCategoriesOnline(categories) {
  saveStoredCategories(categories);
  const db = getDb();
  if (db && isFirebaseConfigured()) {
    try {
      const docRef = doc(db, SETTINGS_COLLECTION, CATEGORIES_DOC);
      await setDoc(docRef, { list: categories }, { merge: true });
    } catch (e) {
      console.warn('Error syncing categories to Firestore:', e);
    }
  }
}
