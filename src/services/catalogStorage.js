import { fallbackCatalog } from '../data/fallbackCatalog.js';
import { fallbackContact } from '../data/fallbackContact.js';

const CATALOG_STORAGE_KEY = 'evolumind_catalog_v2';
const CONTACT_STORAGE_KEY = 'evolumind_contact_v2';
const THEMES_STORAGE_KEY = 'evolumind_themes_v1';
const CATEGORIES_STORAGE_KEY = 'evolumind_categories_v1';

export const DEFAULT_THEMES = ['Ansiedad', 'Estrés', 'Autoestima', 'Duelo', 'Relaciones'];
export const DEFAULT_CATEGORIES = [
  'Regulación Emocional',
  'Hábitos y Autocuidado',
  'Autoconocimiento',
  'Acompañamiento Emocional',
  'Vínculos y Comunicación',
];

export function getStoredCatalog() {
  try {
    const raw = localStorage.getItem(CATALOG_STORAGE_KEY);
    if (!raw) return fallbackCatalog;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : fallbackCatalog;
  } catch (error) {
    console.warn('Error reading catalog from localStorage, using fallback', error);
    return fallbackCatalog;
  }
}

export function saveStoredCatalog(products) {
  try {
    localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(products));
    window.dispatchEvent(new Event('evolumind_catalog_updated'));
    return true;
  } catch (error) {
    console.error('Error saving catalog to localStorage', error);
    return false;
  }
}

export function resetCatalogToDefault() {
  try {
    localStorage.removeItem(CATALOG_STORAGE_KEY);
    localStorage.removeItem(THEMES_STORAGE_KEY);
    localStorage.removeItem(CATEGORIES_STORAGE_KEY);
    window.dispatchEvent(new Event('evolumind_catalog_updated'));
    return fallbackCatalog;
  } catch (error) {
    console.error('Error resetting catalog', error);
    return fallbackCatalog;
  }
}

export function getStoredThemes() {
  try {
    const raw = localStorage.getItem(THEMES_STORAGE_KEY);
    if (!raw) return DEFAULT_THEMES;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_THEMES;
  } catch (e) {
    return DEFAULT_THEMES;
  }
}

export function saveStoredThemes(themes) {
  try {
    localStorage.setItem(THEMES_STORAGE_KEY, JSON.stringify(themes));
    return true;
  } catch (e) {
    return false;
  }
}

export function getStoredCategories() {
  try {
    const raw = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    if (!raw) return DEFAULT_CATEGORIES;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_CATEGORIES;
  } catch (e) {
    return DEFAULT_CATEGORIES;
  }
}

export function saveStoredCategories(categories) {
  try {
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
    return true;
  } catch (e) {
    return false;
  }
}

export function getStoredContact() {
  try {
    const raw = localStorage.getItem(CONTACT_STORAGE_KEY);
    if (!raw) return fallbackContact;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : fallbackContact;
  } catch (error) {
    return fallbackContact;
  }
}

export function saveStoredContact(channels) {
  try {
    localStorage.setItem(CONTACT_STORAGE_KEY, JSON.stringify(channels));
    window.dispatchEvent(new Event('evolumind_contact_updated'));
    return true;
  } catch (error) {
    console.error('Error saving contact to localStorage', error);
    return false;
  }
}
