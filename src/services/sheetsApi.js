import { getStoredCatalog, saveStoredCatalog, getStoredContact, saveStoredContact } from './catalogStorage.js';

const APPS_SCRIPT_URL = import.meta.env.VITE_EVOLUMIND_SHEETS_URL;

export async function getCatalog() {
  const localData = getStoredCatalog();

  if (!APPS_SCRIPT_URL) {
    return localData;
  }

  // Fetch in background (stale-while-revalidate)
  try {
    const response = await fetch(`${APPS_SCRIPT_URL}?resource=catalog`);
    if (response.ok) {
      const remoteData = await response.json();
      if (Array.isArray(remoteData) && remoteData.length > 0) {
        saveStoredCatalog(remoteData);
        return remoteData;
      }
    }
  } catch (error) {
    console.warn('Sheets sync unavailable, using cached catalog.', error);
  }

  return localData;
}

export async function getContactChannels() {
  const localData = getStoredContact();

  if (!APPS_SCRIPT_URL) {
    return localData;
  }

  try {
    const response = await fetch(`${APPS_SCRIPT_URL}?resource=contact`);
    if (response.ok) {
      const remoteData = await response.json();
      if (Array.isArray(remoteData) && remoteData.length > 0) {
        saveStoredContact(remoteData);
        return remoteData;
      }
    }
  } catch (error) {
    console.warn('Sheets sync unavailable, using cached contact channels.', error);
  }

  return localData;
}
