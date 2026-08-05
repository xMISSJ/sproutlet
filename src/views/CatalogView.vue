<script setup>
import { onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import PlantCard from "../components/PlantCard.vue";
import { searchCatalogPlants } from "../data/plantsDb";
import { addPlantToCare, isPlantInCare, listCarePlants } from "../data/carePlantsDb";

const router = useRouter();
const plants = ref([]);
const carePlants = ref([]);
const query = ref("");
const careFilter = ref("all");
const page = ref(1);
const totalPages = ref(1);
const total = ref(0);
const isLoading = ref(true);
const error = ref("");
const notice = ref("");

const filters = [
  { id: "all", label: "All plants" },
  { id: "easy", label: "Easy care" },
  { id: "moderate", label: "Moderate" },
  { id: "fussy", label: "Fussy" },
];

let searchTimer = null;

async function refreshCare() {
  carePlants.value = await listCarePlants();
}

async function loadCatalog() {
  isLoading.value = true;
  error.value = "";
  try {
    const result = await searchCatalogPlants({
      query: query.value,
      page: page.value,
      careLevel: careFilter.value,
    });
    plants.value = result.plants;
    totalPages.value = result.totalPages;
    total.value = result.total;
    page.value = result.page;
  } catch (err) {
    error.value = err?.message || "Could not load the plant catalog.";
    plants.value = [];
  } finally {
    isLoading.value = false;
  }
}

function scheduleSearch() {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    page.value = 1;
    loadCatalog();
  }, 200);
}

async function onAdd(plant) {
  notice.value = "";
  try {
    await addPlantToCare({ plant });
    await refreshCare();
    notice.value = `${plant.common_name} is now in your care.`;
  } catch (err) {
    notice.value = err?.message || "Could not save that plant.";
  }
}

function onOpen(plant) {
  router.push({ name: "plant-detail", params: { id: String(plant.id) } });
}

function goToPage(next) {
  page.value = Math.min(Math.max(1, next), totalPages.value);
  loadCatalog();
}

onMounted(async () => {
  await Promise.all([loadCatalog(), refreshCare()]);
});

watch(careFilter, () => {
  page.value = 1;
  loadCatalog();
});

watch(query, scheduleSearch);
</script>

<template>
  <section class="grid gap-10 text-paper">
    <div class="anim-rise max-w-2xl">
      <h1 class="font-heading text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
        Plant catalog
      </h1>
      <p class="mt-3 max-w-xl text-base text-white/65 sm:text-lg">
        Browse species and add the ones you own into My plants.
      </p>

      <div class="mt-6 flex flex-wrap gap-2">
        <button
          v-for="filter in filters"
          :key="filter.id"
          type="button"
          class="cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition"
          :class="
            careFilter === filter.id
              ? 'border-0 bg-white text-hero'
              : 'border border-white/15 bg-white/5 text-white/75 hover:bg-white/10 hover:text-white'
          "
          @click="careFilter = filter.id"
        >
          {{ filter.label }}
        </button>
      </div>
    </div>

    <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
      <UInput
        v-model="query"
        icon="i-lucide-search"
        placeholder="Search the catalog..."
        size="lg"
        class="w-full sm:max-w-md"
      />
      <p class="text-sm text-white/50">
        {{ plants.length }} shown
        <span v-if="total"> · {{ total }} total</span>
      </p>
    </div>

    <p
      v-if="notice"
      class="rounded-2xl border border-mint/30 bg-mint/15 px-4 py-3 text-sm text-mint"
    >
      {{ notice }}
    </p>

    <p
      v-if="error"
      class="rounded-2xl border border-rose-400/30 bg-rose-950/40 px-4 py-3 text-sm text-rose-200"
    >
      {{ error }}
    </p>

    <div v-if="isLoading" class="py-16 text-center text-sm text-white/50">Loading catalog…</div>

    <template v-else>
      <div v-if="!plants.length" class="py-16 text-center text-sm text-white/50">
        No plants matched that search.
      </div>

      <div v-else class="anim-rise-delay-2 grid items-stretch gap-5 md:gap-5 pt-24 sm:grid-cols-1 xl:grid-cols-2">
        <PlantCard
          v-for="(plant, index) in plants"
          :key="plant.id"
          :plant="plant"
          :in-care="isPlantInCare(plant.id, carePlants)"
          :featured="index === 0 && plants.length === 1"
          @add="onAdd"
          @open="onOpen"
        />
      </div>

      <div
        v-if="totalPages > 1"
        class="flex flex-wrap items-center justify-between gap-3"
      >
        <p class="text-sm text-white/45">Page {{ page }} of {{ totalPages }}</p>
        <div class="flex gap-2">
          <button
            type="button"
            class="inline-flex h-10 cursor-pointer items-center rounded-full border border-white/20 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-default disabled:opacity-40"
            :disabled="page <= 1"
            @click="goToPage(page - 1)"
          >
            Previous
          </button>
          <button
            type="button"
            class="inline-flex h-10 cursor-pointer items-center rounded-full border border-white/20 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-default disabled:opacity-40"
            :disabled="page >= totalPages"
            @click="goToPage(page + 1)"
          >
            Next
          </button>
        </div>
      </div>
    </template>
  </section>
</template>
