<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import PlantCard from "../components/PlantCard.vue";
import { listCatalogPlants } from "../data/plantsDb";
import { addPlantToCare, isPlantInCare, listCarePlants } from "../data/carePlantsDb";

const router = useRouter();
const plants = ref([]);
const carePlants = ref([]);
const query = ref("");
const isLoading = ref(true);
const error = ref("");
const notice = ref("");

const filteredPlants = computed(() => {
  const q = query.value.trim().toLowerCase();
  if (!q) return plants.value;
  return plants.value.filter((plant) => {
    const haystack = [plant.common_name, plant.scientific_name, plant.description]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
});

async function refresh() {
  isLoading.value = true;
  error.value = "";
  try {
    const [catalog, care] = await Promise.all([listCatalogPlants(), listCarePlants()]);
    plants.value = catalog;
    carePlants.value = care;
  } catch (err) {
    error.value = err?.message || "Could not load the plant catalog.";
  } finally {
    isLoading.value = false;
  }
}

async function onAdd(plant) {
  notice.value = "";
  await addPlantToCare({ plant });
  carePlants.value = await listCarePlants();
  notice.value = `${plant.common_name} is now in your care.`;
}

function onOpen(plant) {
  router.push({ name: "plant-detail", params: { id: String(plant.id) } });
}

onMounted(refresh);
</script>

<template>
  <section class="grid gap-6">
    <div class="max-w-2xl">
      <h1 class="font-brand text-4xl font-semibold tracking-tight text-emerald-950 dark:text-emerald-50">
        Plant catalog
      </h1>
      <p class="mt-2 text-stone-600 dark:text-stone-300">
        Browse species, then pick which ones you are caring for. Shared catalog first — personal collection second.
      </p>
    </div>

    <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
      <UInput
        v-model="query"
        icon="i-lucide-search"
        placeholder="Search by name or care tip..."
        size="lg"
        class="w-full sm:max-w-md"
      />
      <p class="text-sm text-stone-500 dark:text-stone-400">
        {{ filteredPlants.length }} plant{{ filteredPlants.length === 1 ? "" : "s" }}
      </p>
    </div>

    <p
      v-if="notice"
      class="rounded-xl border border-emerald-700/20 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-300/20 dark:bg-emerald-950/50 dark:text-emerald-100"
    >
      {{ notice }}
    </p>

    <p
      v-if="error"
      class="rounded-xl border border-rose-500/30 bg-rose-50 px-4 py-3 text-sm text-rose-900 dark:bg-rose-950/40 dark:text-rose-100"
    >
      {{ error }}
    </p>

    <div v-if="isLoading" class="py-16 text-center text-sm text-stone-500">Loading catalog…</div>

    <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <PlantCard
        v-for="plant in filteredPlants"
        :key="plant.id"
        :plant="plant"
        :in-care="isPlantInCare(plant.id, carePlants)"
        @add="onAdd"
        @open="onOpen"
      />
    </div>
  </section>
</template>
