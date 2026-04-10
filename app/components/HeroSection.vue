<script setup lang="ts">
import type { Component } from "vue";
import {
  ArrowRight,
  Pause,
  X,
  Inbox,
  Download,
  FileCog,
  FileText,
  Film,
  FolderArchive,
  Music,
  Database,
  Image as ImageIcon,
} from "lucide-vue-next";

const progress = ref(0);
const downloadDone = ref(false);
const mockupEl = ref<HTMLElement | null>(null);

// Layout constants
const SPEED_MAX = 300;
const CHART_W = 100;
const CHART_H = 40;
const CHUNK_COLS = 14;
const CHUNK_ROWS = 6;

// Timing
const CYCLE_DURATION = 7000;
const FINISHED_DELAY = 2000;
const SPEED_INTERVAL = 1000;

// Speed simulation
const SPEED_CONFIG = { base: 120, range: 100, max: 280, noise: 30, decay: 0.5 };

// macOS traffic light colors
const MACOS_DOTS = ["#ff5f57", "#febc2e", "#28c840"] as const;

function generateInitialPoints(): number[] {
  return Array.from({ length: 20 }, (_, i) => Math.round(20 + i * 8));
}

const speedPoints = ref<number[]>(generateInitialPoints());

// exclamation mark because typescript wont stfu about these
const speedDisplay = computed(() =>
  String(Math.round(speedPoints.value[speedPoints.value.length - 1]!)),
);

function valueToChartY(v: number): number {
  return CHART_H - (v / SPEED_MAX) * CHART_H;
}

