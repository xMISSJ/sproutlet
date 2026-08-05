<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { deleteCustomPlant, isCustomPlantId, updateCustomPlant } from "../data/customPlantsDb";
import { fileToPlantCutoutDataUrl } from "../data/imageHelpers";
import { DEFAULT_PLANT_FORM, getPlantFormLabel, PLANT_FORMS } from "../data/plantForms";
import { getCatalogPlant } from "../data/plantsDb";
import { addPlantToCare, isPlantInCare, listCarePlants, syncCareEntriesForPlant } from "../data/carePlantsDb";

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
const isEditing = ref(false);
const isSaving = ref(false);
const formError = ref("");

const form = reactive({
  common_name: "",
  scientific_name: "",
  description: "",
  care_level: "easy",
  light: "",
  water_frequency_days: 7,
  humidity: "",
  model_style: DEFAULT_PLANT_FORM,
  image_url: "",
});

const isCustom = computed(() => (plant.value ? isCustomPlantId(plant.value.id) : false));

function fillForm(detail) {
  form.common_name = detail.common_name ?? "";
  form.scientific_name = detail.scientific_name ?? "";
  form.description = detail.description ?? "";
  form.care_level = detail.care_level ?? "easy";
  form.light = detail.light ?? "";
  form.water_frequency_days = detail.water_frequency_days ?? 7;
  form.humidity = detail.humidity ?? "";
  form.model_style = detail.model_style ?? DEFAULT_PLANT_FORM;
  form.image_url = detail.image_url ?? "";
}

async function refresh() {
  isLoading.value = true;
  error.value = "";
  notice.value = "";
  isEditing.value = false;
  try {
    const [detail, care] = await Promise.all([getCatalogPlant(props.id), listCarePlants()]);
    plant.value = detail;
    carePlants.value = care;
    fillForm(detail);
  } catch (err) {
    plant.value = null;
    error.value = err?.message || "Could not load this plant.";
  } finally {
    isLoading.value = false;
  }
}

async function onAdd() {
  if (!plant.value || isPlantInCare(plant.value.id, carePlants.value)) return;
  await addPlantToCare({ plant: plant.value });
  carePlants.value = await listCarePlants();
  notice.value = `${plant.value.common_name} is now in your care.`;
}

async function onImageFileChange(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  formError.value = "";
  try {
    formError.value = "Removing background…";
    form.image_url = await fileToPlantCutoutDataUrl(file);
    formError.value = "";
  } catch (err) {
    formError.value = err?.message || "Could not use that image.";
  }
}

async function onSave() {
  if (!plant.value || !isCustom.value) return;
  formError.value = "";
  isSaving.value = true;
  try {
    plant.value = await updateCustomPlant(plant.value.id, { ...form });
    await syncCareEntriesForPlant(plant.value);
    carePlants.value = await listCarePlants();
    fillForm(plant.value);
    isEditing.value = false;
    notice.value = "Plant updated.";
  } catch (err) {
    formError.value = err?.message || "Could not save changes.";
  } finally {
    isSaving.value = false;
  }
}

async function onDelete() {
  if (!plant.value || !isCustom.value) return;
  if (!window.confirm(`Remove “${plant.value.common_name}” from your catalog?`)) return;
  await deleteCustomPlant(plant.value.id);
  router.push("/catalog");
}

onMounted(refresh);
watch(() => props.id, refresh);
</script>

