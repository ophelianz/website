<script setup lang="ts">
import { Layers, Grid3x3, ArrowLeftRight, ShieldCheck } from "lucide-vue-next";

const techniques = [
  {
    title: "Multithreading",
    description: `Multiple threads write to disk simultaneously,
      maxing out your connection instead of waiting in line on sites that allow it`,
    icon: Layers,
  },
  {
    title: "Chunking",
    description:
      "Files are split into small chunks downloaded independently, so if one stalls, the rest keep going",
    icon: Grid3x3,
  },
  {
    title: "Work Stealing",
    description:
      "Idle threads steal work from busy ones, no thread sits around doing nothing.",
    icon: ArrowLeftRight,
  },
  {
    title: "Hedging",
    description:
      "Slow chunks get re-requested from a different mirror and the fastest response wins",
    icon: ShieldCheck,
  },
];
</script>

<template>
  <section class="py-32 relative">
    <div class="max-w-6xl mx-auto px-6">
      <RevealSection>
        <div class="text-center mb-16">
          <p
            class="text-xs uppercase tracking-widest text-accent mb-4 font-bold"
          >
            How it works
          </p>
          <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Mog speed engine<br />
            <span class="text-on-surface-alt">without giving up on looks</span>
          </h2>
        </div>
      </RevealSection>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
        <RevealSection
          v-for="(t, i) in techniques"
          :key="t.title"
          :delay="i * 80"
        >
          <div
            class="glass-card rounded-2xl p-8 h-full group hover:border-accent/10 transition-all duration-300 hover:-translate-y-1"
          >
            <div
              class="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-5 group-hover:bg-accent/15 transition-colors"
            >
              <component
                :is="t.icon"
                :size="22"
                :stroke-width="2"
                class="text-accent"
              />
            </div>

            <h3 class="text-lg font-bold mb-2 tracking-tight">
              {{ t.title }}
            </h3>
            <p class="text-[15px] text-on-surface-alt leading-relaxed">
              {{ t.description }}
            </p>
          </div>
        </RevealSection>
      </div>
    </div>
  </section>
</template>
