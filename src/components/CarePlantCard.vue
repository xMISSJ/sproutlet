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
  <article class="care-plant-card group">
    <!-- Sizing shell: square glass with room above for protruding foliage -->
    <div class="care-plant-card__glass" aria-hidden="true" />

    <div class="care-plant-card__content">
      <button
        type="button"
        class="care-plant-card__media"
        :aria-label="`Open details for ${item.nickname}`"
        @click="$emit('open', item)"
      >
        <img
          v-if="imageUrl"
          :src="imageUrl"
          :alt="item.nickname"
          class="care-plant-card__image"
          draggable="false"
        />
        <span v-else class="care-plant-card__fallback" aria-hidden="true">{{ initial }}</span>
      </button>

      <div class="care-plant-card__body">
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
          <button
            type="button"
            class="ml-auto inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-white/25 bg-transparent text-white transition hover:bg-white/10"
            :aria-label="`Open details for ${item.nickname}`"
            @click.stop="$emit('open', item)"
          >
            <svg class="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M4 12 12 4M6.5 4H12v5.5"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </article>
</template>

<style scoped>
.care-plant-card {
  --card-radius: 1.25rem;
  --protrude: 2.75rem;
  position: relative;
  isolation: isolate;
  overflow: visible;
}

/* Invisible size driver: margin creates the protrusion band, aspect keeps glass square */
.care-plant-card__glass {
  aspect-ratio: 1;
  width: 100%;
  margin-top: var(--protrude);
  border-radius: var(--card-radius);
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: linear-gradient(
    155deg,
    rgba(255, 255, 255, 0.1) 0%,
    rgba(18, 46, 40, 0.55) 42%,
    rgba(7, 24, 20, 0.72) 100%
  );
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.12),
    0 18px 40px rgba(0, 0, 0, 0.28);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  transition:
    transform 0.35s ease,
    border-color 0.35s ease,
    box-shadow 0.35s ease;
}

.care-plant-card:hover .care-plant-card__glass {
  transform: translateY(-3px);
  border-color: rgba(255, 255, 255, 0.22);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.16),
    0 24px 50px rgba(0, 0, 0, 0.35);
}

.care-plant-card__content {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: flex;
  flex-direction: column;
  transition: transform 0.35s ease;
}

.care-plant-card:hover .care-plant-card__content {
  transform: translateY(-3px);
}

.care-plant-card__media {
  position: relative;
  z-index: 2;
  display: flex;
  min-height: 0;
  flex: 1;
  cursor: pointer;
  align-items: flex-end;
  justify-content: center;
  overflow: visible;
  border: 0;
  background: transparent;
  padding: 0 0.65rem 1.15rem;
  text-align: left;
}

.care-plant-card__image {
  display: block;
  width: 88%;
  max-height: calc(100% - 0.25rem);
  height: auto;
  object-fit: contain;
  object-position: bottom center;
  filter: drop-shadow(0 18px 24px rgba(0, 0, 0, 0.45));
  pointer-events: none;
  transition: transform 0.35s ease;
}

.care-plant-card:hover .care-plant-card__image {
  transform: scale(1.03);
}

.care-plant-card__fallback {
  display: grid;
  place-items: center;
  margin-top: var(--protrude);
  margin-bottom: 0.75rem;
  height: 5rem;
  width: 5rem;
  border-radius: 999px;
  background: rgba(117, 210, 188, 0.12);
  color: rgba(246, 247, 243, 0.35);
  font-family: "Quicksand", sans-serif;
  font-size: 1.875rem;
  font-weight: 800;
}

.care-plant-card__body {
  position: relative;
  z-index: 3;
  display: flex;
  flex-shrink: 0;
  flex-direction: column;
  gap: 0.65rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: linear-gradient(180deg, rgba(7, 24, 20, 0.28), rgba(7, 24, 20, 0.5));
  padding: 0.75rem 0.85rem 0.85rem;
  border-radius: 0 0 var(--card-radius) var(--card-radius);
}
</style>
