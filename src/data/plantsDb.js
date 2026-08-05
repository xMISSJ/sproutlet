import { getSupabaseClient, isSupabaseConfigured } from "./supabaseClient";
import { seedPlants } from "./seedPlants";
import { getCustomPlant, listCustomPlants } from "./customPlantsDb";

function cloneSeeds() {
  return structuredClone(seedPlants).map((plant) => ({ ...plant, source: "seed" }));
}

function matchesQuery(plant, query) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = [plant.common_name, plant.english_name, plant.scientific_name, plant.description]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(q);
}

async function loadLocalCatalog() {
  const custom = await listCustomPlants();
  return [...custom, ...cloneSeeds()];
}

/**
 * Catalog search used by the catalog page.
 * Custom plants you create + seed starters (Supabase when configured).
 */
export async function searchCatalogPlants({
  query = "",
  page = 1,
  careLevel = "all",
  pageSize = 12,
} = {}) {
  let all = [];

  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from("plants")
        .select("*")
        .order("common_name", { ascending: true });
      if (error) throw error;
      all = data?.length ? data.map((plant) => ({ ...plant, source: "supabase" })) : await loadLocalCatalog();
    } catch {
      all = await loadLocalCatalog();
    }
  } else {
    all = await loadLocalCatalog();
  }

  // Always merge in custom plants when using Supabase so local creations still appear
  if (isSupabaseConfigured()) {
    const custom = await listCustomPlants();
    const ids = new Set(all.map((plant) => String(plant.id)));
    custom.forEach((plant) => {
      if (!ids.has(String(plant.id))) all.unshift(plant);
    });
  }

  const filtered = all.filter((plant) => {
    if (careLevel !== "all" && plant.care_level !== careLevel) return false;
    return matchesQuery(plant, query);
  });

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;

  return {
    plants: filtered.slice(start, start + pageSize),
    page: safePage,
    totalPages,
    total,
    source: filtered.some((plant) => plant.source === "custom") ? "local" : "seed",
  };
}

export async function listCatalogPlants() {
  const result = await searchCatalogPlants({ pageSize: 500 });
  return result.plants;
}

export async function getCatalogPlant(id) {
  const key = String(id);

  const custom = await getCustomPlant(key);
  if (custom) return custom;

  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from("plants").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      if (data) return { ...data, source: "supabase" };
    } catch {
      // fall through to seed
    }
  }

  const seed = cloneSeeds().find((plant) => String(plant.id) === key);
  if (!seed) throw new Error("Plant not found in the catalog.");
  return seed;
}
