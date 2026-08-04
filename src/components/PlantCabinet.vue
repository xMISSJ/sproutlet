<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";

const props = defineProps({
  carePlants: {
    type: Array,
    default: () => [],
  },
});

const router = useRouter();
const canvasRef = ref(null);
const caption = ref("");
const hint = ref("");

let sceneApi = null;

const favoritePlants = computed(() =>
  [...props.carePlants]
    .filter((item) => item.is_favorite)
    .sort((a, b) => String(a.nickname).localeCompare(String(b.nickname)))
    .map((item) => ({
      id: `care-${item.id}`,
      name: item.nickname,
      plantId: item.plant_id,
      model_style: item.plant?.model_style || item.model_style,
    })),
);

function syncScene() {
  if (!sceneApi) return;
  sceneApi.setPlants(favoritePlants.value);
  const count = favoritePlants.value.length;
  if (count) {
    caption.value = `Favorites · ${count} plant${count === 1 ? "" : "s"}`;
    hint.value = "Click a plant to open its details";
  } else {
    caption.value = "Your favorites cabinet";
    hint.value = "Star plants below to display them here";
  }
}

function openPlant(plantId) {
  if (!plantId) {
    router.push("/catalog");
    return;
  }
  router.push({ name: "plant-detail", params: { id: String(plantId) } });
}

onMounted(async () => {
  if (!canvasRef.value) return;
  const { createCabinetScene } = await import("../three/cabinetScene");
  sceneApi = createCabinetScene(canvasRef.value);
  sceneApi.onPlantSelect = (plantId) => openPlant(plantId);
  syncScene();
});

watch(favoritePlants, syncScene, { deep: true });

onBeforeUnmount(() => {
  sceneApi?.dispose();
  sceneApi = null;
});
</script>

<template>
  <div class="plant-cabinet anim-rise-delay-2 mx-auto w-full max-w-4xl" role="region" aria-label="Plant cabinet">
    <div class="cabinet-meta">
      <p class="cabinet-caption">{{ caption }}</p>
      <p class="cabinet-hint">{{ hint }}</p>
    </div>
    <div class="cabinet-stage">
      <canvas ref="canvasRef" class="cabinet-canvas" aria-label="3D wooden plant cabinet" />
    </div>
  </div>
</template>

<style scoped>
.cabinet-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5rem 1.25rem;
  margin-bottom: 0.85rem;
  padding: 0 0.25rem;
}

.cabinet-caption {
  margin: 0;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(236, 214, 186, 0.72);
}

.cabinet-hint {
  margin: 0;
  font-size: 0.72rem;
  color: rgba(246, 247, 243, 0.45);
}

.cabinet-stage {
  overflow: hidden;
  border-radius: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: #071814;
  box-shadow: 0 28px 70px rgba(0, 0, 0, 0.35);
}

.cabinet-canvas {
  display: block;
  width: 100%;
  height: clamp(360px, 56vw, 520px);
  cursor: grab;
  touch-action: none;
}
</style>
