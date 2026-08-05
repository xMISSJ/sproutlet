<script setup>
import { RouterLink, useRoute } from "vue-router";
import SproutletMark from "./SproutletMark.vue";

defineProps({
  dark: {
    type: Boolean,
    default: false,
  },
});

const route = useRoute();

const links = [
  { to: "/", label: "My Plants", name: "my-plants" },
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
  <header class="pointer-events-none sticky top-0 z-50">
    <div
      class="px-4 pt-[max(1rem,env(safe-area-inset-top))] backdrop-blur-md sm:px-6 sm:pt-[max(1.25rem,env(safe-area-inset-top))]"
      :class="dark ? 'bg-[rgba(6,22,18,0.92)]' : 'bg-[rgba(246,247,243,0.92)]'"
    >
      <nav
        class="pill-nav pointer-events-auto mx-auto flex max-w-3xl items-center gap-1 rounded-full border p-1.5 shadow-[0_10px_40px_rgba(1,5,5,0.12)] anim-fade"
        :class="dark ? 'border-white/10 bg-[rgba(10,31,28,0.72)]' : 'border-forest/10 bg-white/75'"
      >
        <RouterLink
          to="/"
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full no-underline transition-transform hover:scale-105"
          :class="dark ? 'bg-white/10' : 'bg-hero'"
          aria-label="Sproutlet home"
        >
          <SproutletMark class="h-6 w-6" />
        </RouterLink>

        <div class="flex flex-1 items-center justify-center gap-1">
          <RouterLink
            v-for="link in links"
            :key="link.name"
            :to="link.to"
            class="rounded-full px-4 py-2 text-sm font-semibold no-underline transition-colors"
            :class="
              isActive(link.name)
                ? dark
                  ? 'bg-white text-hero'
                  : 'bg-hero text-white'
                : dark
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
            dark
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
        dark
          ? 'bg-[linear-gradient(180deg,rgba(6,22,18,0.92)_0%,rgba(6,22,18,0)_100%)]'
          : 'bg-[linear-gradient(180deg,rgba(246,247,243,0.92)_0%,rgba(246,247,243,0)_100%)]'
      "
      aria-hidden="true"
    />
  </header>
</template>
