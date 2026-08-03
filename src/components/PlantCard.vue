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
    class="group flex flex-col overflow-hidden rounded-2xl border border-emerald-900/10 bg-white/80 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md dark:border-emerald-100/10 dark:bg-stone-900/70"
  >
    <button
      type="button"
      class="relative block aspect-[4/3] w-full cursor-pointer overflow-hidden border-0 bg-gradient-to-br from-emerald-100 via-lime-50 to-stone-100 p-0 dark:from-emerald-950 dark:via-stone-900 dark:to-stone-800"
      @click="$emit('open', plant)"
    >
      <img
        v-if="plant.image_url"
        :src="plant.image_url"
        :alt="plant.common_name"
        class="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
      />
      <div
        v-else
        class="flex h-full w-full items-end justify-between p-4"
        aria-hidden="true"
      >
        <span class="font-brand text-5xl text-emerald-700/30 dark:text-emerald-300/25">{{ plant.common_name.slice(0, 1) }}</span>
        <svg class="h-16 w-16 text-emerald-700/40 dark:text-emerald-300/30" viewBox="0 0 64 64" fill="none">
          <path d="M32 54c0-18 10-30 22-34-3 15-11 26-22 34Z" fill="currentColor" opacity="0.85" />
          <path d="M32 54c0-18-10-30-22-34 3 15 11 26 22 34Z" fill="currentColor" opacity="0.55" />
          <path d="M32 54V28" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
        </svg>
      </div>
    </button>

    <div class="flex flex-1 flex-col gap-3 p-4">
      <div>
        <div class="flex items-start justify-between gap-2">
          <h3 class="font-brand text-xl font-semibold leading-tight text-emerald-950 dark:text-emerald-50">
            {{ plant.common_name }}
          </h3>
          <span
            class="shrink-0 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
          >
            {{ careBadge[plant.care_level] ?? plant.care_level }}
          </span>
        </div>
        <p v-if="plant.scientific_name" class="mt-1 text-sm italic text-stone-500 dark:text-stone-400">
          {{ plant.scientific_name }}
        </p>
      </div>

      <p class="line-clamp-2 flex-1 text-sm text-stone-600 dark:text-stone-300">
        {{ plant.description }}
      </p>

      <div class="flex items-center gap-2">
        <UButton
          color="primary"
          variant="solid"
          size="sm"
          class="flex-1 justify-center"
          :disabled="inCare"
          @click="$emit('add', plant)"
        >
          {{ inCare ? "In your care" : "Add to my plants" }}
        </UButton>
        <UButton color="neutral" variant="outline" size="sm" @click="$emit('open', plant)">
          Details
        </UButton>
      </div>
    </div>
  </article>
</template>
