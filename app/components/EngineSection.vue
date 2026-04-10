<script setup lang="ts">
import type { Component } from "vue";
import {
  ArrowLeftRight,
  Gauge,
  RotateCcw,
  Rows3,
  ShieldCheck,
} from "lucide-vue-next";

interface EngineMode {
  name: string;
  accentClass: string;
}

interface EngineAction {
  title: string;
  note: string;
  icon: Component;
  accentClass: string;
  activeClass: string;
}

interface EngineState {
  speedBars: number[];
  rangeProgress: number[];
  activeWorkers: number;
  queuedChunks: number;
  resumeSnapshots: number;
  modeIndex: number;
  recoveryStage: number;
  focusAction: number;
}

const recoveryLoop = ["Detect", "Retry", "Hedge"] as const;

const modes: EngineMode[] = [
  {
    name: "Balanced",
    accentClass: "text-accent border-accent/20 bg-accent/8",
  },
  {
    name: "File-specific",
    accentClass: "text-secondary border-secondary/20 bg-secondary/8",
  },
  {
    name: "Sequential",
    accentClass: "text-[#A78BFA] border-[#A78BFA]/20 bg-[#A78BFA]/8",
  },
];

const actions: EngineAction[] = [
  {
    title: "Probe",
    note: "checks range support first",
    icon: ShieldCheck,
    accentClass: "text-accent bg-accent/12 border-accent/16",
    activeClass: "border-accent/20 bg-accent/[0.06]",
  },
  {
    title: "Split",
    note: "turns one file into byte ranges",
    icon: Rows3,
    accentClass: "text-secondary bg-secondary/12 border-secondary/16",
    activeClass: "border-secondary/20 bg-secondary/[0.06]",
  },
  {
    title: "Balance",
    note: "workers steal the slow tail",
    icon: ArrowLeftRight,
    accentClass: "text-[#A78BFA] bg-[#A78BFA]/12 border-[#A78BFA]/16",
    activeClass: "border-[#A78BFA]/20 bg-[#A78BFA]/[0.06]",
  },
  {
    title: "Resume",
    note: "keeps real transfer state",
    icon: RotateCcw,
    accentClass: "text-on-surface-alt bg-white/[0.06] border-white/[0.08]",
    activeClass: "border-white/[0.14] bg-white/[0.05]",
  },
];

const engineStates: EngineState[] = [
  {
    speedBars: [8, 10, 12, 15, 18, 21, 23, 25, 27, 29, 31, 33],
    rangeProgress: [14, 22, 8, 0],
    activeWorkers: 2,
    queuedChunks: 16,
    resumeSnapshots: 2,
    modeIndex: 0,
    recoveryStage: 0,
    focusAction: 0,
  },
  {
    speedBars: [10, 13, 17, 20, 24, 28, 31, 33, 35, 37, 39, 38],
    rangeProgress: [36, 48, 24, 12],
    activeWorkers: 4,
    queuedChunks: 10,
    resumeSnapshots: 3,
    modeIndex: 0,
    recoveryStage: 0,
    focusAction: 1,
  },
  {
    speedBars: [11, 15, 18, 22, 26, 30, 34, 37, 39, 37, 34, 31],
    rangeProgress: [58, 72, 45, 34],
    activeWorkers: 4,
    queuedChunks: 6,
    resumeSnapshots: 4,
    modeIndex: 0,
    recoveryStage: 1,
    focusAction: 2,
  },
  {
    speedBars: [10, 13, 16, 19, 23, 27, 31, 34, 36, 34, 30, 26],
    rangeProgress: [76, 88, 69, 58],
    activeWorkers: 3,
    queuedChunks: 3,
    resumeSnapshots: 6,
    modeIndex: 1,
    recoveryStage: 2,
    focusAction: 3,
  },
  {
    speedBars: [8, 11, 14, 18, 21, 24, 28, 31, 33, 31, 28, 24],
    rangeProgress: [91, 97, 85, 76],
    activeWorkers: 2,
    queuedChunks: 1,
    resumeSnapshots: 7,
    modeIndex: 2,
    recoveryStage: 0,
    focusAction: 2,
  },
];

