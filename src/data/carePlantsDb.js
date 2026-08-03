const STORAGE_KEY = "sproutlet.carePlants";

function readLocalCarePlants() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalCarePlants(plants) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plants));
}

export async function listCarePlants() {
  return readLocalCarePlants();
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
    image_url: plant.image_url,
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

export function isPlantInCare(plantId, carePlants) {
  return carePlants.some((item) => item.plant_id === plantId);
}
