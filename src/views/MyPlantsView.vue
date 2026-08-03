<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import {
  listCarePlants,
  markCarePlantWatered,
  removeCarePlant,
} from "../data/carePlantsDb";

const router = useRouter();
const carePlants = ref([]);
const isLoading = ref(true);

const sortedPlants = computed(() =>
  [...carePlants.value].sort((a, b) => String(a.nickname).localeCompare(String(b.nickname))),
);

function daysSinceWatered(plant) {
  if (!plant.last_watered_at) return null;
  const ms = Date.now() - new Date(plant.last_watered_at).getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

function wateringHint(plant) {
  const days = daysSinceWatered(plant);
  const every = plant.plant?.water_frequency_days ?? 7;
  if (days === null) return "Not watered yet";
  if (days >= every) return `Due · last watered ${days}d ago`;
  return `Watered ${days}d ago · every ${every}d`;
}

async function refresh() {
  isLoading.value = true;
  carePlants.value = await listCarePlants();
  isLoading.value = false;
}

async function onWatered(id) {
  await markCarePlantWatered(id);
  await refresh();
}

async function onRemove(id) {
  await removeCarePlant(id);
  await refresh();
}

onMounted(refresh);
</script>

<template>
  <section class="grid gap-6">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div class="max-w-2xl">
        <h1 class="font-brand text-4xl font-semibold tracking-tight text-emerald-950 dark:text-emerald-50">
          My plants
        </h1>
        <p class="mt-2 text-stone-600 dark:text-stone-300">
          The ones currently in your care. Add more from the shared catalog whenever you bring a new plant home.
        </p>
      </div>
      <UButton color="primary" @click="router.push('/catalog')">Browse catalog</UButton>
    </div>

    <div v-if="isLoading" class="py-16 text-center text-sm text-stone-500">Loading your plants…</div>

    <div
      v-else-if="!sortedPlants.length"
      class="rounded-3xl border border-dashed border-emerald-800/20 bg-white/60 px-6 py-16 text-center dark:border-emerald-100/15 dark:bg-stone-900/40"
    >
      <p class="font-brand text-2xl text-emerald-900 dark:text-emerald-100">No plants in your care yet</p>
      <p class="mx-auto mt-2 max-w-md text-sm text-stone-600 dark:text-stone-300">
        Start with the catalog — pick a species, then it shows up here so you can track watering and notes.
      </p>
      <UButton class="mt-6" color="primary" @click="router.push('/catalog')">Open catalog</UButton>
    </div>

    <div v-else class="grid gap-4">
      <article
        v-for="item in sortedPlants"
        :key="item.id"
        class="grid gap-4 rounded-2xl border border-emerald-900/10 bg-white/80 p-4 shadow-sm sm:grid-cols-[1fr_auto] sm:items-center dark:border-emerald-100/10 dark:bg-stone-900/70"
      >
        <div>
          <div class="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h2 class="font-brand text-2xl font-semibold text-emerald-950 dark:text-emerald-50">
              {{ item.nickname }}
            </h2>
            <button
              v-if="item.plant"
              type="button"
              class="cursor-pointer border-0 bg-transparent p-0 text-sm italic text-stone-500 underline-offset-2 hover:underline dark:text-stone-400"
              @click="router.push({ name: 'plant-detail', params: { id: String(item.plant_id) } })"
            >
              {{ item.plant.scientific_name || item.plant.common_name }}
            </button>
          </div>
          <p class="mt-2 text-sm text-stone-600 dark:text-stone-300">
            {{ wateringHint(item) }}
            <span v-if="item.location"> · {{ item.location }}</span>
          </p>
          <p v-if="item.notes" class="mt-1 text-sm text-stone-500 dark:text-stone-400">{{ item.notes }}</p>
        </div>

        <div class="flex flex-wrap gap-2">
          <UButton color="primary" variant="soft" size="sm" @click="onWatered(item.id)">
            Mark watered
          </UButton>
          <UButton color="neutral" variant="outline" size="sm" @click="onRemove(item.id)">
            Remove
          </UButton>
        </div>
      </article>
    </div>
  </section>
</template>
