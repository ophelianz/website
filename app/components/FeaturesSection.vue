<script setup lang="ts">
import { Puzzle, Zap, Globe, Shield } from "lucide-vue-next";

const features = [
  {
    title: "Plugin System",
    description: "hi :D",
    icon: Puzzle,
    span: "col-span-1",
  },
  {
    title: "Actually Fast",
    description:
      'Async Rust, multi-threaded chunks, zero-copy I/O. Not "fast for an Electron app".',
    icon: Zap,
    span: "col-span-1 md:col-span-2",
  },
  {
    title: "Browser Extension",
    description:
      "Catches downloads from your browser. Works with the sites you actually use.",
    icon: Globe,
    span: "col-span-1 md:col-span-2",
  },
  {
    title: "Tauri, Not Electron",
    description:
      "~40MB memory. Your download manager shouldn't use more RAM than the files you're downloading.",
    icon: Shield,
    span: "col-span-1",
  },
];
</script>

<template>
  <section id="features" class="py-32 relative">
    <div class="max-w-6xl mx-auto px-6">
      <RevealSection>
        <div class="text-center mb-16">
          <p
            class="text-xs uppercase tracking-widest text-accent mb-4 font-bold"
          >
            What it does
          </p>
          <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Downloads, but<br />
            <span class="text-on-surface-alt">make it not suck.</span>
          </h2>
        </div>
      </RevealSection>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <RevealSection
          v-for="(feature, i) in features"
          :key="feature.title"
          :delay="i * 80"
          :class="feature.span"
        >
          <div
            class="glass-card rounded-2xl p-8 h-full group hover:border-accent/10 transition-all duration-300 hover:-translate-y-1"
          >
            <div
              class="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-5 group-hover:bg-accent/15 transition-colors"
            >
              <component
                :is="feature.icon"
                :size="22"
                :stroke-width="2"
                class="text-accent"
              />
            </div>

            <h3 class="text-lg font-bold mb-2 tracking-tight">
              {{ feature.title }}
            </h3>
            <p class="text-[15px] text-on-surface-alt leading-relaxed">
              {{ feature.description }}
            </p>
          </div>
        </RevealSection>
      </div>
    </div>
  </section>
</template>
