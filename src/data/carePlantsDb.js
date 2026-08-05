import { getCatalogPlant } from "./plantsDb";
import { readCache, readCacheFlag, writeCache, writeCacheFlag } from "./localCache";

const STORAGE_KEY = "sproutlet.carePlants";
const FAVORITES_MIGRATION_KEY = "sproutlet.favoritesMigrated";

/** Persist only care fields — catalog details are re-hydrated on read. */
function toStoredCarePlant(item) {
  return {
    id: item.id,
    plant_id: item.plant_id,
    nickname: item.nickname,
    location: item.location ?? "",
    notes: item.notes ?? "",
    acquired_at: item.acquired_at ?? null,
    last_watered_at: item.last_watered_at ?? null,
    is_favorite: typeof item.is_favorite === "boolean" ? item.is_favorite : true,
    image_url: item.image_url ?? null,
    created_at: item.created_at ?? null,
  };
}

function readLocalCarePlants() {
  const parsed = readCache(STORAGE_KEY, []);
  if (!Array.isArray(parsed)) return [];

  let plants = parsed.map((item) => ({
    ...toStoredCarePlant(item),
    // Keep nested plant if an older cache already stored it (offline fallback)
    ...(item.plant ? { plant: item.plant } : {}),
  }));

  // One-time: seed favorites so the cabinet isn't empty after the feature shipped
  if (plants.length && !readCacheFlag(FAVORITES_MIGRATION_KEY)) {
    plants = plants.map((item) => ({ ...item, is_favorite: true }));
    writeLocalCarePlants(plants);
    writeCacheFlag(FAVORITES_MIGRATION_KEY);
  }

  return plants;
}

function writeLocalCarePlants(plants) {
  writeCache(STORAGE_KEY, plants.map(toStoredCarePlant));
}

function applyCatalogPlant(item, catalogPlant) {
  if (!catalogPlant) return item;
  return {
    ...item,
    image_url: catalogPlant.image_url ?? item.image_url ?? null,
    plant: catalogPlant,
  };
}

async function hydrateCarePlant(item) {
  try {
    const catalogPlant = await getCatalogPlant(item.plant_id);
    return applyCatalogPlant(item, catalogPlant);
  } catch {
    return item;
  }
}

export async function listCarePlants() {
  const plants = readLocalCarePlants();
  if (!plants.length) return [];

  const hydrated = await Promise.all(plants.map(hydrateCarePlant));
  // Re-persist lean rows; never fail the list if storage is full
  try {
    writeLocalCarePlants(hydrated);
  } catch {
    // Keep showing hydrated plants even if cache write fails
  }
  return hydrated;
}

export async function syncCareEntriesForPlant(catalogPlant) {
  if (!catalogPlant?.id) return readLocalCarePlants();

  const current = readLocalCarePlants();
  let changed = false;
  const next = current.map((item) => {
    if (String(item.plant_id) !== String(catalogPlant.id)) return item;
    changed = true;
    return applyCatalogPlant(item, catalogPlant);
  });

  if (changed) writeLocalCarePlants(next);
  return next;
}

export async function addPlantToCare({ plant, nickname = "", location = "", notes = "" }) {
  const current = readLocalCarePlants();
  const entry = {
    id: Date.now(),
    plant_id: plant.id,
    nickname: nickname || plant.common_name,
    location,
    notes,
    acquired_at: new Date().toISOString().slice(0, 10),
    last_watered_at: null,
    is_favorite: true,
    image_url: plant.image_url ?? null,
    plant,
    created_at: new Date().toISOString(),
  };
  writeLocalCarePlants([entry, ...current]);
  return entry;
}

export async function removeCarePlant(id) {
  const next = readLocalCarePlants().filter((item) => item.id !== id);
  writeLocalCarePlants(next);
}

export async function markCarePlantWatered(id) {
  const next = readLocalCarePlants().map((item) =>
    item.id === id
      ? { ...item, last_watered_at: new Date().toISOString() }
      : item,
  );
  writeLocalCarePlants(next);
  return next.find((item) => item.id === id) ?? null;
}

export async function toggleCarePlantFavorite(id) {
  const next = readLocalCarePlants().map((item) =>
    item.id === id ? { ...item, is_favorite: !item.is_favorite } : item,
  );
  writeLocalCarePlants(next);
  return next.find((item) => item.id === id) ?? null;
}

export function isPlantInCare(plantId, carePlants) {
  return carePlants.some((item) => item.plant_id === plantId);
}
