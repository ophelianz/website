<script setup lang="ts">
import { Github, MessageCircle } from "lucide-vue-next";

const columns = [
  {
    title: "Source",
    links: [{ label: "GitHub", href: "https://github.com/ophelianz/ophelia" }],
  },
  {
    title: "Library",
    links: [{ label: "Docs", href: "/docs" }],
  },
  {
    title: "Buh",
    links: [{ label: "Devlog", href: "/devlog" }],
  },
];
</script>

<template>
  <footer class="border-t border-outline py-8">
    <div class="max-w-6xl mx-auto px-2">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
        <!-- Brand -->
        <div class="col-span-2 md:col-span-1">
          <div class="mb-10">
            <Wordmark :width="192" class="block" />
          </div>
          <p
            class="text-xs text-on-surface-alt leading-relaxed max-w-[200px] font-medium"
          >
            &copy 2026 Viktor Luna
          </p>
          <p
            class="text-xs text-on-surface-alt leading-relaxed max-w-[200px] font-medium"
          >
            GNU Public License v3
          </p>
        </div>

        <!-- Link columns -->
        <div v-for="col in columns" :key="col.title">
          <h3
            class="text-xs uppercase tracking-widest text-on-surface-alt/60 mb-4 font-bold"
          >
            {{ col.title }}
          </h3>
          <ul class="space-y-2.5">
            <li v-for="link in col.links" :key="link.label">
              <NuxtLink
                :to="link.href"
                class="text-sm text-on-surface-alt hover:text-on-surface transition-colors duration-200 font-semibold"
              >
                {{ link.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </footer>
</template>
