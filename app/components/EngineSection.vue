<script setup lang="ts">
import type { Component } from "vue";
import {
  ArrowLeftRight,
  ArrowRight,
  Gauge,
  RotateCcw,
  Rows3,
} from "lucide-vue-next";

type ModeId = "balanced" | "sequential";

interface EngineAction {
  title: string;
  note: string;
  icon: Component;
  accentClass: string;
  activeClass: string;
}

interface EngineFeature {
  value: string;
  note: string;
  valueClass?: string;
}

interface EngineState {
  speedBars: number[];
  rangeProgress: number[];
  coverage: number[];
  recoveryStage: number;
  activeSteps: number[];
}

interface EngineModeConfig {
  label: string;
  badgeClass: string;
  telemetryTitle: string;
  telemetryLabel: string;
  telemetryNote: string;
  panelTitle: string;
  panelNote: string;
  actions: EngineAction[];
  features: EngineFeature[];
  states: EngineState[];
}

const recoveryTools = ["Retry", "Steal", "Hedge"] as const;
const modeOrder: ModeId[] = ["balanced", "sequential"];

const balancedActions: EngineAction[] = [
  {
    title: "Probe",
    note: "check range support, content length, and the final filename before opening any workers",
    icon: Gauge,
    accentClass: "text-accent bg-accent/12 border-accent/16",
    activeClass: "border-accent/20 bg-accent/[0.06]",
  },
  {
    title: "Queue",
    note: "preallocate the part file, build chunk boundaries, and seed the pending range queue",
    icon: Rows3,
    accentClass: "text-secondary bg-secondary/12 border-secondary/16",
    activeClass: "border-secondary/20 bg-secondary/[0.06]",
  },
  {
    title: "Ramp",
    note: "start at one worker, then open more ranges as completed chunks free capacity",
    icon: ArrowLeftRight,
    accentClass: "text-[#A78BFA] bg-[#A78BFA]/12 border-[#A78BFA]/16",
    activeClass: "border-[#A78BFA]/20 bg-[#A78BFA]/[0.06]",
  },
  {
    title: "Recovery",
    note: "retry inside workers, then steal or hedge the slow tail when spare capacity opens up",
    icon: RotateCcw,
    accentClass: "text-on-surface-alt bg-white/[0.06] border-white/[0.08]",
    activeClass: "border-white/[0.14] bg-white/[0.05]",
  },
];

const sequentialActions: EngineAction[] = [
  {
    title: "Probe",
    note: "check range support, content length, and the final filename before starting the queue",
    icon: Gauge,
    accentClass: "text-accent bg-accent/12 border-accent/16",
    activeClass: "border-accent/20 bg-accent/[0.06]",
  },
  {
    title: "Queue",
    note: "build normal chunk boundaries and keep them lined up in strict front-to-back order",
    icon: Rows3,
    accentClass: "text-secondary bg-secondary/12 border-secondary/16",
    activeClass: "border-secondary/20 bg-secondary/[0.06]",
  },
  {
    title: "Advance",
    note: "run one active range at a time, finish it, then advance to the next chunk in sequence",
    icon: ArrowRight,
    accentClass: "text-[#A78BFA] bg-[#A78BFA]/12 border-[#A78BFA]/16",
    activeClass: "border-[#A78BFA]/20 bg-[#A78BFA]/[0.06]",
  },
  {
    title: "Track",
    note: "keep chunk-aware progress and coverage live while the ordered queue moves forward",
    icon: RotateCcw,
    accentClass: "text-on-surface-alt bg-white/[0.06] border-white/[0.08]",
    activeClass: "border-white/[0.14] bg-white/[0.05]",
  },
];

const balancedFeatures: EngineFeature[] = [
  {
    value: "On pause",
    note: "The chunked engine writes snapshots only when a transfer pauses, not on every tick",
    valueClass: "text-accent",
  },
  {
    value: "Better resume support",
    note: "Ophelia restores the last known slot state and file layout instead of guessing from file length",
    valueClass: "text-secondary",
  },
  {
    value: "Retry, Steal & Hedge",
    note: "Slow workers can retry, and the scheduler can split or race the slow tail when capacity opens up",
    valueClass: "text-[#C4B5FD]",
  },
];

