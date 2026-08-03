<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { listCatalogPlants } from "../data/plantsDb";
import { addPlantToCare, isPlantInCare, listCarePlants } from "../data/carePlantsDb";

const props = defineProps({
  id: {
    type: [String, Number],
    required: true,
  },
});

const router = useRouter();
const plant = ref(null);
const carePlants = ref([]);
const isLoading = ref(true);
const error = ref("");
const notice = ref("");

const inCare = computed(() => (plant.value ? isPlantInCare(plant.value.id, carePlants.value) : false));

async function refresh() {
  isLoading.value = true;
  error.value = "";
  try {
    const [catalog, care] = await Promise.all([listCatalogPlants(), listCarePlants()]);
    carePlants.value = care;
    plant.value = catalog.find((item) => String(item.id) === String(props.id)) ?? null;
    if (!plant.value) error.value = "Plant not found in the catalog.";
  } catch (err) {
    error.value = err?.message || "Could not load this plant.";
  } finally {
    isLoading.value = false;
  }
}

async function onAdd() {
  if (!plant.value || inCare.value) return;
  await addPlantToCare({ plant: plant.value });
  carePlants.value = await listCarePlants();
  notice.value = `${plant.value.common_name} is now in your care.`;
}

onMounted(refresh);
</script>

<template>
  <section class="grid gap-6">
    <div>
      <UButton color="neutral" variant="ghost" icon="i-lucide-arrow-left" @click="router.push('/catalog')">
        Back to catalog
      </UButton>
    </div>

    <div v-if="isLoading" class="py-16 text-center text-sm text-stone-500">Loading plant…</div>

    <p
      v-else-if="error"
      class="rounded-xl border border-rose-500/30 bg-rose-50 px-4 py-3 text-sm text-rose-900 dark:bg-rose-950/40 dark:text-rose-100"
    >
      {{ error }}
    </p>

    <template v-else-if="plant">
      <div class="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
        <div
          class="overflow-hidden rounded-3xl border border-emerald-900/10 bg-gradient-to-br from-emerald-100 via-lime-50 to-stone-100 p-8 dark:border-emerald-100/10 dark:from-emerald-950 dark:via-stone-900 dark:to-stone-800"
        >
          <img
            v-if="plant.image_url"
            :src="plant.image_url"
            :alt="plant.common_name"
            class="mx-auto max-h-80 rounded-2xl object-cover"
          />
          <div v-else class="flex min-h-64 items-end justify-between">
            <span class="font-brand text-7xl text-emerald-800/25 dark:text-emerald-200/20">{{ plant.common_name.slice(0, 1) }}</span>
            <svg class="h-28 w-28 text-emerald-700/45 dark:text-emerald-300/30" viewBox="0 0 64 64" fill="none" aria-hidden="true">
              <path d="M32 54c0-18 10-30 22-34-3 15-11 26-22 34Z" fill="currentColor" opacity="0.85" />
              <path d="M32 54c0-18-10-30-22-34 3 15 11 26 22 34Z" fill="currentColor" opacity="0.55" />
              <path d="M32 54V28" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
            </svg>
          </div>
        </div>

        <div class="grid gap-4">
          <div>
            <p class="text-sm font-medium uppercase tracking-[0.14em] text-emerald-700/80 dark:text-emerald-300/80">
              Catalog species
            </p>
            <h1 class="font-brand mt-2 text-4xl font-semibold tracking-tight text-emerald-950 dark:text-emerald-50">
              {{ plant.common_name }}
            </h1>
            <p v-if="plant.scientific_name" class="mt-1 text-lg italic text-stone-500 dark:text-stone-400">
              {{ plant.scientific_name }}
            </p>
          </div>

          <p class="text-stone-700 dark:text-stone-300">{{ plant.description }}</p>

          <dl class="grid gap-3 rounded-2xl border border-emerald-900/10 bg-white/70 p-4 text-sm dark:border-emerald-100/10 dark:bg-stone-900/60 sm:grid-cols-2">
            <div>
              <dt class="text-stone-500 dark:text-stone-400">Care level</dt>
              <dd class="mt-0.5 font-medium capitalize">{{ plant.care_level }}</dd>
            </div>
            <div>
              <dt class="text-stone-500 dark:text-stone-400">Light</dt>
              <dd class="mt-0.5 font-medium">{{ plant.light }}</dd>
            </div>
            <div>
              <dt class="text-stone-500 dark:text-stone-400">Water every</dt>
              <dd class="mt-0.5 font-medium">{{ plant.water_frequency_days }} days</dd>
            </div>
            <div>
              <dt class="text-stone-500 dark:text-stone-400">Humidity</dt>
              <dd class="mt-0.5 font-medium capitalize">{{ plant.humidity }}</dd>
            </div>
          </dl>

          <p
            v-if="notice"
            class="rounded-xl border border-emerald-700/20 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-300/20 dark:bg-emerald-950/50 dark:text-emerald-100"
          >
            {{ notice }}
          </p>

          <div class="flex flex-wrap gap-2">
            <UButton color="primary" :disabled="inCare" @click="onAdd">
              {{ inCare ? "Already in your care" : "Add to my plants" }}
            </UButton>
            <UButton color="neutral" variant="outline" @click="router.push('/')">
              View my plants
            </UButton>
          </div>
        </div>
      </div>
    </template>
  </section>
</template>
