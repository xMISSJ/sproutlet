<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import CareEmptyState from "../components/CareEmptyState.vue";
import CarePlantCard from "../components/CarePlantCard.vue";
import PlantCabinet from "../components/PlantCabinet.vue";
import {
  listCarePlants,
  markCarePlantWatered,
  removeCarePlant,
} from "../data/carePlantsDb";

const PAGE_SIZE = 6;

const route = useRoute();
const router = useRouter();
const carePlants = ref([]);
const isLoading = ref(true);
const page = ref(1);

const sortedPlants = computed(() =>
  [...carePlants.value].sort((a, b) => String(a.nickname).localeCompare(String(b.nickname))),
);

const totalPages = computed(() => Math.max(1, Math.ceil(sortedPlants.value.length / PAGE_SIZE)));

const pagedPlants = computed(() => {
  const start = (page.value - 1) * PAGE_SIZE;
  return sortedPlants.value.slice(start, start + PAGE_SIZE);
});

const pageLabel = computed(() => {
  if (!sortedPlants.value.length) return "";
  const start = (page.value - 1) * PAGE_SIZE + 1;
  const end = Math.min(page.value * PAGE_SIZE, sortedPlants.value.length);
  return `${start}–${end} of ${sortedPlants.value.length}`;
});

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

function clampPage() {
  page.value = Math.min(Math.max(1, page.value), totalPages.value);
}

async function refresh() {
  isLoading.value = true;
  try {
    carePlants.value = await listCarePlants();
  } catch {
    carePlants.value = [];
  } finally {
    isLoading.value = false;
    clampPage();
  }
}

async function onWatered(id) {
  await markCarePlantWatered(id);
  await refresh();
}

async function onRemove(id) {
  await removeCarePlant(id);
  await refresh();
}

function goToPage(next) {
  page.value = Math.min(Math.max(1, next), totalPages.value);
}

onMounted(refresh);

watch(
  () => route.name,
  (name) => {
    if (name === "my-plants") refresh();
  },
);

watch(sortedPlants, clampPage);
</script>

<template>
  <section class="grid gap-12 text-paper">
    <div class="mx-auto max-w-3xl pt-6 text-center sm:pt-10">
      <p class="anim-rise text-[11px] font-semibold tracking-[0.28em] text-mint uppercase">
        Nature's best
      </p>
      <h1 class="font-brand anim-rise-delay mt-4 text-[clamp(3.5rem,12vw,7.5rem)] leading-[0.9] font-extrabold tracking-tight text-white">
        Sproutlet
      </h1>
      <p class="anim-rise-delay-2 mx-auto mt-6 max-w-lg text-base text-white/70 sm:text-lg">
        Quiet care for the plants you live with — track watering, browse a shared species catalog, and grow your collection.
      </p>
    </div>

    <PlantCabinet :care-plants="carePlants" />

    <div v-if="isLoading" class="py-10 text-center text-sm text-white/50">Loading your plants…</div>

    <template v-else>
      <CareEmptyState
        v-if="!sortedPlants.length"
        @browse="router.push('/catalog')"
      />

      <div v-else class="grid gap-5">
        <div class="relative z-10 flex flex-wrap items-end justify-between gap-3 scroll-mt-28">
          <div>
            <h2 class="font-heading text-2xl font-bold text-white">In your care</h2>
            <p class="mt-1 text-sm text-white/60">
              {{ sortedPlants.length }} plant{{ sortedPlants.length === 1 ? "" : "s" }}
              <span v-if="totalPages > 1"> · {{ pageLabel }}</span>
            </p>
          </div>
          <button
            type="button"
            class="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
            @click="router.push('/catalog')"
          >
            Browse catalog
          </button>
        </div>

        <div class="grid grid-cols-2 items-end gap-x-4 gap-y-16 pt-24 sm:grid-cols-3 sm:gap-x-5 sm:gap-y-14 sm:pt-28 lg:grid-cols-4">
          <CarePlantCard
            v-for="(item, index) in pagedPlants"
            :key="item.id"
            :item="item"
            :watering-hint="wateringHint(item)"
            @open="
              (careItem) =>
                careItem.plant_id &&
                router.push({ name: 'plant-detail', params: { id: String(careItem.plant_id) } })
            "
            @water="onWatered"
            @remove="onRemove"
          />
        </div>

        <div
          v-if="totalPages > 1"
          class="flex flex-wrap items-center justify-between gap-3 pt-1"
        >
          <p class="text-sm text-white/45">Page {{ page }} of {{ totalPages }}</p>
          <div class="flex items-center gap-2">
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
      </div>
    </template>
  </section>
</template>
