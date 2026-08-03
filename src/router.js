import { createRouter, createWebHistory } from "vue-router";
import CatalogView from "./views/CatalogView.vue";
import MyPlantsView from "./views/MyPlantsView.vue";
import PlantDetailView from "./views/PlantDetailView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: "/", name: "my-plants", component: MyPlantsView },
    { path: "/catalog", name: "catalog", component: CatalogView },
    { path: "/catalog/:id", name: "plant-detail", component: PlantDetailView, props: true },
  ],
  scrollBehavior() {
    return { top: 0 };
  },
});

export default router;
