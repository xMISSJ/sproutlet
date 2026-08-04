import { normalizePlantForm } from "./plantForms";

const STORAGE_KEY = "sproutlet.customPlants";

function readCustomPlants() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeCustomPlants(plants) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plants));
}

export function isCustomPlantId(id) {
  return String(id).startsWith("custom-");
}

export async function listCustomPlants() {
  return readCustomPlants().sort((a, b) =>
    String(a.common_name).localeCompare(String(b.common_name)),
  );
}

export async function getCustomPlant(id) {
  return readCustomPlants().find((plant) => String(plant.id) === String(id)) ?? null;
}

export async function createCustomPlant(input) {
  const commonName = String(input.common_name ?? "").trim();
  if (!commonName) throw new Error("Give your plant a name.");

  const plant = {
    id: `custom-${Date.now()}`,
    common_name: commonName,
    scientific_name: String(input.scientific_name ?? "").trim() || null,
    description: String(input.description ?? "").trim() || "No description yet.",
    care_level: ["easy", "moderate", "fussy"].includes(input.care_level)
      ? input.care_level
      : "easy",
    light: String(input.light ?? "").trim() || "bright-indirect",
    water_frequency_days: Math.max(1, Number(input.water_frequency_days) || 7),
    humidity: String(input.humidity ?? "").trim() || "average",
    model_style: normalizePlantForm(input.model_style),
    image_url: input.image_url || null,
    source: "custom",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  writeCustomPlants([plant, ...readCustomPlants()]);
  return plant;
}

export async function updateCustomPlant(id, patch) {
  const current = readCustomPlants();
  const index = current.findIndex((plant) => String(plant.id) === String(id));
  if (index < 0) throw new Error("Custom plant not found.");

  const prev = current[index];
  const next = {
    ...prev,
    ...patch,
    id: prev.id,
    source: "custom",
    common_name: String(patch.common_name ?? prev.common_name).trim() || prev.common_name,
    scientific_name:
      patch.scientific_name === undefined
        ? prev.scientific_name
        : String(patch.scientific_name ?? "").trim() || null,
    description:
      patch.description === undefined
        ? prev.description
        : String(patch.description ?? "").trim() || "No description yet.",
    care_level: ["easy", "moderate", "fussy"].includes(patch.care_level)
      ? patch.care_level
      : prev.care_level,
    light:
      patch.light === undefined
        ? prev.light
        : String(patch.light ?? "").trim() || "bright-indirect",
    water_frequency_days:
      patch.water_frequency_days === undefined
        ? prev.water_frequency_days
        : Math.max(1, Number(patch.water_frequency_days) || 7),
    humidity:
      patch.humidity === undefined
        ? prev.humidity
        : String(patch.humidity ?? "").trim() || "average",
    model_style:
      patch.model_style === undefined
        ? normalizePlantForm(prev.model_style)
        : normalizePlantForm(patch.model_style),
    image_url: patch.image_url === undefined ? prev.image_url : patch.image_url || null,
    updated_at: new Date().toISOString(),
  };

  const plants = [...current];
  plants[index] = next;
  writeCustomPlants(plants);
  return next;
}

export async function deleteCustomPlant(id) {
  writeCustomPlants(readCustomPlants().filter((plant) => String(plant.id) !== String(id)));
}
