<script setup>
import { seedPlants } from "../data/seedPlants";

defineEmits(["browse"]);

const previewPlants = seedPlants.slice(0, 3);
</script>

<template>
  <div class="anim-rise-delay-2 grid gap-5">
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 class="font-heading text-2xl font-bold text-white">In your care</h2>
        <p class="mt-1 text-sm text-white/60">No plants yet</p>
      </div>
      <button
        type="button"
        class="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
        @click="$emit('browse')"
      >
        Browse catalog
      </button>
    </div>

    <button
      type="button"
      class="group relative isolate w-full cursor-pointer overflow-visible pt-16 text-left transition-transform duration-[350ms] ease-in-out hover:-translate-y-[3px] sm:pt-20"
      @click="$emit('browse')"
    >
      <div
        class="absolute inset-x-0 top-0 z-[2] flex items-end justify-center"
        aria-hidden="true"
      >
        <img
          v-for="(plant, index) in previewPlants"
          :key="plant.id"
          :src="plant.image_url"
          :alt="plant.common_name"
          class="pointer-events-none w-auto object-contain object-bottom drop-shadow-[0_12px_16px_rgba(0,0,0,0.4)]"
          :class="[
            index === 1
              ? 'relative z-[1] h-[8.25rem] sm:h-[10rem]'
              : 'h-[7rem] sm:h-[8.5rem]',
            index === 0 ? '-mr-5 sm:-mr-7' : '',
            index === 2 ? '-ml-5 sm:-ml-7' : '',
          ]"
          draggable="false"
        />
      </div>

      <div
        class="relative z-[1] rounded-[1.35rem] border border-white/[0.14] bg-[linear-gradient(155deg,rgba(255,255,255,0.1)_0%,rgba(18,46,40,0.55)_42%,rgba(7,24,20,0.72)_100%)] px-6 pt-16 pb-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_18px_40px_rgba(0,0,0,0.28)] backdrop-blur-[18px] transition-[border-color,box-shadow] duration-[350ms] ease-in-out group-hover:border-white/[0.22] group-hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_24px_50px_rgba(0,0,0,0.35)] sm:px-8 sm:pt-20 sm:pb-7"
      >
        <div class="mx-auto max-w-lg text-center">
          <h3 class="font-heading text-xl font-bold text-white sm:text-2xl">Your shelf is waiting</h3>
          <p class="mt-2 text-sm leading-relaxed text-white/60">
            Pick a species from the catalog, add it to your care, and keep track of watering from here.
          </p>
          <p
            class="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-mint transition group-hover:text-mint/90"
          >
            Explore catalog
            <svg class="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M3 8h10M9 4l4 4-4 4"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </p>
        </div>
      </div>
    </button>
  </div>
</template>
