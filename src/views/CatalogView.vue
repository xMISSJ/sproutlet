<script setup>
import { onMounted, reactive, ref, watch } from "vue";
import { useRouter } from "vue-router";
import PlantCard from "../components/PlantCard.vue";
import { createCustomPlant } from "../data/customPlantsDb";
import { fileToPlantCutoutDataUrl } from "../data/imageHelpers";
import { DEFAULT_PLANT_FORM, PLANT_FORMS } from "../data/plantForms";
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
const showForm = ref(false);
const isSaving = ref(false);
const formError = ref("");
const imagePreview = ref("");
const isProcessingImage = ref(false);

const form = reactive({
  common_name: "",
  scientific_name: "",
  description: "",
  care_level: "easy",
  light: "bright-indirect",
  water_frequency_days: 7,
  humidity: "average",
  model_style: DEFAULT_PLANT_FORM,
  image_url: "",
});

const filters = [
  { id: "all", label: "All plants" },
  { id: "easy", label: "Easy care" },
  { id: "moderate", label: "Moderate" },
  { id: "fussy", label: "Fussy" },
];

let searchTimer = null;

function resetForm() {
  form.common_name = "";
  form.scientific_name = "";
  form.description = "";
  form.care_level = "easy";
  form.light = "bright-indirect";
  form.water_frequency_days = 7;
  form.humidity = "average";
  form.model_style = DEFAULT_PLANT_FORM;
  form.image_url = "";
  imagePreview.value = "";
  formError.value = "";
}

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

async function onImageFileChange(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  formError.value = "";
  isProcessingImage.value = true;
  try {
    const dataUrl = await fileToPlantCutoutDataUrl(file);
    form.image_url = dataUrl;
    imagePreview.value = dataUrl;
  } catch (err) {
    formError.value = err?.message || "Could not use that image.";
  } finally {
    isProcessingImage.value = false;
  }
}

async function onCreatePlant() {
  formError.value = "";
  isSaving.value = true;
  try {
    const plant = await createCustomPlant({ ...form });
    notice.value = `${plant.common_name} was added to your catalog.`;
    showForm.value = false;
    resetForm();
    page.value = 1;
    await loadCatalog();
  } catch (err) {
    formError.value = err?.message || "Could not save that plant.";
  } finally {
    isSaving.value = false;
  }
}