const ENGINE_CHART_WIDTH = 128;
const ENGINE_CHART_HEIGHT = 52;
const BAR_WIDTH = 7;
const BAR_GAP = 4;
const ENGINE_GRID_LINES = [10, 26, 42] as const;

const engineFrame = ref(0);
const currentEngineState = computed(
  () => engineStates[engineFrame.value % engineStates.length]!,
);

const activeMode = computed(() => modes[currentEngineState.value.modeIndex]!);
const activeRecovery = computed(
  () => recoveryLoop[currentEngineState.value.recoveryStage]!,
);

const speedRects = computed(() =>
  currentEngineState.value.speedBars.map((height, index) => ({
    x: index * (BAR_WIDTH + BAR_GAP),
    y: ENGINE_CHART_HEIGHT - height,
    height,
  })),
);

const actionMetrics = computed(() => [
  currentEngineState.value.rangeProgress[0]! >= 20 ? "range-ready" : "probing",
  `${currentEngineState.value.activeWorkers} workers`,
  activeRecovery.value.toLowerCase(),
  `${currentEngineState.value.resumeSnapshots} snaps`,
]);

let engineTimer: ReturnType<typeof setInterval> | null = null;

function rangeFillClass(index: number) {
  if (index === 0) return "bg-accent";
  if (index === 1) return "bg-secondary";
  if (index === 2) return "bg-[#A78BFA]";
  return "bg-white/[0.18]";
}

onMounted(() => {
  engineTimer = setInterval(() => {
    engineFrame.value = (engineFrame.value + 1) % engineStates.length;
  }, 1700);
});

onUnmounted(() => {
  if (engineTimer) clearInterval(engineTimer);
});
</script>

