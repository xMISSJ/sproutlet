<script setup>
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
  compact: {
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
</script>

<template>
  <article
    class="group relative overflow-hidden border border-[var(--forest)]/8 bg-white shadow-[0_12px_40px_rgba(1,5,5,0.06)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(1,5,5,0.1)]"
    :class="compact ? 'min-h-48 rounded-[2rem]' : featured ? 'min-h-80 rounded-[2.5rem] sm:min-h-[28rem]' : 'rounded-[2rem]'"
  >
    <button
      type="button"
      class="relative block w-full cursor-pointer overflow-hidden border-0 p-0 text-left"
      :class="compact ? 'h-48' : featured ? 'h-80 sm:h-[28rem]' : 'aspect-[4/3]'"
      @click="$emit('open', plant)"
    >
      <img
        v-if="plant.image_url"
        :src="plant.image_url"
        :alt="plant.common_name"
        class="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
      />
      <div
        v-else
        class="flex h-full w-full items-end justify-between bg-gradient-to-br from-[var(--sage)] via-[var(--mint)]/40 to-[var(--paper)] p-5"
        aria-hidden="true"
      >
        <span class="font-brand text-5xl text-[var(--hero)]/25">{{ plant.common_name.slice(0, 1) }}</span>
      </div>

      <div class="absolute inset-0 bg-gradient-to-t from-[var(--hero)]/80 via-[var(--hero)]/15 to-transparent" />

      <div class="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5">
        <div class="min-w-0 text-white">
          <p class="font-brand text-xl font-bold leading-tight sm:text-2xl">{{ plant.common_name }}</p>
          <p class="mt-1 text-sm text-white/75">
            {{ careBadge[plant.care_level] ?? plant.care_level }} · every {{ plant.water_frequency_days }}d
          </p>
        </div>
        <span
          class="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-[var(--hero)] transition group-hover:scale-105"
        >
          <svg class="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </span>
      </div>
    </button>

    <div v-if="!compact" class="flex items-center gap-2 border-t border-[var(--forest)]/6 px-4 py-3">
      <button
        type="button"
        class="flex-1 cursor-pointer rounded-full border-0 px-3 py-2 text-sm font-semibold transition disabled:cursor-default disabled:opacity-60"
        :class="inCare ? 'bg-[var(--sage)]/30 text-[var(--forest)]' : 'bg-[var(--hero)] text-white hover:brightness-110'"
        :disabled="inCare"
        @click="$emit('add', plant)"
      >
        {{ inCare ? "In your care" : "Add to my plants" }}
      </button>
      <button
        type="button"
        class="cursor-pointer rounded-full border border-[var(--forest)]/15 bg-transparent px-3 py-2 text-sm font-semibold text-[var(--forest)] transition hover:bg-[var(--sage)]/20"
        @click="$emit('open', plant)"
      >
        Details
      </button>
    </div>
  </article>
</template>
