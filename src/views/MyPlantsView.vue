<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import CarePlantCard from "../components/CarePlantCard.vue";
import PlantCabinet from "../components/PlantCabinet.vue";
import {
  listCarePlants,
  markCarePlantWatered,
  removeCarePlant,
  toggleCarePlantFavorite,
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
  carePlants.value = await listCarePlants();
  isLoading.value = false;
  clampPage();
}

async function onWatered(id) {
  await markCarePlantWatered(id);
  await refresh();
}

async function onRemove(id) {
  await removeCarePlant(id);
  await refresh();
}

async function onToggleFavorite(id) {
  await toggleCarePlantFavorite(id);
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
  <section class="grid gap-12 text-[var(--paper)]">
    <div class="mx-auto max-w-3xl pt-6 text-center sm:pt-10">
      <p class="anim-rise text-[11px] font-semibold tracking-[0.28em] text-[var(--mint)] uppercase">
        Nature's best
      </p>
      <h1 class="font-brand anim-rise-delay mt-4 text-[clamp(3.5rem,12vw,7.5rem)] leading-[0.9] font-extrabold tracking-tight text-white">
        sproutlet
      </h1>
      <p class="anim-rise-delay-2 mx-auto mt-6 max-w-lg text-base text-white/70 sm:text-lg">
        Quiet care for the plants you live with — track watering, browse a shared species catalog, and grow your collection.
      </p>
    </div>

    <PlantCabinet :care-plants="carePlants" />

    <div v-if="isLoading" class="py-10 text-center text-sm text-white/50">Loading your plants…</div>

    <template v-else>
      <div
        v-if="!sortedPlants.length"
        class="anim-rise-delay-2 grid gap-4 lg:grid-cols-[0.85fr_1.15fr]"
      >
        <article
          class="surface-card flex flex-col justify-between gap-6 border border-white/10 bg-[var(--hero-elevated)] p-6 sm:p-8"
        >
          <div>
            <p class="font-heading text-5xl font-bold text-white">6+</p>
            <p class="mt-2 text-sm text-white/65">Species ready in the shared catalog</p>
          </div>
          <div class="flex items-center gap-2">
            <div class="flex -space-x-2">
              <span
                v-for="tone in ['bg-[var(--mint)]', 'bg-[var(--sage)]', 'bg-[var(--leaf)]']"
                :key="tone"
                class="inline-flex h-9 w-9 rounded-full border-2 border-[var(--hero-elevated)]"
                :class="tone"
              />
            </div>
            <button
              type="button"
              class="ml-auto inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border-0 bg-white/10 text-white transition hover:bg-white/20"
              aria-label="Open catalog"
              @click="router.push('/catalog')"
            >
              <svg class="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M4 12 12 4M6 4h6v6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
          </div>
        </article>

        <button
          type="button"
          class="surface-card group flex cursor-pointer items-center justify-between gap-4 border-0 bg-white px-6 py-6 text-left text-[var(--hero)] transition hover:-translate-y-0.5 sm:px-8"
          @click="router.push('/catalog')"
        >
          <div>
            <p class="font-heading text-xl font-bold sm:text-2xl">Explore the plant catalog</p>
            <p class="mt-1 text-sm text-[var(--moss)]">Add your first plant and start tracking care</p>
          </div>
          <span
            class="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--hero)] text-white transition group-hover:scale-105"
          >
            <svg class="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
        </button>
      </div>

      <div v-else class="grid gap-5">
        <div class="flex flex-wrap items-end justify-between gap-3">
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

        <div class="grid gap-x-4 gap-y-14 pt-6 sm:grid-cols-2 xl:grid-cols-3">
          <CarePlantCard
            v-for="item in pagedPlants"
            :key="item.id"
            class="pt-12"
            :item="item"
            :watering-hint="wateringHint(item)"
            @open="
              (careItem) =>
                careItem.plant_id &&
                router.push({ name: 'plant-detail', params: { id: String(careItem.plant_id) } })
            "
            @favorite="onToggleFavorite"
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
