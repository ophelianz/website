<script setup lang="ts">
import { MemoryStick, HardDrive, Workflow } from "lucide-vue-next";

const stats = [
  {
    value: "<40MB",
    label: "Memory idle",
    description: "Not a typo.",
    icon: MemoryStick,
  },
  {
    value: "0-copy",
    label: "File I/O",
    description: "Kernel-level",
    icon: HardDrive,
  },
  {
    value: "32",
    label: "Parallel streams",
    description: "Per download",
    icon: Workflow,
  },
];

// Animate the percentage counter
const lightness = ref(0);
const { el: perfEl, isVisible: perfVisible } = useReveal({ threshold: 0.3 });

watch(perfVisible, (visible) => {
  if (!visible) return;
  const target = 95;
  const duration = 1500;
  const start = performance.now();

  function tick(now: number) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    lightness.value = Math.round(eased * target);
    if (progress < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
});
</script>

<template>
  <section id="performance" class="py-32 relative">
    <div class="max-w-6xl mx-auto px-6">
      <RevealSection>
        <div class="text-center mb-16">
          <p
            class="text-xs uppercase tracking-widest text-accent mb-4 font-bold"
          >
            Performance
          </p>
          <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            It's actually<br />
            <span class="text-on-surface-alt">written in Rust.</span>
          </h2>
        </div>
      </RevealSection>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <RevealSection
          v-for="(stat, i) in stats"
          :key="stat.label"
          :delay="i * 100"
        >
          <div
            class="glass-card rounded-2xl p-8 text-center group hover:border-accent/10 transition-all duration-300"
          >
            <div
              class="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mb-4 mx-auto group-hover:bg-accent/15 transition-colors"
            >
              <component
                :is="stat.icon"
                :size="20"
                :stroke-width="2"
                class="text-accent"
              />
            </div>
            <div
              class="text-3xl sm:text-4xl font-bold text-accent mb-2 font-mono tracking-tight"
            >
              {{ stat.value }}
            </div>
            <div class="text-sm font-bold mb-1">{{ stat.label }}</div>
            <div class="text-[13px] text-on-surface-alt font-semibold">
              {{ stat.description }}
            </div>
          </div>
        </RevealSection>
      </div>

      <!-- Big stat -->
      <RevealSection>
        <div
          ref="perfEl"
          class="glass-card rounded-2xl p-12 text-center relative overflow-hidden"
        >
          <div
            class="absolute inset-0 bg-gradient-to-br from-accent/[0.03] to-transparent"
          />
          <div class="relative">
            <div
              class="text-7xl sm:text-8xl lg:text-9xl font-bold tracking-tighter mb-4"
            >
              <span class="text-gradient">{{ lightness }}%</span>
            </div>
            <p class="text-on-surface-alt text-lg font-semibold">
              lighter than Electron.
            </p>
          </div>
        </div>
      </RevealSection>
    </div>
  </section>
</template>