function buildPath(pts: number[], close: boolean): string {
  const points = pts.map((v, i) => ({
    x: (i / (pts.length - 1)) * CHART_W,
    y: valueToChartY(v),
  }));
  let d = `M ${points[0]!.x.toFixed(1)} ${points[0]!.y.toFixed(1)}`;
  for (let i = 1; i < points.length; i++) {
    const p0 = points[Math.max(0, i - 2)]!;
    const p1 = points[i - 1]!;
    const p2 = points[i]!;
    const p3 = points[Math.min(points.length - 1, i + 1)]!;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  if (close) d += ` L ${CHART_W} ${CHART_H} L 0 ${CHART_H} Z`;
  return d;
}

const linePath = computed(() => buildPath(speedPoints.value, false));
const areaPath = computed(() => buildPath(speedPoints.value, true));

// chunks section
// based on the github contributions animation by @hamedmp
// https://github.com/jaretpeerson/toggleSupply/blob/main/public/scripts/components/githubContributions.js
const cellThresholds: number[][] = Array.from(
  { length: CHUNK_COLS },
  (_, col) =>
    Array.from(
      { length: CHUNK_ROWS },
      () => (col + Math.random()) / CHUNK_COLS,
    ),
);

const PARTIAL_WINDOW = 0.045;

type CellState = "filled" | "partial" | "empty";

function getCellState(col: number, row: number): CellState {
  const t = cellThresholds[col]![row]!;
  const p = progress.value / 100;
  if (p >= t) return "filled";
  if (p >= t - PARTIAL_WINDOW) return "partial";
  return "empty";
}

function cellClass(col: number, row: number): string {
  const s = getCellState(col, row);
  if (s === "filled") return "chunk-filled";
  if (s === "partial") return "chunk-partial";
  return "chunk-empty";
}

// Download queue state machine
type ItemStatus = "downloading" | "queued" | "finished";

interface DownloadItem {
  id: number;
  icon: Component;
  name: string;
  displayName: string;
  size: string;
}

interface QueueItem extends DownloadItem {
  uid: number;
  status: ItemStatus;
}

const allItems: DownloadItem[] = [
  {
    id: 0,
    icon: Film,
    name: "Black.Swan.2010.1080p.BluRay.DDP.5.1.10bit.H.265-iVy.mkv",
    displayName: "Black Swan (2010).mkv",
    size: "1.4 GB",
  },
  {
    id: 1,
    icon: Music,
    name: "02_domingo_de_ramos.flac",
    displayName: "",
    size: "1.2 GB", // beeg music file
  },
  {
    id: 2,
    icon: ImageIcon,
    name: "big-beautiful-tree.png",
    displayName: "",
    size: "1.1 GB",
  },
  {
    id: 3,
    icon: FolderArchive,
    name: "ffmpeg-6.1-src.tar.xz",
    displayName: "",
    size: "1.3 GB",
  },
  {
    id: 4,
    icon: Film,
    name: "fight-club-1080p.H264.mkv",
    displayName: "",
    size: "1.8 GB",
  },
  {
    id: 5,
    icon: Film,
    name: "darknet_diaries_ep155.mp4",
    displayName: "",
    size: "1.5 GB",
  },
  {
    id: 6,
    icon: FileCog,
    name: "arch-2026.04.01-x86_64.iso",
    displayName: "",
    size: "1.1 GB",
  },
  {
    id: 7,
    icon: FileCog,
    name: "ubuntu-24.04-desktop-amd64.iso",
    displayName: "",
    size: "6.8 GB",
  },
];

let uidCounter = 0;
let poolCursor = 0;

function makeItem(status: ItemStatus): QueueItem {
  const src = allItems[poolCursor % allItems.length]!;
  poolCursor++;
  return { uid: uidCounter++, ...src, status };
}

const queue = ref<QueueItem[]>([
  makeItem("downloading"),
  makeItem("queued"),
  makeItem("queued"),
  makeItem("queued"),
]);

let speedTimer: ReturnType<typeof setInterval> | null = null;
let loopTimeout: ReturnType<typeof setTimeout> | null = null;

function onDownloadComplete() {
  downloadDone.value = true;
  // mark front item finished so it shows the finished badge briefly
  queue.value = [
    { ...queue.value[0]!, status: "finished" as ItemStatus },
    ...queue.value.slice(1),
  ];
  loopTimeout = setTimeout(() => {
    // Slide finished item out & add new queued item at bottom
    queue.value = [...queue.value.slice(1), makeItem("queued")];
    startCycle();
  }, FINISHED_DELAY);
}

function startCycle() {
  downloadDone.value = false;
  progress.value = 0;
  // promote front queued item to downloading
  queue.value = [
    { ...queue.value[0]!, status: "downloading" as ItemStatus },
    ...queue.value.slice(1),
  ];

  const duration = CYCLE_DURATION;
  const start = performance.now();

  function tick(now: number) {
    const t = Math.min((now - start) / duration, 1);
    const eased = t < 1 ? t * t * (3 - 2 * t) : 1;
    progress.value = Math.round(eased * 100);
    if (t < 1) requestAnimationFrame(tick);
    else onDownloadComplete();
  }

  requestAnimationFrame(tick);
}

onMounted(() => {
  if (mockupEl.value) {
    const w = mockupEl.value.offsetWidth;
    mockupEl.value.style.width = `${w}px`;
  }

  startCycle();

  speedTimer = setInterval(() => {
    const last = speedPoints.value[speedPoints.value.length - 1]!;
    let next: number;
    if (downloadDone.value) {
      next = last * SPEED_CONFIG.decay;
      if (next < 2) next = 0;
    } else {
      const target =
        SPEED_CONFIG.base + SPEED_CONFIG.range * (progress.value / 100);
      next = Math.max(
        10,
        Math.min(
          SPEED_CONFIG.max,
          target + (Math.random() - 0.5) * SPEED_CONFIG.noise,
        ),
      );
    }
    speedPoints.value = [...speedPoints.value.slice(1), +next.toFixed(2)];
  }, SPEED_INTERVAL);
});

onUnmounted(() => {
  if (speedTimer) clearInterval(speedTimer);
  if (loopTimeout) clearTimeout(loopTimeout);
});
</script>

<template>
  <section class="relative flex items-center justify-center pt-32 pb-20">
    <div class="max-w-7xl mx-auto px-6 w-full">
      <div
        class="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-12 lg:gap-16 items-start"
      >
        <!-- Hero copy -->
        <div>
          <RevealSection>
            <div
              class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-outline text-xs font-bold text-on-surface-alt mb-8"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              alpha / v0.1.0
            </div>
          </RevealSection>

          <RevealSection :delay="100">
            <h1
              class="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6"
            >
              Ophelia,<br />
              <span class="text-on-surface-alt font-normal"
                >an extensible download manager.</span
              >
            </h1>
          </RevealSection>

          <RevealSection :delay="200">
            <p
              class="text-lg text-on-surface-alt max-w-md mb-8 leading-relaxed font-normal"
            >
              Ophelia is rapidly developing, you can help out for free!
            </p>
          </RevealSection>

          <RevealSection :delay="300">
            <div class="flex flex-col gap-3">
              <a
                href="https://github.com/ophelianz/ophelia/discussions/categories/feature-requests"
                target="_blank"
                rel="noopener"
                class="inline-flex items-center gap-2 text-[14px] text-on-surface-alt hover:text-on-surface transition-colors duration-200 group"
              >
                <ArrowRight
                  :size="13"
                  :stroke-width="2"
                  class="group-hover:translate-x-0.5 transition-transform duration-200"
                />
                Suggest Feedback
              </a>
              <a
                href="https://github.com/ophelianz/ophelia/issues/new/choose"
                target="_blank"
                rel="noopener"
                class="inline-flex items-center gap-2 text-[14px] text-on-surface-alt hover:text-on-surface transition-colors duration-200 group"
              >
                <ArrowRight
                  :size="13"
                  :stroke-width="2"
                  class="group-hover:translate-x-0.5 transition-transform duration-200"
                />
                Report a Bug
              </a>
            </div>
          </RevealSection>
        </div>

        <!-- App mockup -->
        <RevealSection :delay="200">
          <div
            ref="mockupEl"
            class="rounded-2xl overflow-hidden border border-white/[0.07] ml-auto bg-surface-deep"
          >
            <!-- Titlebar -->
            <div
              class="flex items-center h-12 px-4 border-b border-white/[0.07] bg-surface-raised"
            >
              <div class="flex gap-2">
                <div
                  v-for="color in MACOS_DOTS"
                  :key="color"
                  class="w-3.5 h-3.5 rounded-full"
                  :style="{ background: color }"
                />
              </div>
              <div class="flex-1 flex justify-center">
                <div
                  class="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-surface-hover/40"
                >
                  <svg
                    class="w-3.5 h-3.5 text-muted-fg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" stroke-linecap="round" />
                  </svg>
                  <span class="text-[12px] text-muted-fg"
                    >Search downloads...</span
                  >
                </div>
              </div>
            </div>

            <div class="flex">
              <!-- Mini sidebar -->
              <div
                class="w-[180px] shrink-0 border-r border-white/[0.07] px-4 py-5 flex flex-col gap-4 bg-surface-raised"
              >
                <!-- Logo -->
                <div class="px-1 mb-2">
                  <Wordmark :width="168" class="block" />
                </div>

                <!-- New download btn -->
                <button
                  class="flex items-center gap-2 w-full px-3 py-3 rounded-md bg-accent text-bg text-[12px] font-semibold"
                >
                  <Download :size="14" :stroke-width="2.5" />
                  Add Download
                </button>

                <div class="h-px bg-white/[0.07]" />

                <!-- Nav -->
                <div class="flex flex-col gap-0.5">
                  <div
                    class="flex items-center gap-2.5 px-3 py-3 rounded-md text-[12px] font-semibold bg-surface-hover"
                  >
                    <Inbox :size="15" :stroke-width="2" />
                    Downloads
                  </div>
                  <div
                    class="flex items-center gap-2.5 px-3 py-3 rounded-md text-[12px] text-muted-fg"
                  >
                    <svg
                      class="w-[15px] h-[15px]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline
                        points="12 6 12 12 16 14"
                        stroke-linecap="round"
                      />
                    </svg>
                    History
                  </div>
                  <div
                    class="flex items-center gap-2.5 px-3 py-3 rounded-md text-[12px] text-muted-fg"
                  ></div>
                </div>

                <div class="h-px bg-white/[0.07]" />

                <!-- Categories -->
                <div class="flex flex-col gap-0.5">
                  <div
                    class="flex items-center gap-2.5 px-3 py-3 rounded-md text-[12px] text-muted-fg"
                  >
                    <FolderArchive :size="15" :stroke-width="2" />
                    Archives
                  </div>
                  <div
                    class="flex items-center gap-2.5 px-3 py-3 rounded-md text-[12px] text-muted-fg"
                  >
                    <Film :size="15" :stroke-width="2" />
                    Media
                  </div>
                  <div
                    class="flex items-center gap-2.5 px-3 py-3 rounded-md text-[12px] text-muted-fg"
                  >
                    <FileText :size="15" :stroke-width="2" />
                    Documents
                  </div>
                </div>

                <!-- Storage card -->
                <div
                  class="mt-auto rounded-lg px-3 py-3.5 border border-white/[0.07] bg-surface-card"
                >
                  <div class="flex items-center gap-1.5 mb-1.5">
                    <Database
                      :size="13"
                      :stroke-width="2"
                      class="text-secondary"
                    />
                    <span class="text-[11px] text-muted-fg">Storage</span>
                  </div>
                  <div class="text-[13px] leading-tight mb-0.5">
                    <span class="font-bold">318.5</span>
                    <span class="text-muted-fg font-medium"> / 512 GB</span>
                  </div>
                  <div class="text-[10px] text-muted-fg mb-2">used</div>
                  <div
                    class="h-1.5 rounded-full overflow-hidden bg-surface-hover"
                  >
                    <div class="h-full w-[62%] rounded-full bg-secondary" />
                  </div>
                </div>
              </div>

              <!-- Main content -->
              <div class="flex-1 px-4 py-4 flex flex-col gap-3 min-w-0">
                <!-- Top row: Speed chart + Chunk map -->
                <div class="grid grid-cols-2 gap-2.5">
                  <!-- Download speed area chart -->
                  <div
                    class="rounded-lg border border-white/[0.07] overflow-hidden bg-surface-card"
                  >
                    <div class="px-3 pt-2.5 pb-0">
                      <div class="flex items-baseline gap-1.5">
                        <span
                          class="text-[18px] font-bold tabular-nums text-accent leading-none"
                          >{{ speedDisplay }}</span
                        >
                        <span class="text-[10px] text-muted-fg">MB/s</span>
                      </div>
                    </div>
                    <svg
                      class="w-full h-[54px] mt-1"
                      preserveAspectRatio="none"
                      viewBox="0 0 100 40"
                    >
                      <defs>
                        <linearGradient
                          id="speed-grad"
                          gradientUnits="userSpaceOnUse"
                          x1="0"
                          y1="-2"
                          x2="0"
                          :y2="CHART_H + 10"
                        >
                          <stop
                            offset="0%"
                            class="[stop-color:theme(colors.accent)]"
                            stop-opacity="0.48"
                          />
                          <stop
                            offset="58%"
                            class="[stop-color:theme(colors.accent)]"
                            stop-opacity="0.18"
                          />
                          <stop
                            offset="100%"
                            class="[stop-color:theme(colors.accent)]"
                            stop-opacity="0"
                          />
                        </linearGradient>
                      </defs>
                      <path :d="areaPath" fill="url(#speed-grad)" />
                      <path
                        :d="linePath"
                        fill="none"
                        class="stroke-accent"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        vector-effect="non-scaling-stroke"
                      />
                    </svg>
                  </div>

                  <!-- Chunk map -->
                  <div
                    class="rounded-lg border border-white/[0.07] bg-surface-card p-2.5"
                  >
                    <!--div class="flex items-center justify-between mb-2"></div>-->
                    <div
                      class="grid gap-[2.5px]"
                      :style="{
                        gridTemplateColumns: `repeat(${CHUNK_COLS}, 1fr)`,
                      }"
                    >
                      <div
                        v-for="i in CHUNK_COLS * CHUNK_ROWS"
                        :key="i"
                        class="rounded-[3px] aspect-square transition-colors duration-300"
                        :class="
                          cellClass(
                            (i - 1) % CHUNK_COLS,
                            Math.floor((i - 1) / CHUNK_COLS),
                          )
                        "
                      />
                    </div>
                  </div>
                </div>

                <!-- Section header -->
                <div class="flex items-center justify-between px-1">
                  <span
                    class="text-[11px] uppercase tracking-widest text-muted-fg font-semibold"
                    >Recent</span
                  >
                  <button
                    class="text-[11px] text-muted-fg hover:text-on-surface-alt"
                  >
                    Clear
                  </button>
                </div>

                <!-- Download rows -->
                <TransitionGroup
                  name="dl"
                  tag="div"
                  class="relative flex flex-col gap-2 overflow-hidden"
                >
                  <div
                    v-for="item in queue"
                    :key="item.uid"
                    class="flex items-center gap-3.5 px-4 py-3.5 rounded-lg border border-white/[0.07] bg-surface-card transition-opacity duration-500"
                    :class="item.status === 'finished' ? 'opacity-40' : ''"
                  >
                    <component
                      :is="item.icon"
                      :size="18"
                      :stroke-width="1.5"
                      class="text-muted-fg shrink-0"
                    />

                    <!-- Downloading: progress bar row -->
                    <template v-if="item.status === 'downloading'">
                      <div class="flex-1 min-w-0">
                        <div
                          class="flex items-center justify-between gap-3 mb-2"
                        >
                          <span class="text-[13px] font-semibold truncate">{{
                            item.name
                          }}</span>
                          <div class="flex items-center gap-3 shrink-0">
                            <span
                              class="text-[11px] text-muted-fg tabular-nums w-8 text-right"
                              >{{ progress }}%</span
                            >
                            <span
                              class="text-[11px] text-muted-fg tabular-nums"
                              >{{ item.size }}</span
                            >
                            <span
                              class="text-[11px] px-2.5 py-0.5 rounded-full font-semibold border border-white/[0.07] text-on-surface-alt"
                              >downloading</span
                            >
                          </div>
                        </div>
                        <div
                          class="h-1.5 rounded-full overflow-hidden bg-accent/20"
                        >
                          <div
                            class="h-full rounded-full bg-accent"
                            :style="{
                              width: `${progress}%`,
                              transition: 'width 80ms linear',
                            }"
                          />
                        </div>
                      </div>
                      <div
                        class="flex items-center gap-1.5 shrink-0 pointer-events-none"
                      >
                        <div
                          class="w-7 h-7 flex items-center justify-center rounded text-muted-fg"
                        >
                          <Pause :size="14" :stroke-width="2.5" />
                        </div>
                        <div
                          class="w-7 h-7 flex items-center justify-center rounded text-muted-fg"
                        >
                          <X :size="14" :stroke-width="2.5" />
                        </div>
                      </div>
                    </template>

                    <!-- Queued / finished: simple row -->
                    <template v-else>
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center justify-between gap-3">
                          <span class="text-[13px] font-semibold truncate">{{
                            item.status === "finished" && item.displayName
                              ? item.displayName
                              : item.name
                          }}</span>
                          <div class="flex items-center gap-3 shrink-0">
                            <span
                              v-if="item.status === 'queued'"
                              class="text-[11px] text-muted-fg tabular-nums w-8 text-right"
                              >···</span
                            >
                            <span
                              class="text-[11px] text-muted-fg tabular-nums"
                              >{{ item.size }}</span
                            >
                            <span
                              class="text-[11px] px-2.5 py-0.5 rounded-full font-semibold"
                              :class="
                                item.status === 'queued'
                                  ? 'border border-white/[0.07] text-on-surface-alt'
                                  : 'bg-secondary/20 text-secondary'
                              "
                              >{{ item.status }}</span
                            >
                          </div>
                        </div>
                      </div>
                      <div
                        v-if="item.status === 'queued'"
                        class="flex items-center gap-1.5 shrink-0"
                      >
                        <button
                          aria-label="Remove from queue"
                          class="w-7 h-7 flex items-center justify-center rounded text-muted-fg hover:text-destructive"
                        >
                          <X :size="14" :stroke-width="2.5" />
                        </button>
                      </div>
                    </template>
                  </div>
                </TransitionGroup>
              </div>
            </div>
          </div>
        </RevealSection>
      </div>
    </div>
  </section>
</template>

<style scoped>
.chunk-filled {
  background: theme("colors.accent");
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.13),
    inset 0 -1px 0 rgba(0, 0, 0, 0.16);
}
.chunk-partial {
  background: theme("colors.secondary");
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
}
.chunk-empty {
  background: theme("colors.on-surface / 0.04");
}

.dl-enter-active,
.dl-leave-active {
  transition:
    opacity 0.35s ease,
    transform 0.35s ease;
}
.dl-enter-from {
  opacity: 0;
  transform: translateY(5px);
}
.dl-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}
.dl-leave-active {
  position: absolute;
  width: 100%;
}
.dl-move {
  transition: transform 0.4s ease;
}
</style>