<template>
  <section class="grid gap-8 text-paper">
    <div>
      <button
        type="button"
        class="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"
        @click="router.push('/catalog')"
      >
        <svg class="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M13 8H3M7 4 3 8l4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        Back to catalog
      </button>
    </div>

    <div v-if="isLoading" class="py-16 text-center text-sm text-white/50">Loading plant…</div>

    <p
      v-else-if="error"
      class="rounded-2xl border border-rose-400/30 bg-rose-950/40 px-4 py-3 text-sm text-rose-200"
    >
      {{ error }}
    </p>

    <template v-else-if="plant">
      <div class="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
        <div class="surface-card overflow-hidden border border-white/10 bg-hero-elevated shadow-[0_16px_50px_rgba(0,0,0,0.25)]">
          <img
            v-if="isEditing ? form.image_url : plant.image_url"
            :src="isEditing ? form.image_url : plant.image_url"
            :alt="plant.common_name"
            class="mx-auto aspect-[4/3] w-full max-w-lg object-contain object-bottom p-6 sm:p-10"
          />
          <div v-else class="flex min-h-72 items-end justify-between p-8">
            <span class="font-heading text-7xl text-white/20">{{ plant.common_name.slice(0, 1) }}</span>
          </div>
        </div>

        <div class="grid gap-5">
          <template v-if="!isEditing">
            <div class="anim-rise">
              <p class="text-xs font-semibold tracking-[0.2em] text-mint uppercase">
                {{ isCustom ? "Your plant" : "Catalog species" }}
              </p>
              <h1 class="font-heading mt-2 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                {{ plant.common_name }}
              </h1>
              <p v-if="plant.scientific_name" class="mt-2 text-lg text-white/55 italic">
                {{ plant.scientific_name }}
              </p>
            </div>

            <p class="anim-rise-delay leading-relaxed text-white/75">{{ plant.description }}</p>

            <dl class="anim-rise-delay-2 grid gap-3 rounded-[2rem] border border-white/10 bg-hero-elevated p-5 text-sm sm:grid-cols-2">
              <div>
                <dt class="text-white/45">Care level</dt>
                <dd class="mt-0.5 font-semibold capitalize text-white">{{ plant.care_level }}</dd>
              </div>
              <div>
                <dt class="text-white/45">Light</dt>
                <dd class="mt-0.5 font-semibold capitalize text-white">{{ plant.light }}</dd>
              </div>
              <div>
                <dt class="text-white/45">Water every</dt>
                <dd class="mt-0.5 font-semibold text-white">{{ plant.water_frequency_days }} days</dd>
              </div>
              <div>
                <dt class="text-white/45">Humidity</dt>
                <dd class="mt-0.5 font-semibold capitalize text-white">{{ plant.humidity }}</dd>
              </div>
              <div class="sm:col-span-2">
                <dt class="text-white/45">Cabinet look</dt>
                <dd class="mt-0.5 font-semibold text-white">{{ getPlantFormLabel(plant.model_style) }}</dd>
              </div>
            </dl>
          </template>

          <form v-else class="grid gap-4 text-white" @submit.prevent="onSave">
            <label class="grid gap-1.5 text-sm">
              <span class="font-semibold text-white/80">Name</span>
              <input v-model="form.common_name" required class="rounded-2xl border border-white/15 bg-black/20 px-4 py-2.5 text-white" />
            </label>
            <label class="grid gap-1.5 text-sm">
              <span class="font-semibold text-white/80">Scientific name</span>
              <input v-model="form.scientific_name" class="rounded-2xl border border-white/15 bg-black/20 px-4 py-2.5 text-white" />
            </label>
            <label class="grid gap-1.5 text-sm">
              <span class="font-semibold text-white/80">Description</span>
              <textarea v-model="form.description" rows="4" class="rounded-2xl border border-white/15 bg-black/20 px-4 py-2.5 text-white" />
            </label>
            <div class="grid gap-3 sm:grid-cols-2">
              <label class="grid gap-1.5 text-sm">
                <span class="font-semibold text-white/80">Care level</span>
                <select v-model="form.care_level" class="rounded-2xl border border-white/15 bg-black/20 px-4 py-2.5 text-white">
                  <option value="easy">Easy</option>
                  <option value="moderate">Moderate</option>
                  <option value="fussy">Fussy</option>
                </select>
              </label>
              <label class="grid gap-1.5 text-sm">
                <span class="font-semibold text-white/80">Water every (days)</span>
                <input v-model.number="form.water_frequency_days" type="number" min="1" class="rounded-2xl border border-white/15 bg-black/20 px-4 py-2.5 text-white" />
              </label>
              <label class="grid gap-1.5 text-sm">
                <span class="font-semibold text-white/80">Light</span>
                <input v-model="form.light" class="rounded-2xl border border-white/15 bg-black/20 px-4 py-2.5 text-white" />
              </label>
              <label class="grid gap-1.5 text-sm">
                <span class="font-semibold text-white/80">Humidity</span>
                <input v-model="form.humidity" class="rounded-2xl border border-white/15 bg-black/20 px-4 py-2.5 text-white" />
              </label>
            </div>
            <label class="grid gap-1.5 text-sm">
              <span class="font-semibold text-white/80">Cabinet look</span>
              <select v-model="form.model_style" class="rounded-2xl border border-white/15 bg-black/20 px-4 py-2.5 text-white">
                <option v-for="formOption in PLANT_FORMS" :key="formOption.id" :value="formOption.id">
                  {{ formOption.label }} — {{ formOption.hint }}
                </option>
              </select>
            </label>
            <label class="grid gap-1.5 text-sm">
              <span class="font-semibold text-white/80">Replace photo</span>
              <input type="file" accept="image/*" class="rounded-2xl border border-white/15 bg-black/20 px-4 py-2.5 text-white/70" @change="onImageFileChange" />
            </label>
            <p v-if="formError" class="text-sm text-rose-300">{{ formError }}</p>
          </form>

          <p
            v-if="notice"
            class="rounded-2xl border border-mint/30 bg-mint/15 px-4 py-3 text-sm text-mint"
          >
            {{ notice }}
          </p>

          <div class="flex flex-wrap gap-2">
            <template v-if="isEditing">
              <button
                type="button"
                class="cursor-pointer rounded-full border-0 bg-mint px-5 py-2.5 text-sm font-semibold text-hero transition hover:brightness-110 disabled:opacity-60"
                :disabled="isSaving"
                @click="onSave"
              >
                {{ isSaving ? "Saving…" : "Save changes" }}
              </button>
              <button
                type="button"
                class="cursor-pointer rounded-full border border-white/20 bg-transparent px-5 py-2.5 text-sm font-semibold text-white/80 transition hover:bg-white/10"
                @click="isEditing = false; fillForm(plant); formError = ''"
              >
                Cancel
              </button>
            </template>
            <template v-else>
              <button
                type="button"
                class="cursor-pointer rounded-full border-0 px-5 py-2.5 text-sm font-semibold transition disabled:cursor-default disabled:opacity-60"
                :class="
                  isPlantInCare(plant.id, carePlants)
                    ? 'bg-white/10 text-white/70'
                    : 'bg-mint text-hero hover:brightness-110'
                "
                :disabled="isPlantInCare(plant.id, carePlants)"
                @click="onAdd"
              >
                {{ isPlantInCare(plant.id, carePlants) ? "Already in your care" : "Add to my plants" }}
              </button>
              <button
                v-if="isCustom"
                type="button"
                class="cursor-pointer rounded-full border border-white/20 bg-transparent px-5 py-2.5 text-sm font-semibold text-white/80 transition hover:bg-white/10"
                @click="isEditing = true"
              >
                Edit
              </button>
              <button
                v-if="isCustom"
                type="button"
                class="cursor-pointer rounded-full border border-rose-400/40 bg-transparent px-5 py-2.5 text-sm font-semibold text-rose-300 transition hover:bg-rose-950/40"
                @click="onDelete"
              >
                Delete
              </button>
              <button
                type="button"
                class="cursor-pointer rounded-full border border-white/20 bg-transparent px-5 py-2.5 text-sm font-semibold text-white/80 transition hover:bg-white/10"
                @click="router.push('/')"
              >
                View my plants
              </button>
            </template>
          </div>
        </div>
      </div>
    </template>
  </section>
</template>
