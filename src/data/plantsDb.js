import { getSupabaseClient, isSupabaseConfigured } from "./supabaseClient";
import { seedPlants } from "./seedPlants";

export async function listCatalogPlants() {
  if (!isSupabaseConfigured()) {
    return structuredClone(seedPlants);
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("plants")
    .select("*")
    .order("common_name", { ascending: true });

  if (error) throw error;

  if (!data?.length) {
    return structuredClone(seedPlants);
  }

  return data;
}
