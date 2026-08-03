<script setup>
import { RouterLink, RouterView, useRoute } from "vue-router";

const route = useRoute();

const links = [
  { to: "/", label: "My plants", name: "my-plants" },
  { to: "/catalog", label: "Catalog", name: "catalog" },
];

function isActive(name) {
  if (name === "catalog") {
    return route.name === "catalog" || route.name === "plant-detail";
  }
  return route.name === name;
}
</script>

<template>
  <div class="app-shell min-h-dvh text-[var(--app-ink)]">
    <header class="border-b border-emerald-900/10 bg-white/50 backdrop-blur-md dark:border-emerald-100/10 dark:bg-stone-950/50">
      <div class="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <RouterLink to="/" class="group flex items-baseline gap-2 no-underline">
          <span class="font-brand text-3xl font-semibold tracking-tight text-emerald-800 transition-colors group-hover:text-emerald-700 dark:text-emerald-200 dark:group-hover:text-emerald-100">
            Sproutlet
          </span>
          <span class="hidden text-sm text-stone-500 sm:inline dark:text-stone-400">
            your plants, quietly tended
          </span>
        </RouterLink>

        <nav class="flex items-center gap-1 rounded-full border border-emerald-900/10 bg-white/70 p-1 dark:border-emerald-100/10 dark:bg-stone-900/70">
          <RouterLink
            v-for="link in links"
            :key="link.name"
            :to="link.to"
            class="rounded-full px-3.5 py-1.5 text-sm font-medium no-underline transition-colors"
            :class="
              isActive(link.name)
                ? 'bg-emerald-700 text-white dark:bg-emerald-600'
                : 'text-stone-600 hover:bg-emerald-50 hover:text-emerald-900 dark:text-stone-300 dark:hover:bg-stone-800 dark:hover:text-emerald-100'
            "
          >
            {{ link.label }}
          </RouterLink>
        </nav>
      </div>
    </header>

    <main class="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <RouterView />
    </main>
  </div>
</template>
