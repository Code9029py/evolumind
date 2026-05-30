import { fallbackCatalog } from '../data/fallbackCatalog.js';
import { fallbackContact } from '../data/fallbackContact.js';

const APPS_SCRIPT_URL = import.meta.env.VITE_EVOLUMIND_SHEETS_URL;

async function fetchSheetResource(resource, fallback) {
  if (!APPS_SCRIPT_URL) return fallback;

  try {
    const response = await fetch(`${APPS_SCRIPT_URL}?resource=${resource}`);
    if (!response.ok) throw new Error(`Sheets request failed: ${response.status}`);
    const data = await response.json();
    return Array.isArray(data) ? data : fallback;
  } catch (error) {
    console.warn(`Using local fallback for ${resource}.`, error);
    return fallback;
  }
}

export function getCatalog() {
  return fetchSheetResource('catalog', fallbackCatalog);
}

export function getContactChannels() {
  return fetchSheetResource('contact', fallbackContact);
}
