<script setup>
import { computed } from "vue";
import { RouterLink, RouterView, useRoute } from "vue-router";

const route = useRoute();

const links = [
  { to: "/", label: "My Plants", name: "my-plants" },
  { to: "/catalog", label: "Catalog", name: "catalog" },
];

const isDarkShell = computed(
  () => route.name === "my-plants" || route.name === "catalog" || route.name === "plant-detail",
);

function isActive(name) {
  if (name === "catalog") {
    return route.name === "catalog" || route.name === "plant-detail";
  }
  return route.name === name;
}
</script>

<template>
  <div
    class="app-shell min-h-dvh"
    :class="isDarkShell ? 'theme-dark text-paper' : 'theme-light text-forest'"
  >
    <header class="pointer-events-none sticky top-0 z-50">
      <div
        class="px-4 pt-[max(1rem,env(safe-area-inset-top))] backdrop-blur-md sm:px-6 sm:pt-[max(1.25rem,env(safe-area-inset-top))]"
        :class="isDarkShell ? 'bg-[rgba(6,22,18,0.92)]' : 'bg-[rgba(246,247,243,0.92)]'"
      >
        <nav
          class="pill-nav pointer-events-auto mx-auto flex max-w-3xl items-center gap-1 rounded-full border p-1.5 shadow-[0_10px_40px_rgba(1,5,5,0.12)] anim-fade"
          :class="
            isDarkShell
              ? 'border-white/10 bg-[rgba(10,31,28,0.72)]'
              : 'border-forest/10 bg-white/75'
          "
        >
          <RouterLink
            to="/"
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full no-underline transition-transform hover:scale-105"
            :class="isDarkShell ? 'bg-white/10 text-mint' : 'bg-hero text-mint'"
            aria-label="Sproutlet home"
          >
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M12 20c0-6 3.5-10.5 8-12-1.2 5.2-4.2 9-8 12Z"
                fill="currentColor"
                opacity="0.95"
              />
              <path
                d="M12 20c0-6-3.5-10.5-8-12 1.2 5.2 4.2 9 8 12Z"
                fill="currentColor"
                opacity="0.55"
              />
              <path d="M12 20V11" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
            </svg>
          </RouterLink>

          <div class="flex flex-1 items-center justify-center gap-1">
            <RouterLink
              v-for="link in links"
              :key="link.name"
              :to="link.to"
              class="rounded-full px-4 py-2 text-sm font-semibold no-underline transition-colors"
              :class="
                isActive(link.name)
                  ? isDarkShell
                    ? 'bg-white text-hero'
                    : 'bg-hero text-white'
                  : isDarkShell
                    ? 'text-white/70 hover:bg-white/10 hover:text-white'
                    : 'text-moss hover:bg-sage/25 hover:text-hero'
              "
            >
              {{ link.label }}
            </RouterLink>
          </div>

          <RouterLink
            to="/catalog"
            class="hidden h-10 items-center rounded-full border px-4 text-sm font-semibold no-underline transition-colors sm:inline-flex"
            :class="
              isDarkShell
                ? 'border-white/20 text-white/90 hover:bg-white/10'
                : 'border-forest/20 text-forest hover:bg-sage/20'
            "
          >
            Explore
          </RouterLink>
        </nav>
      </div>
      <div
        class="h-5 sm:h-6"
        :class="
          isDarkShell
            ? 'bg-[linear-gradient(180deg,rgba(6,22,18,0.92)_0%,rgba(6,22,18,0)_100%)]'
            : 'bg-[linear-gradient(180deg,rgba(246,247,243,0.92)_0%,rgba(246,247,243,0)_100%)]'
        "
        aria-hidden="true"
      />
    </header>

    <main class="relative mx-auto w-full max-w-6xl px-4 pb-16 pt-8 sm:px-6 sm:pt-10">
      <RouterView />
    </main>
  </div>
</template>
