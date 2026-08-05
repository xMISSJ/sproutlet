<script setup>
import { computed } from "vue";
import GlassPlantCard from "./GlassPlantCard.vue";

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

defineEmits(["open", "favorite", "water", "remove"]);

const imageUrl = computed(() => props.item.plant?.image_url || props.item.image_url || "");
const description = computed(() => {
  if (props.item.notes) return props.item.notes;
  return props.item.plant?.description || props.item.plant?.scientific_name || "";
});
</script>

<template>
  <GlassPlantCard
    :title="item.nickname"
    :description="description"
    :image-url="imageUrl"
    :meta="wateringHint"
    @open="$emit('open', item)"
  >
    <template #actions>
      <button
        type="button"
        class="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border transition"
        :class="
          item.is_favorite
            ? 'border-[var(--mint)]/50 bg-[var(--mint)]/15 text-[var(--mint)]'
            : 'border-white/25 bg-transparent text-white/70 hover:bg-white/10 hover:text-white'
        "
        :aria-pressed="item.is_favorite"
        :aria-label="item.is_favorite ? 'Remove from favorites' : 'Add to favorites'"
        @click.stop="$emit('favorite', item.id)"
      >
        <svg class="h-3.5 w-3.5" viewBox="0 0 16 16" aria-hidden="true">
          <path
            d="M8 1.8 9.9 5.7l4.3.4-3.3 2.9.9 4.2L8 11.3l-3.8 2 0.9-4.2-3.3-2.9 4.3-.4L8 1.8Z"
            :fill="item.is_favorite ? 'currentColor' : 'none'"
            stroke="currentColor"
            stroke-width="1.4"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </template>

    <template #meta>
      <div class="grid gap-2">
        <p class="text-sm font-semibold text-white">{{ wateringHint }}</p>
        <div class="flex flex-wrap gap-2">
          <button
            type="button"
            class="cursor-pointer rounded-full border-0 bg-[var(--mint)] px-3 py-1 text-xs font-semibold text-[var(--hero)] transition hover:brightness-110"
            @click.stop="$emit('water', item.id)"
          >
            Watered
          </button>
          <button
            type="button"
            class="cursor-pointer rounded-full border border-white/25 bg-transparent px-3 py-1 text-xs font-semibold text-white/80 transition hover:bg-white/10"
            @click.stop="$emit('remove', item.id)"
          >
            Remove
          </button>
        </div>
      </div>
    </template>
  </GlassPlantCard>
</template>
