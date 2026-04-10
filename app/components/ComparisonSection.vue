<script setup lang="ts">
const { el, isVisible } = useReveal({ threshold: 0.2 });

const logos: Record<string, string> = {
  Motrix: `data:image/svg+xml,<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="32" rx="8" fill="%232B6CB0"/><path d="M7 22V10l5.5 7 3.5-5 3.5 5 5.5-7v12" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  FDM: `data:image/svg+xml,<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="32" rx="8" fill="%232D6A4F"/><path d="M16 8v12M10 14l6 6 6-6" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 22h14" stroke="white" stroke-width="2.5" stroke-linecap="round"/></svg>`,
  JDownloader: `data:image/svg+xml,<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="32" rx="8" fill="%231A365D"/><path d="M18 8v11c0 2.5-1.5 5-5 5" stroke="white" stroke-width="2.5" stroke-linecap="round"/><path d="M10 18l3 3-3 3" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  IDM: `data:image/svg+xml,<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="32" rx="8" fill="%23742A2A"/><path d="M11 10h10M16 10v12M10 22h12" stroke="white" stroke-width="2.5" stroke-linecap="round"/></svg>`,
};

const categories = [
  {
    label: "Memory usage (idle)",
    unit: "MB",
    lowerIsBetter: true,
    entries: [
      { name: "Ophelia", value: 38, color: "bg-accent" },
      { name: "Motrix", value: 120, color: "bg-white/20" },
      { name: "FDM", value: 185, color: "bg-white/20" },
      { name: "JDownloader", value: 340, color: "bg-white/20" },
      { name: "IDM", value: 95, color: "bg-white/20" },
    ],
  },
  {
    label: "App size",
    unit: "MB",
    lowerIsBetter: true,
    entries: [
      { name: "Ophelia", value: 12, color: "bg-accent" },
      { name: "Motrix", value: 85, color: "bg-white/20" },
      { name: "FDM", value: 40, color: "bg-white/20" },
      { name: "JDownloader", value: 210, color: "bg-white/20" },
      { name: "IDM", value: 25, color: "bg-white/20" },
    ],
  },
  {
    label: "Coolness",
    unit: "",
    lowerIsBetter: false,
    entries: [
      { name: "Ophelia", value: 100, color: "bg-accent" },
      { name: "Motrix", value: 18, color: "bg-white/20" },
      { name: "FDM", value: 12, color: "bg-white/20" },
      { name: "JDownloader", value: 9, color: "bg-white/20" },
      { name: "IDM", value: 4, color: "bg-white/20" },
    ],
  },
];

function barWidth(entry: { value: number }, category: (typeof categories)[0]) {
  const max = Math.max(...category.entries.map((e) => e.value));
  return `${(entry.value / max) * 100}%`;
}
</script>

<template>
  <section class="py-32 relative">
    <div class="max-w-6xl mx-auto px-6">
      <RevealSection>
        <div class="text-center mb-16">
          <p
            class="text-xs uppercase tracking-widest text-accent mb-4 font-bold"
          >
            Benchmarks
          </p>
          <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Ophelia vs everyone else
          </h2>
          <p
            class="text-on-surface-alt text-[15px] mt-4 font-medium max-w-lg mx-auto"
          >
            Bicurious chad rawdogged Rust codebase vs century-old C++ codebases
          </p>
        </div>
      </RevealSection>

      <div ref="el" class="space-y-10">
        <RevealSection
          v-for="(cat, ci) in categories"
          :key="cat.label"
          :delay="ci * 120"
        >
          <div class="glass-card rounded-2xl p-6 sm:p-8">
            <div class="flex items-center justify-between mb-5">
              <h3 class="text-sm font-bold tracking-tight">{{ cat.label }}</h3>
              <span
                v-if="cat.unit"
                class="text-[11px] font-bold uppercase tracking-widest text-muted-fg"
              >
                {{ cat.lowerIsBetter ? "Lower is better" : "Higher is better" }}
              </span>
            </div>

            <div class="space-y-3">
              <div
                v-for="(entry, ei) in cat.entries"
                :key="entry.name"
                class="flex items-center gap-4"
              >
                <div class="w-28 shrink-0 flex items-center justify-end gap-2">
                  <span
                    class="text-[13px] font-semibold"
                    :class="
                      entry.name === 'Ophelia'
                        ? 'text-accent'
                        : 'text-on-surface-alt'
                    "
                    >{{ entry.name }}</span
                  >
                  <OpheliaLogo
                    v-if="entry.name === 'Ophelia'"
                    :size="14"
                    class="shrink-0 opacity-80"
                  />
                  <img
                    v-else-if="logos[entry.name]"
                    :src="logos[entry.name]"
                    :alt="entry.name"
                    width="14"
                    height="14"
                    class="rounded-sm shrink-0 opacity-60"
                  />
                </div>

                <div
                  class="flex-1 h-7 rounded-md bg-white/[0.03] overflow-hidden relative"
                >
                  <div
                    class="h-full rounded-md transition-all duration-1000 ease-out"
                    :class="[
                      entry.color,
                      entry.name === 'Ophelia' ? 'opacity-100' : 'opacity-40',
                    ]"
                    :style="{
                      width: isVisible ? barWidth(entry, cat) : '0%',
                      transitionDelay: `${ci * 150 + ei * 80}ms`,
                    }"
                  />
                </div>

                <span
                  class="w-16 shrink-0 text-[13px] font-bold tabular-nums"
                  :class="
                    entry.name === 'Ophelia'
                      ? 'text-accent'
                      : 'text-on-surface-alt'
                  "
                >
                  <template v-if="cat.unit"
                    >{{ entry.value }} {{ cat.unit }}</template
                  >
                  <template v-else-if="entry.name === 'Ophelia'">yes</template>
                  <template v-else>no</template>
                </span>
              </div>
            </div>
          </div>
        </RevealSection>
      </div>
    </div>
  </section>
</template>
