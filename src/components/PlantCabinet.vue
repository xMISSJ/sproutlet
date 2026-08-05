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
  <div class="anim-rise-delay-2 mx-auto w-full max-w-4xl" role="region" aria-label="Plant cabinet">
    <div class="mb-3.5 flex flex-wrap items-baseline justify-between gap-x-5 gap-y-2 px-1">
      <p class="m-0 text-xs font-semibold tracking-[0.08em] text-[rgba(236,214,186,0.72)] uppercase">
        {{ caption }}
      </p>
      <p class="m-0 text-[0.72rem] text-paper/45">{{ hint }}</p>
    </div>
    <div
      class="overflow-hidden rounded-[2rem] border border-white/10 bg-[#071814] shadow-[0_28px_70px_rgba(0,0,0,0.35)]"
    >
      <canvas
        ref="canvasRef"
        class="block h-[clamp(360px,56vw,520px)] w-full cursor-grab touch-none"
        aria-label="3D wooden plant cabinet"
      />
    </div>
  </div>
</template>
