<script setup>
import GlassPlantCard from "./GlassPlantCard.vue";

defineProps({
  plant: {
    type: Object,
    required: true,
  },
  inCare: {
    type: Boolean,
    default: false,
  },
  featured: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["add", "open"]);

const careBadge = {
  easy: "Easy",
  moderate: "Moderate",
  fussy: "Fussy",
};

function metaFor(plant) {
  const care = careBadge[plant.care_level] ?? plant.care_level;
  return `${care} · every ${plant.water_frequency_days}d`;
}
</script>

<template>
  <GlassPlantCard
    :title="plant.common_name"
    :subtitle="plant.english_name"
    :description="plant.description"
    :image-url="plant.image_url"
    :meta="metaFor(plant)"
    :featured="featured"
    @open="$emit('open', plant)"
  >
    <template #actions>
      <button
        type="button"
        class="hidden cursor-pointer rounded-full border border-white/25 px-3 py-1.5 text-xs font-semibold text-white/85 transition hover:bg-white/10 sm:inline-flex"
        :class="inCare ? 'opacity-60' : ''"
        :disabled="inCare"
        @click.stop="$emit('add', plant)"
      >
        {{ inCare ? "In care" : "Add" }}
      </button>
    </template>
  </GlassPlantCard>
</template>
