<script setup lang="ts">
import {
  Puzzle,
  Youtube,
  Wifi,
  Globe,
  Plus,
  Check,
  ChevronRight,
} from "lucide-vue-next";

interface Node {
  id: string;
  x: number;
  y: number;
  r: number;
  accent?: boolean;
}

const { el, isVisible } = useReveal({ threshold: 0.2 });

const nodes: Node[] = [
  { id: "core", x: 400, y: 240, accent: true, r: 6 },
  { id: "ytdlp", x: 255, y: 148, accent: true, r: 4.5 },
  { id: "tmdb", x: 548, y: 144, accent: true, r: 4.5 },
  { id: "bridge", x: 262, y: 336, accent: true, r: 4.5 },
  { id: "custom", x: 540, y: 330, accent: false, r: 4 },
];

const nodeMap: Record<string, Node> = Object.fromEntries(
  nodes.map((n) => [n.id, n]),
);

const edges = [
  ["core", "ytdlp"],
  ["core", "tmdb"],
  ["core", "bridge"],
  ["core", "custom"],
];

const plugins = [
  {
    id: "yt-dlp",
    name: "yt-dlp",
    description: "Not another fat ass wrapper around a Python CLI tool",
    icon: Youtube,
    enabled: true,
    tag: "built-in",
  },
  {
    id: "tmdb",
    name: "TMDB",
    description: "Alternative backendfor BitTorrent and metalinks.",
    icon: Wifi,
    enabled: true,
    tag: "built-in",
  },
  {
    id: "browser-bridge",
    name: "browser bridge",
    description: "Intercepts downloads from Chrome & Firefox (hate edge)",
    icon: Globe,
    enabled: true,
    tag: "built-in",
  },
  {
    id: "custom",
    name: "your plugin",
    description: "Look at the docs for info :p",
    icon: Plus,
    enabled: false,
    tag: "cool stuff",
  },
];
</script>

