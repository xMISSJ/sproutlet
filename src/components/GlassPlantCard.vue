<script setup>
import { computed } from "vue";

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    default: "",
  },
  description: {
    type: String,
    default: "",
  },
  imageUrl: {
    type: String,
    default: "",
  },
  meta: {
    type: String,
    default: "",
  },
  featured: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["open"]);

const initial = computed(() => props.title.trim().slice(0, 1).toUpperCase() || "P");
</script>

<template>
  <article
    class="group relative isolate flex transform-gpu cursor-pointer flex-row items-stretch overflow-visible rounded-[1.35rem] border border-white/[0.14] bg-[linear-gradient(120deg,rgba(255,255,255,0.1)_0%,rgba(18,46,40,0.55)_42%,rgba(7,24,20,0.72)_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_18px_40px_rgba(0,0,0,0.28)] backdrop-blur-[18px] transition-[transform,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:border-white/[0.22] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_24px_50px_rgba(0,0,0,0.35)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[rgba(117,210,188,0.7)]"
    :class="featured ? 'h-[13rem]' : 'h-[11.75rem]'"
    role="link"
    tabindex="0"
    :aria-label="`Open ${title}`"
    @click="$emit('open')"
    @keydown.enter.prevent="$emit('open')"
    @keydown.space.prevent="$emit('open')"
  >
    <div
      class="pointer-events-none relative z-[3] flex-none overflow-visible"
      :class="featured ? 'w-[14rem]' : 'w-[13rem]'"
    >
      <div class="absolute inset-x-3 bottom-[0.65rem] z-[2] flex w-auto items-end justify-center p-0">
        <img
          v-if="imageUrl"
          :src="imageUrl"
          :alt="title"
          class="pointer-events-none block h-auto max-w-full origin-bottom object-contain object-bottom drop-shadow-[0_22px_28px_rgba(0,0,0,0.5)] transform-gpu transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
          :class="featured ? 'w-[13rem]' : 'w-[12rem]'"
          draggable="false"
        />
        <span
          v-else
          class="grid h-[4.5rem] w-[4.5rem] place-items-center rounded-full bg-mint/12 font-heading text-[2rem] font-extrabold text-paper/35"
          aria-hidden="true"
        >
          {{ initial }}
        </span>
      </div>
    </div>

    <div
      class="relative z-[1] flex min-w-0 flex-1 flex-col justify-between overflow-hidden py-[0.9rem] pr-4 pl-[0.15rem]"
    >
      <div class="min-w-0">
        <h3 class="font-heading text-base font-bold leading-tight text-white sm:text-lg">{{ title }}</h3>
        <p v-if="subtitle" class="text-xs font-semibold leading-tight text-mint/90 sm:text-sm">{{ subtitle }}</p>
        <p v-if="description" class="mt-2.5 line-clamp-2 text-sm leading-snug text-white/55">
          {{ description }}
        </p>
      </div>

      <div class="mt-3 flex items-end justify-between gap-2">
        <div class="min-w-0">
          <slot name="meta">
            <p v-if="meta" class="text-sm font-semibold text-white">{{ meta }}</p>
          </slot>
        </div>
        <div class="flex shrink-0 items-center gap-2">
          <slot name="actions" />
          <span
            class="inline-flex h-9 w-9 items-center justify-center text-white/70 transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:text-white"
            aria-hidden="true"
          >
            <svg class="h-4 w-4" viewBox="0 0 16 16" fill="none">
              <path
                d="M4 12 12 4M6.5 4H12v5.5"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </span>
        </div>
      </div>
    </div>
  </article>
</template>
