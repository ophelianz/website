<script setup lang="ts">
import { Check, Download, ExternalLink } from "lucide-vue-next";

useHead({ title: "Download — Ophelia" });

const macBuilds = [
  {
    label: "Apple Silicon",
    href: "https://github.com/ophelianz/ophelia/releases/latest/download/Ophelia-macos-arm64.dmg",
    zip: "https://github.com/ophelianz/ophelia/releases/latest/download/Ophelia-macos-arm64.zip",
  },
  {
    label: "Intel",
    href: "https://github.com/ophelianz/ophelia/releases/latest/download/Ophelia-macos-x86_64.dmg",
    zip: "https://github.com/ophelianz/ophelia/releases/latest/download/Ophelia-macos-x86_64.zip",
  },
];

const browsers = [
  {
    label: "Chrome",
    icon: "simple-icons:googlechrome",
    href: "https://github.com/ophelianz/ophelia",
  },
  {
    label: "Firefox",
    icon: "simple-icons:firefox",
    href: "https://github.com/ophelianz/ophelia",
  },
];
</script>

<template>
  <div
    class="min-h-screen flex flex-col items-center justify-center px-6 py-32"
  >
    <div class="w-full max-w-xl">
      <!-- Header -->
      <div class="mb-12 text-center">
        <p
          class="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-accent mb-4"
        >
          <Check :size="11" :stroke-width="3" /> macos supported now
        </p>
        <h1 class="text-4xl sm:text-5xl font-bold tracking-tight mb-3">
          Download Ophelia
        </h1>
        <p class="text-on-surface-alt text-[15px] font-normal">
          Windows &amp; Linux coming soon!
        </p>
      </div>

      <!-- Step 1 -->
      <div class="mb-8">
        <div class="flex items-center gap-3 mb-4 px-1">
          <div
            class="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-[11px] font-bold text-bg shrink-0"
          >
            1
          </div>
          <span class="text-[13px] font-semibold text-on-surface"
            >Download the app</span
          >
        </div>

        <div class="grid sm:grid-cols-2 gap-3">
          <div
            v-for="build in macBuilds"
            :key="build.label"
            class="rounded-2xl border border-outline bg-surface p-5"
          >
            <div class="mb-4">
              <div class="text-[15px] font-bold">{{ build.label }}</div>
            </div>
            <div class="space-y-2">
              <a
                :href="build.href"
                class="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-accent text-bg text-[13px] font-bold hover:brightness-110 transition-all duration-200"
              >
                <Download :size="13" :stroke-width="2.5" /> DMG
              </a>
              <a
                :href="build.zip"
                target="_blank"
                rel="noopener"
                class="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-outline text-on-surface-alt text-[13px] font-semibold hover:border-white/20 hover:text-on-surface transition-colors"
              >
                <ExternalLink :size="12" :stroke-width="2.25" /> ZIP
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 2 -->
      <div>
        <div class="flex items-center gap-3 mb-4 px-1">
          <div
            class="w-6 h-6 rounded-full border border-outline bg-surface-hover flex items-center justify-center text-[11px] font-bold text-muted-fg shrink-0"
          >
            2
          </div>
          <span class="text-[13px] font-semibold text-on-surface-alt">
            Browser extension
            <span class="font-normal text-muted-fg ml-1"
              >- intercepts downloads</span
            >
          </span>
        </div>

        <div class="grid sm:grid-cols-2 gap-2.5">
          <a
            v-for="b in browsers"
            :key="b.label"
            :href="b.href"
            target="_blank"
            rel="noopener"
            class="group flex items-center gap-3 px-4 py-4 rounded-xl border border-outline bg-surface text-on-surface-alt hover:border-white/20 hover:text-on-surface transition-colors"
          >
            <Icon
              :name="b.icon"
              class="text-[22px] transition-transform duration-200 group-hover:scale-110 shrink-0"
            />
            <span class="text-[13px] font-bold">{{ b.label }}</span>
          </a>
        </div>
      </div>

      <div class="mt-10 text-center">
        <a
          href="https://github.com/ophelianz/ophelia/releases"
          target="_blank"
          rel="noopener"
          class="inline-flex items-center gap-1.5 text-[12px] text-muted-fg hover:text-on-surface-alt transition-colors"
        >
          <ExternalLink :size="11" :stroke-width="2" /> All releases on GitHub
        </a>
      </div>
    </div>
  </div>
</template>