<template>
  <section class="relative py-32">
    <div class="mx-auto max-w-6xl px-6">
      <RevealSection>
        <div class="mx-auto mb-14 max-w-3xl text-center">
          <p
            class="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-muted-fg"
          >
            Engine
          </p>
          <h2 class="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            A real transfer engine,
            <span class="font-normal text-on-surface-alt"
              >not just a progress bar.</span
            >
          </h2>
          <p class="mx-auto mt-5 max-w-2xl text-[16px] leading-7 text-muted-fg">
            not exactly cutting edge; but an optimized Rust engine nonetheless
          </p>
        </div>
      </RevealSection>

      <RevealSection :delay="60">
        <div
          class="overflow-hidden rounded-2xl border border-white/[0.07] bg-surface-card p-6 sm:p-7"
        >
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div
                class="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-fg"
              >
                Live engine telemetry
              </div>
              <div class="mt-1 text-[22px] font-bold tracking-tight">
                {{ currentEngineState.activeWorkers }} active workers
              </div>
            </div>

            <div
              class="rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] transition-all duration-[1400ms]"
              :class="activeMode.accentClass"
            >
              {{ activeMode.name }}
            </div>
          </div>

          <div class="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px]">
            <div
              class="rounded-xl border border-white/[0.06] bg-surface-deep/70 p-4"
            >
              <svg
                class="block h-[148px] w-full"
                :viewBox="`0 0 ${ENGINE_CHART_WIDTH} ${ENGINE_CHART_HEIGHT}`"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient
                    id="engine-bar-gradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    :y2="ENGINE_CHART_HEIGHT"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop offset="0%" stop-color="rgb(89 251 181 / 0.95)" />
                    <stop offset="100%" stop-color="rgb(89 251 181 / 0.18)" />
                  </linearGradient>
                </defs>

                <line
                  v-for="y in ENGINE_GRID_LINES"
                  :key="y"
                  x1="0"
                  :x2="ENGINE_CHART_WIDTH"
                  :y1="y"
                  :y2="y"
                  stroke="rgba(255,255,255,0.08)"
                  stroke-width="1"
                />

                <rect
                  v-for="bar in speedRects"
                  :key="bar.x"
                  :x="bar.x"
                  :y="bar.y"
                  :width="BAR_WIDTH"
                  :height="bar.height"
                  rx="2.5"
                  fill="url(#engine-bar-gradient)"
                  class="transition-all duration-[1400ms] ease-in-out"
                />
              </svg>

              <div class="mt-4 grid gap-2">
                <div
                  v-for="(progress, index) in currentEngineState.rangeProgress"
                  :key="index"
                  class="grid grid-cols-[40px_minmax(0,1fr)_34px] items-center gap-2"
                >
                  <span
                    class="text-[10px] uppercase tracking-[0.18em] text-muted-fg"
                  >
                    r{{ index + 1 }}
                  </span>
                  <div
                    class="h-1.5 overflow-hidden rounded-full bg-white/[0.05]"
                  >
                    <div
                      class="h-full rounded-full transition-all duration-[1400ms] ease-in-out"
                      :class="rangeFillClass(index)"
                      :style="{ width: `${progress}%` }"
                    />
                  </div>
                  <span
                    class="text-right text-[10px] tabular-nums text-on-surface-alt"
                  >
                    {{ progress }}%
                  </span>
                </div>
              </div>
            </div>

            <div class="grid gap-3">
              <div
                class="rounded-xl border border-white/[0.06] bg-surface-deep/70 p-4"
              >
                <div
                  class="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-fg"
                >
                  Queue
                </div>
                <div
                  class="mt-2 text-[28px] font-bold leading-none tabular-nums"
                >
                  {{ currentEngineState.queuedChunks }}
                </div>
                <div class="mt-1 text-[12px] text-on-surface-alt">
                  chunks waiting
                </div>
              </div>

              <div
                class="rounded-xl border border-white/[0.06] bg-surface-deep/70 p-4"
              >
                <div
                  class="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-fg"
                >
                  Resume
                </div>
                <div
                  class="mt-2 text-[28px] font-bold leading-none tabular-nums"
                >
                  {{ currentEngineState.resumeSnapshots }}
                </div>
                <div class="mt-1 text-[12px] text-on-surface-alt">
                  stored snapshots
                </div>
              </div>

              <div
                class="rounded-xl border border-white/[0.06] bg-surface-deep/70 p-4"
              >
                <div
                  class="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-fg"
                >
                  Recovery
                </div>
                <div class="mt-2 flex items-center gap-2">
                  <span
                    class="h-2.5 w-2.5 rounded-full bg-accent shadow-[0_0_14px_rgba(89,251,181,0.4)] transition-all duration-[1400ms]"
                  />
                  <span class="text-[16px] font-bold tracking-tight">
                    {{ activeRecovery }}
                  </span>
                </div>
                <div class="mt-1 text-[12px] text-on-surface-alt">
                  handling the slow tail
                </div>
              </div>
            </div>
          </div>
        </div>
      </RevealSection>

      <div class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <RevealSection
          v-for="(action, index) in actions"
          :key="action.title"
          :delay="120 + index * 60"
        >
          <div
            class="rounded-2xl border p-5 transition-all duration-[1400ms]"
            :class="
              index === currentEngineState.focusAction
                ? action.activeClass
                : 'border-white/[0.07] bg-surface-card'
            "
          >
            <div class="flex items-start justify-between gap-3">
              <div
                class="flex h-11 w-11 items-center justify-center rounded-xl border"
                :class="action.accentClass"
              >
                <component :is="action.icon" :size="18" :stroke-width="2" />
              </div>
              <span
                class="rounded-full border border-white/[0.07] bg-surface-raised px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-on-surface-alt"
              >
                {{ actionMetrics[index] }}
              </span>
            </div>

            <div class="mt-4">
              <h3 class="text-[17px] font-bold tracking-tight">
                {{ action.title }}
              </h3>
              <p class="mt-1 text-[13px] leading-5 text-on-surface-alt">
                {{ action.note }}
              </p>
            </div>

            <div class="mt-4 h-1 overflow-hidden rounded-full bg-white/[0.05]">
              <div
                class="h-full rounded-full transition-all duration-[1400ms] ease-in-out"
                :class="
                  index === 0
                    ? 'bg-accent'
                    : index === 1
                      ? 'bg-secondary'
                      : index === 2
                        ? 'bg-[#A78BFA]'
                        : 'bg-white/[0.45]'
                "
                :style="{
                  width:
                    index === currentEngineState.focusAction ? '100%' : '38%',
                }"
              />
            </div>
          </div>
        </RevealSection>
      </div>
    </div>
  </section>
</template>
