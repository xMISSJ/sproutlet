/**
 * Shared cabinet silhouettes — pick the one that best matches a plant's shape.
 * Each id maps to a procedural mesh in src/three/createPlant.js.
 */
export const PLANT_FORMS = [
  {
    id: "broad-leaf",
    label: "Broad leaf",
    hint: "Monstera, philodendron, big round or split leaves",
  },
  {
    id: "upright-blades",
    label: "Upright blades",
    hint: "Tall sword-like leaves, upright blades",
  },
  {
    id: "trailing",
    label: "Trailing vine",
    hint: "Pothos, philodendron vines, hanging growth",
  },
  {
    id: "bushy",
    label: "Bushy mound",
    hint: "Ferns, pilea, full rounded foliage",
  },
  {
    id: "cactus",
    label: "Cactus / succulent",
    hint: "Columnar cactus, thick stems, few leaves",
  },
  {
    id: "upright-stems",
    label: "Upright stems",
    hint: "ZZ plant, stems with oval leaflets",
  },
];

export const DEFAULT_PLANT_FORM = "broad-leaf";

export function isValidPlantForm(id) {
  return PLANT_FORMS.some((form) => form.id === id);
}

export function normalizePlantForm(id) {
  return isValidPlantForm(id) ? id : DEFAULT_PLANT_FORM;
}

export function getPlantFormLabel(id) {
  return PLANT_FORMS.find((form) => form.id === id)?.label ?? "Broad leaf";
}