const sequentialFeatures: EngineFeature[] = [
  {
    value: "On pause",
    note: "the same chunked engine writes pause snapshots only when the transfer actually stops",
    valueClass: "text-accent",
  },
  {
    value: "Better resume",
    note: "resume restores the known front-to-back chunk queue instead of dropping to a plain stream",
    valueClass: "text-secondary",
  },
  {
    value: "Front first",
    note: "one active slot keeps early bytes arriving in usable order for file types that benefit from it",
    valueClass: "text-[#C4B5FD]",
  },
];

// THIS MIGHT GIVE YOU A HEART ATTACK
// SORRY ITS JUST EASIER </3
const balancedStates: EngineState[] = [
  {
    speedBars: [8, 9, 11, 13, 16, 19, 23, 26, 29, 31, 33, 34],
    rangeProgress: [14, 0, 0, 0],
    coverage: [
      1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
    recoveryStage: 0,
    activeSteps: [0],
  },
  {
    speedBars: [10, 12, 15, 18, 22, 26, 30, 33, 36, 38, 40, 39],
    rangeProgress: [32, 18, 7, 0],
    coverage: [
      2, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
    recoveryStage: 0,
    activeSteps: [1, 2],
  },
  {
    speedBars: [12, 15, 18, 22, 27, 31, 35, 38, 40, 39, 36, 34],
    rangeProgress: [56, 41, 27, 18],
    coverage: [
      2, 2, 1, 0, 2, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
    recoveryStage: 0,
    activeSteps: [2],
  },
  {
    speedBars: [11, 15, 19, 24, 29, 34, 38, 40, 39, 36, 33, 30],
    rangeProgress: [79, 54, 72, 31],
    coverage: [
      2, 2, 2, 1, 2, 2, 1, 0, 2, 1, 0, 0, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
    recoveryStage: 1,
    activeSteps: [2, 3],
  },
  {
    speedBars: [9, 13, 17, 21, 26, 30, 34, 36, 35, 33, 30, 27],
    rangeProgress: [100, 82, 93, 64],
    coverage: [
      2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 1, 0, 2, 2, 1, 0, 2, 1, 0, 0,
    ],
    recoveryStage: 2,
    activeSteps: [2, 3],
  },
];

const sequentialStates: EngineState[] = [
  {
    speedBars: [7, 8, 10, 12, 15, 18, 20, 21, 22, 22, 21, 20],
    rangeProgress: [18, 0, 0, 0],
    coverage: [
      1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
    recoveryStage: 0,
    activeSteps: [0],
  },
  {
    speedBars: [8, 10, 12, 14, 17, 20, 22, 23, 24, 24, 23, 22],
    rangeProgress: [100, 18, 0, 0],
    coverage: [
      2, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
    recoveryStage: 0,
    activeSteps: [1],
  },
  {
    speedBars: [8, 10, 13, 15, 18, 21, 23, 24, 25, 25, 24, 23],
    rangeProgress: [100, 100, 34, 0],
    coverage: [
      2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
    recoveryStage: 0,
    activeSteps: [2, 3],
  },
  {
    speedBars: [7, 9, 12, 14, 17, 20, 22, 23, 24, 24, 23, 21],
    rangeProgress: [100, 100, 100, 36],
    coverage: [
      2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0,
    ],
    recoveryStage: 0,
    activeSteps: [2, 3],
  },
  {
    speedBars: [6, 8, 11, 13, 16, 19, 21, 22, 22, 21, 20, 19],
    rangeProgress: [100, 100, 100, 82],
    coverage: [
      2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1,
    ],
    recoveryStage: 0,
    activeSteps: [2, 3],
  },
];

const engineModes: Record<ModeId, EngineModeConfig> = {
  balanced: {
    label: "Balanced",
    badgeClass: "border-accent/20 bg-accent/8 text-accent",
    telemetryTitle: "Ramps up toward configured limits",
    telemetryLabel: "Balanced download",
    telemetryNote:
      "starts at one worker, opens more ranges as chunks finish, and uses steal or hedge when the tail slows down",
    panelTitle: "Balanced scheduler",
    panelNote:
      "Ophelia probes the server, builds the queue, ramps workers upward, and corrects the slow tail when capacity opens up.",
    actions: balancedActions,
    features: balancedFeatures,
    states: balancedStates,
  },
  sequential: {
    label: "Sequential",
    badgeClass: "border-[#A78BFA]/20 bg-[#A78BFA]/8 text-[#C4B5FD]",
    telemetryTitle: "Ordered, preview-friendly coverage",
    telemetryLabel: "Sequential download",
    telemetryNote: `Same chunk model as before, but one active range moves from the front of the file to the back.
      This enables incrementally written files (such as .mkv) to be opened while they're downloading`,
    panelTitle: "Sequential scheduler",
    panelNote:
      "Ophelia keeps the chunked executor, but schedules it front-to-back so early bytes arrive in usable order.",
    actions: sequentialActions,
    features: sequentialFeatures,
    states: sequentialStates,
  },
};

const ENGINE_CHART_WIDTH = 128;
const ENGINE_CHART_HEIGHT = 52;
const BAR_WIDTH = 7;
const BAR_GAP = 4;
const ENGINE_GRID_LINES = [10, 26, 42] as const;

const selectedMode = ref<ModeId>("balanced");
const engineFrame = ref(0);

const currentMode = computed(() => engineModes[selectedMode.value]);
const currentEngineState = computed(
  () =>
    currentMode.value.states[
      engineFrame.value % currentMode.value.states.length
    ]!,
);
const activeRecovery = computed(
  () => recoveryTools[currentEngineState.value.recoveryStage]!,
);
const activeSequentialRange = computed(() => {
  const activeIndex = currentEngineState.value.rangeProgress.findIndex(
    (progress) => progress > 0 && progress < 100,
  );
  if (activeIndex !== -1) return activeIndex;
  const pendingIndex = currentEngineState.value.rangeProgress.findIndex(
    (progress) => progress < 100,
  );
  if (pendingIndex !== -1) return pendingIndex;
  return currentEngineState.value.rangeProgress.length - 1;
});

const speedRects = computed(() =>
  currentEngineState.value.speedBars.map((height, index) => ({
    x: index * (BAR_WIDTH + BAR_GAP),
    y: ENGINE_CHART_HEIGHT - height,
    height,
  })),
);

let engineTimer: ReturnType<typeof setInterval> | null = null;

function selectMode(mode: ModeId) {
  if (mode === selectedMode.value) return;
  selectedMode.value = mode;
}

function rangeFillClass(index: number) {
  if (index === 0) return "bg-accent";
  if (index === 1) return "bg-secondary";
  if (index === 2) return "bg-[#A78BFA]";
  return "bg-white/[0.18]";
}

function coverageFillClass(cellState: number) {
  if (cellState === 2) return "bg-accent";
  if (cellState === 1) return "bg-secondary/80";
  return "bg-white/[0.05]";
}

watch(selectedMode, () => {
  engineFrame.value = 0;
});

onMounted(() => {
  engineTimer = setInterval(() => {
    const states = engineModes[selectedMode.value].states;
    engineFrame.value = (engineFrame.value + 1) % states.length;
  }, 1700);
});

onUnmounted(() => {
  if (engineTimer) clearInterval(engineTimer);
});
</script>

<template>
  <section class="relative flex items-center py-24 lg:min-h-[84vh]">
    <div class="mx-auto max-w-6xl px-6">
      <RevealSection>
        <div class="mx-auto mb-10 max-w-3xl text-center">
          <h2 class="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            A faster
            <span class="font-normal text-on-surface-alt">download engine</span>
          </h2>
          <p class="mx-auto mt-5 max-w-2xl text-[16px] leading-7 text-muted-fg">
            not exactly cutting edge; but an optimized Rust engine nonetheless
          </p>
        </div>
      </RevealSection>

      <RevealSection :delay="30">
        <div class="mb-6 flex flex-col items-center gap-4">
          <div
            class="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-surface-card/90 p-1"
          >
            <button
              v-for="mode in modeOrder"
              :key="mode"
              type="button"
              class="rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] transition-all duration-300"
              :class="
                selectedMode === mode
                  ? engineModes[mode].badgeClass
                  : 'text-muted-fg hover:bg-white/[0.04] hover:text-on-surface'
              "
              @click="selectMode(mode)"
            >
              {{ engineModes[mode].label }}
            </button>
          </div>

          <p class="max-w-2xl text-center text-[12px] leading-6 text-muted-fg">
            This demo focuses on Ophelia&apos;s two intended range-aware
            schedulers. Servers without range support or content length still
            fall back to a simpler single-stream path outside this view.
          </p>
        </div>
      </RevealSection>

      <div
        class="grid grid-cols-1 items-stretch gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(420px,0.85fr)]"
      >
        <RevealSection :delay="60">
          <div
            class="flex h-full min-h-[560px] flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-surface-card p-6 sm:p-7"
          >
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div class="mt-1 text-[22px] font-bold tracking-tight">
                  {{ currentMode.telemetryTitle }}
                </div>
                <div class="mt-1 text-[12px] text-on-surface-alt">
                  {{ currentMode.telemetryNote }}
                </div>
              </div>
            </div>

            <div
              class="mt-5 grid flex-1 gap-4 lg:grid-cols-[minmax(0,1fr)_220px]"
            >
              <div
                class="rounded-xl border border-white/[0.06] bg-surface-deep/70 p-4"
              >
                <div
                  class="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-fg"
                >
                  Throughput
                </div>

                <svg
                  class="mt-3 block h-[150px] w-full"
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

                <div class="mt-5 grid gap-2">
                  <div
                    v-for="(
                      progress, index
                    ) in currentEngineState.rangeProgress"
                    :key="index"
                    class="grid grid-cols-[52px_minmax(0,1fr)_34px] items-center gap-2"
                  >
                    <span
                      class="text-[10px] uppercase tracking-[0.18em] text-muted-fg"
                    >
                      Slot {{ index + 1 }}
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

                <div class="mt-5">
                  <div
                    class="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-fg"
                  >
                    Coverage map
                  </div>
                  <div class="mt-3 grid grid-cols-12 gap-1">
                    <div
                      v-for="(cell, index) in currentEngineState.coverage"
                      :key="index"
                      class="h-3 rounded-[4px] transition-all duration-[1400ms] ease-in-out"
                      :class="coverageFillClass(cell)"
                    />
                  </div>
                </div>
              </div>

              <div class="grid gap-3">
                <div
                  v-for="feature in currentMode.features"
                  class="rounded-xl border border-white/[0.06] bg-surface-deep/70 p-4"
                >
                  <div
                    class="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-fg"
                  ></div>
                  <div
                    class="mt-2 text-[22px] font-bold leading-none tracking-tight"
                    :class="feature.valueClass ?? ''"
                  >
                    {{ feature.value }}
                  </div>
                  <div class="mt-1 text-[12px] text-on-surface-alt">
                    {{ feature.note }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </RevealSection>

        <RevealSection :delay="120">
          <div
            class="flex h-full min-h-[560px] flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-surface-card p-6"
          >
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div class="mt-1 text-[22px] font-bold tracking-tight">
                  {{ currentMode.panelTitle }}
                </div>
                <div class="mt-1 text-[12px] text-on-surface-alt">
                  {{ currentMode.panelNote }}
                </div>
              </div>
            </div>

            <div class="mt-5 grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
              <div
                v-for="(action, index) in currentMode.actions"
                :key="action.title"
                class="rounded-2xl border p-5 transition-all duration-[1400ms]"
                :class="
                  currentEngineState.activeSteps.includes(index)
                    ? action.activeClass
                    : 'border-white/[0.07] bg-surface-deep/70'
                "
              >
                <div class="flex items-start justify-between gap-3">
                  <div
                    class="flex h-11 w-11 items-center justify-center rounded-xl border"
                    :class="action.accentClass"
                  >
                    <component :is="action.icon" :size="18" :stroke-width="2" />
                  </div>
                </div>

                <div class="mt-4">
                  <h3 class="text-[17px] font-bold tracking-tight">
                    {{ action.title }}
                  </h3>
                  <p class="mt-1 text-[13px] leading-5 text-on-surface-alt">
                    {{ action.note }}
                  </p>
                  <div
                    v-if="
                      selectedMode === 'balanced' && action.title === 'Recovery'
                    "
                    class="mt-3 inline-flex items-center rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-on-surface-alt"
                  >
                    Now: {{ activeRecovery }}
                  </div>
                  <div
                    v-else-if="
                      selectedMode === 'sequential' &&
                      action.title === 'Advance'
                    "
                    class="mt-3 inline-flex items-center rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-on-surface-alt"
                  >
                    Active slot {{ activeSequentialRange + 1 }}
                  </div>
                </div>

                <div
                  class="mt-5 h-1 overflow-hidden rounded-full bg-white/[0.05]"
                >
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
                      width: currentEngineState.activeSteps.includes(index)
                        ? '100%'
                        : '38%',
                    }"
                  />
                </div>
              </div>
            </div>
          </div>
        </RevealSection>
      </div>
    </div>
  </section>
</template>