async function onAdd(plant) {
  notice.value = "";
  await addPlantToCare({ plant });
  await refreshCare();
  notice.value = `${plant.common_name} is now in your care.`;
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
  <section class="grid gap-10 text-[var(--paper)]">
    <div class="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
      <div class="anim-rise max-w-2xl">
        <h1 class="font-heading text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
          Plant catalog
        </h1>
        <p class="mt-3 max-w-xl text-base text-white/65 sm:text-lg">
          Add your own plants with photos, names, and care notes — then move the ones you own into My plants.
        </p>

        <div class="mt-6 flex flex-wrap gap-2">
          <button
            v-for="filter in filters"
            :key="filter.id"
            type="button"
            class="cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition"
            :class="
              careFilter === filter.id
                ? 'border-0 bg-white text-[var(--hero)]'
                : 'border border-white/15 bg-white/5 text-white/75 hover:bg-white/10 hover:text-white'
            "
            @click="careFilter = filter.id"
          >
            {{ filter.label }}
          </button>
        </div>
      </div>

      <button
        type="button"
        class="inline-flex cursor-pointer items-center justify-center rounded-full border-0 bg-[var(--mint)] px-5 py-2.5 text-sm font-semibold text-[var(--hero)] transition hover:brightness-110"
        @click="showForm ? (showForm = false, resetForm()) : (showForm = true)"
      >
        {{ showForm ? "Close form" : "Add your plant" }}
      </button>
    </div>

    <form
      v-if="showForm"
      class="surface-card grid gap-4 border border-white/10 bg-[var(--hero-elevated)] p-5 text-white sm:p-6"
      @submit.prevent="onCreatePlant"
    >
      <div>
        <h2 class="font-heading text-2xl font-bold text-white">New catalog plant</h2>
        <p class="mt-1 text-sm text-white/55">Use your own photo and wording — nothing is pulled from an API.</p>
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <label class="grid gap-1.5 text-sm">
          <span class="font-semibold text-white/80">Name</span>
          <input
            v-model="form.common_name"
            required
            class="rounded-2xl border border-white/15 bg-black/20 px-4 py-2.5 text-white outline-none placeholder:text-white/35 focus:border-[var(--mint)]"
            placeholder="Monstera by the window"
          />
        </label>
        <label class="grid gap-1.5 text-sm">
          <span class="font-semibold text-white/80">Scientific name</span>
          <input
            v-model="form.scientific_name"
            class="rounded-2xl border border-white/15 bg-black/20 px-4 py-2.5 text-white outline-none placeholder:text-white/35 focus:border-[var(--mint)]"
            placeholder="Optional"
          />
        </label>
      </div>

      <label class="grid gap-1.5 text-sm">
        <span class="font-semibold text-white/80">Description</span>
        <textarea
          v-model="form.description"
          rows="3"
          class="rounded-2xl border border-white/15 bg-black/20 px-4 py-2.5 text-white outline-none placeholder:text-white/35 focus:border-[var(--mint)]"
          placeholder="How it looks, where it lives, anything useful…"
        />
      </label>

      <div class="grid gap-4 sm:grid-cols-3">
        <label class="grid gap-1.5 text-sm">
          <span class="font-semibold text-white/80">Care level</span>
          <select
            v-model="form.care_level"
            class="rounded-2xl border border-white/15 bg-black/20 px-4 py-2.5 text-white outline-none placeholder:text-white/35 focus:border-[var(--mint)]"
          >
            <option value="easy">Easy</option>
            <option value="moderate">Moderate</option>
            <option value="fussy">Fussy</option>
          </select>
        </label>
        <label class="grid gap-1.5 text-sm">
          <span class="font-semibold text-white/80">Light</span>
          <input
            v-model="form.light"
            class="rounded-2xl border border-white/15 bg-black/20 px-4 py-2.5 text-white outline-none placeholder:text-white/35 focus:border-[var(--mint)]"
          />
        </label>
        <label class="grid gap-1.5 text-sm">
          <span class="font-semibold text-white/80">Water every (days)</span>
          <input
            v-model.number="form.water_frequency_days"
            type="number"
            min="1"
            class="rounded-2xl border border-white/15 bg-black/20 px-4 py-2.5 text-white outline-none placeholder:text-white/35 focus:border-[var(--mint)]"
          />
        </label>
      </div>

      <label class="grid gap-1.5 text-sm">
        <span class="font-semibold text-white/80">Cabinet look</span>
        <select
          v-model="form.model_style"
          class="rounded-2xl border border-white/15 bg-black/20 px-4 py-2.5 text-white outline-none placeholder:text-white/35 focus:border-[var(--mint)]"
        >
          <option v-for="formOption in PLANT_FORMS" :key="formOption.id" :value="formOption.id">
            {{ formOption.label }} — {{ formOption.hint }}
          </option>
        </select>
        <span class="text-white/45">Pick the silhouette that most looks like this plant in the 3D cabinet.</span>
      </label>

      <div class="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
        <label class="grid gap-1.5 text-sm">
          <span class="font-semibold text-white/80">Photo</span>
          <input
            type="file"
            accept="image/*"
            class="rounded-2xl border border-white/15 bg-black/20 px-4 py-2.5 text-white/70 file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-[var(--mint)] file:px-3 file:py-1 file:text-sm file:font-semibold file:text-[var(--hero)]"
            @change="onImageFileChange"
          />
          <span class="text-white/45">Background is removed automatically so the plant sits on the glass card.</span>
          <span v-if="isProcessingImage" class="text-[var(--mint)]">Removing background… this can take a few seconds.</span>
        </label>
        <div
          v-if="imagePreview"
          class="h-20 w-20 overflow-hidden rounded-2xl border border-white/10 bg-black/20"
        >
          <img :src="imagePreview" alt="" class="h-full w-full object-cover" />
        </div>
      </div>

      <p v-if="formError" class="text-sm text-rose-300">{{ formError }}</p>

      <div class="flex flex-wrap gap-2">
        <button
          type="submit"
          class="cursor-pointer rounded-full border-0 bg-[var(--mint)] px-5 py-2.5 text-sm font-semibold text-[var(--hero)] transition hover:brightness-110 disabled:opacity-60"
          :disabled="isSaving"
        >
          {{ isSaving ? "Saving…" : "Save plant" }}
        </button>
        <button
          type="button"
          class="cursor-pointer rounded-full border border-white/20 bg-transparent px-5 py-2.5 text-sm font-semibold text-white/80 transition hover:bg-white/10"
          @click="showForm = false; resetForm()"
        >
          Cancel
        </button>
      </div>
    </form>

    <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
      <UInput
        v-model="query"
        icon="i-lucide-search"
        placeholder="Search your catalog..."
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
      class="rounded-2xl border border-[var(--mint)]/30 bg-[var(--mint)]/15 px-4 py-3 text-sm text-[var(--mint)]"
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
        No plants matched that search. Add your own with the button above.
      </div>

      <div v-else class="anim-rise-delay-2 grid gap-x-4 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
        <PlantCard
          v-for="(plant, index) in plants"
          :key="plant.id"
          :plant="plant"
          :in-care="isPlantInCare(plant.id, carePlants)"
          :featured="index === 0 && plants.length === 1"
          class="pt-8"
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
