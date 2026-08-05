<script setup>
import { computed } from "vue";
import { RouterView, useRoute } from "vue-router";
import AppNav from "./components/AppNav.vue";

const route = useRoute();

const isDarkShell = computed(
  () => route.name === "my-plants" || route.name === "catalog" || route.name === "plant-detail",
);
</script>

<template>
  <div
    class="app-shell min-h-dvh"
    :class="isDarkShell ? 'theme-dark text-paper' : 'theme-light text-forest'"
  >
    <AppNav :dark="isDarkShell" />

    <main class="relative mx-auto w-full max-w-6xl px-4 pb-16 pt-8 sm:px-6 sm:pt-10">
      <RouterView />
    </main>
  </div>
</template>