<template>
  <section class="py-32 relative overflow-hidden">
    <!-- Decorative node graph -->
    <svg
      class="absolute inset-0 w-full h-full pointer-events-none select-none transition-all duration-700"
      :class="isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.98]'"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 800 480"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <radialGradient id="graph-glow" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stop-color="rgb(215 255 89)" stop-opacity="0.22" />
          <stop offset="60%" stop-color="rgb(215 255 89)" stop-opacity="0.06" />
          <stop offset="100%" stop-color="rgb(215 255 89)" stop-opacity="0" />
        </radialGradient>
        <linearGradient id="graph-line" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="white" stop-opacity="0.02" />
          <stop offset="50%" stop-color="rgb(215 255 89)" stop-opacity="0.12" />
          <stop offset="100%" stop-color="white" stop-opacity="0.02" />
        </linearGradient>
        <radialGradient id="graph-fade" cx="50%" cy="50%" r="55%">
          <stop offset="30%" stop-opacity="1" stop-color="white" />
          <stop offset="100%" stop-opacity="0" stop-color="white" />
        </radialGradient>
        <mask id="graph-mask">
          <rect width="800" height="480" fill="url(#graph-fade)" />
        </mask>
      </defs>
      <g mask="url(#graph-mask)">
        <circle
          cx="400"
          cy="240"
          r="126"
          fill="none"
          stroke="white"
          stroke-opacity="0.05"
        />
        <circle cx="400" cy="240" r="72" fill="url(#graph-glow)" />
        <circle
          v-for="node in nodes"
          :key="node.id"
          :cx="node.x"
          :cy="node.y"
          :r="node.r"
          :class="node.accent ? 'fill-accent/50' : 'fill-white/[0.16]'"
        />
      </g>
    </svg>

    <div ref="el" class="max-w-6xl mx-auto px-6 relative">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <!-- Left: copy -->
        <RevealSection>
          <div>
            <p
              class="text-xs uppercase tracking-widest text-accent mb-4 font-bold"
            >
              Plugins
            </p>
            <h2
              class="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6"
            >
              Need something?<br />
              <span class="text-on-surface-alt">add a plugin!</span>
            </h2>
            <p
              class="text-on-surface-alt text-[15px] leading-relaxed font-medium max-w-sm"
            >
              I still don't know what these will do
            </p>

            <div class="mt-8 flex items-center gap-3">
              <div
                class="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-outline text-[12px] font-bold text-on-surface-alt"
              >
                <div class="w-1.5 h-1.5 rounded-full bg-accent" />
                buh
              </div>
              <div
                class="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-outline text-[12px] font-bold text-on-surface-alt"
              >
                <div class="w-1.5 h-1.5 rounded-full bg-accent" />
                hot reload
              </div>
            </div>
          </div>
        </RevealSection>

        <!-- Right: dashboard mock -->
        <RevealSection :delay="150">
          <div
            class="rounded-2xl border border-white/[0.07] overflow-hidden shadow-2xl bg-surface-raised"
          >
            <!-- Titlebar -->
            <div
              class="flex items-center gap-3 px-4 h-10 border-b border-white/[0.07] bg-surface-deep"
            >
              <div class="flex gap-1.5">
                <div class="w-2.5 h-2.5 rounded-full bg-white/10" />
                <div class="w-2.5 h-2.5 rounded-full bg-white/10" />
                <div class="w-2.5 h-2.5 rounded-full bg-white/10" />
              </div>
              <div class="flex items-center gap-1.5 ml-1">
                <Puzzle :size="11" :stroke-width="2" class="text-accent" />
                <span class="text-[11px] font-bold tracking-tight"
                  >Plugins</span
                >
              </div>
            </div>

            <!-- Plugin list -->
            <div class="p-3 space-y-2">
              <div
                v-for="(plugin, i) in plugins"
                :key="plugin.id"
                class="flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all duration-300"
                :class="
                  plugin.enabled
                    ? 'border-accent/10 bg-accent/[0.03]'
                    : 'border-white/[0.05] bg-white/[0.02]'
                "
                :style="{ transitionDelay: `${200 + i * 80}ms` }"
              >
                <div
                  class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  :class="plugin.enabled ? 'bg-accent/15' : 'bg-white/[0.05]'"
                >
                  <component
                    :is="plugin.icon"
                    :size="14"
                    :stroke-width="2"
                    :class="plugin.enabled ? 'text-accent' : 'text-muted-fg'"
                  />
                </div>

                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-0.5">
                    <span class="text-[12px] font-bold tracking-tight">{{
                      plugin.name
                    }}</span>
                    <span
                      class="text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wide"
                      :class="
                        plugin.tag === 'buh'
                          ? 'bg-white/[0.06] text-muted-fg'
                          : 'bg-accent/15 text-accent'
                      "
                    >
                      {{ plugin.tag }}
                    </span>
                  </div>
                  <p
                    class="text-[10px] text-muted-fg font-medium leading-tight"
                  >
                    {{ plugin.description }}
                  </p>
                </div>

                <div class="shrink-0">
                  <div
                    v-if="plugin.enabled"
                    class="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center"
                  >
                    <Check :size="10" :stroke-width="3" class="text-accent" />
                  </div>
                  <div
                    v-else
                    class="w-5 h-5 rounded-full border border-white/[0.07] border-dashed flex items-center justify-center"
                  >
                    <Plus :size="9" :stroke-width="2" class="text-muted-fg" />
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div
              class="px-4 py-2.5 border-t border-white/[0.07] flex items-center justify-between bg-surface-deep"
            >
              <span class="text-[10px] text-muted-fg font-medium">hi</span>
              <button
                class="flex items-center gap-1 text-[10px] text-accent font-bold hover:opacity-70 transition-opacity"
              >
                browse <ChevronRight :size="10" :stroke-width="2.5" />
              </button>
            </div>
          </div>
        </RevealSection>
      </div>
    </div>
  </section>
</template>
