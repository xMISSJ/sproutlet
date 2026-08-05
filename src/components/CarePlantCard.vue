<script setup>
import { computed } from "vue";

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
  wateringHint: {
    type: String,
    default: "",
  },
});

defineEmits(["open", "water", "remove"]);

const imageUrl = computed(() => props.item.plant?.image_url || props.item.image_url || "");
const initial = computed(() => props.item.nickname?.trim().slice(0, 1).toUpperCase() || "P");
</script>

<template>
  <article
    class="group relative z-[1] isolate cursor-pointer overflow-visible hover:z-50 focus-visible:rounded-[1.25rem] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[rgba(117,210,188,0.7)]"
    role="link"
    tabindex="0"
    :aria-label="`Open details for ${item.nickname}`"
    @click="$emit('open', item)"
    @keydown.enter.prevent="$emit('open', item)"
    @keydown.space.prevent="$emit('open', item)"
  >
    <div
      class="mt-[3.25rem] aspect-square w-full rounded-[1.25rem] border border-white/[0.14] bg-[linear-gradient(155deg,rgba(255,255,255,0.1)_0%,rgba(18,46,40,0.55)_42%,rgba(7,24,20,0.72)_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_18px_40px_rgba(0,0,0,0.28)] backdrop-blur-[18px] transition-[transform,border-color,box-shadow] duration-[350ms] ease-in-out group-hover:-translate-y-[3px] group-hover:border-white/[0.22] group-hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_24px_50px_rgba(0,0,0,0.35)]"
      aria-hidden="true"
    />

    <div
      class="absolute inset-0 z-[1] flex flex-col transition-transform duration-[350ms] ease-in-out group-hover:-translate-y-[3px]"
    >
      <div
        class="relative z-[2] flex min-h-0 flex-1 items-end justify-center overflow-visible px-[0.65rem] pt-0 pb-[1.15rem]"
      >
        <img
          v-if="imageUrl"
          :src="imageUrl"
          :alt="item.nickname"
          class="pointer-events-none block h-auto w-[82%] max-w-full object-contain object-bottom drop-shadow-[0_18px_24px_rgba(0,0,0,0.45)] transition-transform duration-[350ms] ease-in-out group-hover:scale-[1.03]"
          draggable="false"
        />
        <span
          v-else
          class="mt-[3.25rem] mb-3 grid h-20 w-20 place-items-center rounded-full bg-mint/12 font-heading text-3xl font-extrabold text-paper/35"
          aria-hidden="true"
        >
          {{ initial }}
        </span>
      </div>

      <div
        class="relative z-[3] flex shrink-0 flex-col gap-[0.65rem] rounded-b-[1.25rem] border-t border-white/10 bg-[linear-gradient(180deg,rgba(7,24,20,0.28),rgba(7,24,20,0.5))] px-[0.85rem] pt-3 pb-[0.85rem]"
      >
        <div class="min-w-0">
          <h3 class="font-heading truncate text-base font-bold text-white">{{ item.nickname }}</h3>
          <p class="mt-0.5 truncate text-xs font-semibold text-mint/90">{{ wateringHint }}</p>
        </div>

        <div class="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            class="cursor-pointer rounded-lg border-0 bg-mint px-2.5 py-1.5 text-[11px] font-semibold text-hero transition hover:brightness-110"
            @click.stop="$emit('water', item.id)"
          >
            Watered
          </button>
          <button
            type="button"
            class="cursor-pointer rounded-lg border border-white/20 bg-transparent px-2.5 py-1.5 text-[11px] font-semibold text-white/75 transition hover:bg-white/10 hover:text-white"
            @click.stop="$emit('remove', item.id)"
          >
            Remove
          </button>
          <span
            class="ml-auto inline-flex h-8 w-8 items-center justify-center text-white/70 transition group-hover:text-white"
            aria-hidden="true"
          >
            <svg class="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none">
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
