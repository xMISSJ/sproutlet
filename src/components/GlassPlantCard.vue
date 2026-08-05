<script setup>
import { computed } from "vue";

const props = defineProps({
  title: {
    type: String,
    required: true,
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
    class="glass-plant-card group relative flex flex-col"
    :class="featured ? 'is-featured' : ''"
  >
    <div class="glass-plant-card__stage">
      <button
        type="button"
        class="glass-plant-card__media"
        :aria-label="`Open ${title}`"
        @click="$emit('open')"
      >
        <img
          v-if="imageUrl"
          :src="imageUrl"
          :alt="title"
          class="glass-plant-card__image"
          draggable="false"
        />
        <span v-else class="glass-plant-card__fallback" aria-hidden="true">{{ initial }}</span>
      </button>
    </div>

    <div class="glass-plant-card__body">
      <div class="min-w-0 flex-1">
        <h3 class="font-heading text-xl font-bold text-white sm:text-2xl">{{ title }}</h3>
        <p v-if="description" class="mt-2 line-clamp-3 text-sm leading-relaxed text-white/55">
          {{ description }}
        </p>
      </div>

      <div class="mt-5 flex items-end justify-between gap-3">
        <div class="min-w-0">
          <slot name="meta">
            <p v-if="meta" class="text-base font-semibold text-white">{{ meta }}</p>
          </slot>
        </div>
        <div class="flex shrink-0 items-center gap-2">
          <slot name="actions" />
          <button
            type="button"
            class="glass-plant-card__arrow"
            :aria-label="`Open ${title}`"
            @click="$emit('open')"
          >
            <svg class="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
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
.glass-plant-card {
  --card-radius: 2.25rem;
  position: relative;
  isolation: isolate;
  overflow: visible;
  border-radius: var(--card-radius);
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: linear-gradient(
    165deg,
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

.glass-plant-card:hover {
  transform: translateY(-4px);
  border-color: rgba(255, 255, 255, 0.22);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.16),
    0 24px 50px rgba(0, 0, 0, 0.35);
}

.glass-plant-card.is-featured {
  min-height: 100%;
}

.glass-plant-card__stage {
  position: relative;
  z-index: 3;
  margin-top: -4.5rem;
  padding: 0 0.75rem;
  min-height: 13.5rem;
  pointer-events: none;
}

.glass-plant-card.is-featured .glass-plant-card__stage {
  min-height: 18rem;
  margin-top: -5.5rem;
}

.glass-plant-card__media {
  display: flex;
  width: 100%;
  height: 100%;
  min-height: inherit;
  cursor: pointer;
  align-items: flex-end;
  justify-content: center;
  border: 0;
  background: transparent;
  padding: 0;
  pointer-events: auto;
}

.glass-plant-card__image {
  display: block;
  max-height: 15rem;
  width: auto;
  max-width: 92%;
  object-fit: contain;
  object-position: bottom center;
  filter: drop-shadow(0 22px 28px rgba(0, 0, 0, 0.5));
  pointer-events: none;
}

.glass-plant-card.is-featured .glass-plant-card__image {
  max-height: 20rem;
}

.glass-plant-card__fallback {
  display: grid;
  place-items: center;
  width: 5.5rem;
  height: 5.5rem;
  margin-bottom: 1rem;
  border-radius: 999px;
  background: rgba(117, 210, 188, 0.12);
  color: rgba(246, 247, 243, 0.35);
  font-family: "Quicksand", sans-serif;
  font-size: 2.5rem;
  font-weight: 800;
}

.glass-plant-card__body {
  position: relative;
  z-index: 1;
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: 0.25rem 1.35rem 1.35rem;
}

.glass-plant-card__arrow {
  display: inline-flex;
  height: 2.6rem;
  width: 2.6rem;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  border: 1.5px solid rgba(255, 255, 255, 0.7);
  background: transparent;
  color: #fff;
  transition:
    background-color 0.25s ease,
    transform 0.25s ease;
}

.glass-plant-card__arrow:hover {
  background: rgba(255, 255, 255, 0.12);
  transform: scale(1.05);
}
</style>
