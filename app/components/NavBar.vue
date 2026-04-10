<script setup lang="ts">
import { Download, Github, Menu } from "lucide-vue-next";

const links = [
  { label: "Docs", href: "/docs" },
  { label: "Roadmap", href: "/roadmap" },
  { label: "Devlog", href: "/devlog" },
];

const scrolled = ref(false);
const mobileOpen = ref(false);

onMounted(() => {
  const onScroll = () => {
    scrolled.value = window.scrollY > 20;
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onUnmounted(() => window.removeEventListener("scroll", onScroll));
});
</script>

<template>
  <nav
    class="fixed top-0 inset-x-0 z-50 transition-all duration-300"
    :class="scrolled ? 'glass py-4' : 'py-6'"
  >
    <div class="max-w-6xl mx-auto px-6 flex items-center justify-between">
      <NuxtLink to="/" class="group">
        <Wordmark
          :width="300"
          class="block transition-opacity duration-200 group-hover:opacity-85"
        />
      </NuxtLink>

      <div class="hidden md:flex items-center gap-10">
        <NuxtLink
          v-for="link in links"
          :key="link.label"
          :to="link.href"
          class="text-[15px] font-medium text-on-surface-alt hover:text-on-surface transition-colors duration-200"
        >
          {{ link.label }}
        </NuxtLink>
      </div>

      <div class="hidden md:flex items-center gap-5">
        <a
          href="https://github.com/ophelianz/ophelia"
          target="_blank"
          rel="noopener"
          aria-label="GitHub"
          class="text-on-surface-alt hover:text-on-surface transition-colors duration-200"
        >
          <Github :size="18" :stroke-width="2" />
        </a>
        <NuxtLink
          to="/download"
          class="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-accent text-bg text-[14px] font-bold hover:brightness-110 transition-all duration-200"
        >
          <Download :size="15" :stroke-width="2.5" />
          Download
        </NuxtLink>
      </div>

      <button
        class="md:hidden text-on-surface-alt"
        aria-label="Toggle menu"
        @click="mobileOpen = !mobileOpen"
      >
        <Menu :size="22" :stroke-width="2" />
      </button>
    </div>

    <!-- Mobile menu -->
    <div
      v-if="mobileOpen"
      class="md:hidden glass mt-2 mx-4 rounded-xl p-4 space-y-3"
    >
      <NuxtLink
        v-for="link in links"
        :key="link.label"
        :to="link.href"
        class="block text-[15px] font-semibold text-on-surface-alt hover:text-on-surface py-2"
        @click="mobileOpen = false"
      >
        {{ link.label }}
      </NuxtLink>
      <a
        href="https://github.com/ophelianz/ophelia"
        target="_blank"
        class="block text-[15px] font-semibold text-on-surface-alt hover:text-on-surface py-2"
      >
        GitHub
      </a>
    </div>
  </nav>
</template>
