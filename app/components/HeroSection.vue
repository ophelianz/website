<script setup lang="ts">
import type { Component } from "vue";
import {
  ArrowRight,
  Pause,
  X,
  Inbox,
  Download,
  HardDrive,
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
const isCompactSidebar = ref(false);

// Layout constants
const SPEED_MAX = 300;
const CHART_W = 100;
const CHART_H = 40;
const CHUNK_COLS = 16;
const CHUNK_ROWS = 8;
const GRID_LINES = [0, 0.5, 1] as const;

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
const currentSpeed = computed(
  () => speedPoints.value[speedPoints.value.length - 1] ?? 0,
);
const finishedTotal = ref(184);
const activeTransfers = ref(3);
const queuedTransfers = ref(6);

const speedDisplay = computed(() => currentSpeed.value.toFixed(1));
const readSpeedDisplay = computed(() => (currentSpeed.value * 0.78).toFixed(1));
const writeSpeedDisplay = computed(() =>
  (currentSpeed.value * 0.41).toFixed(1),
);
const chunkMapItem = computed(
  () =>
    queue.value.find((item) => item.status === "downloading") ?? queue.value[0],
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

const cellThresholds: number[][] = Array.from(
  { length: CHUNK_COLS },
  (_, col) =>
    Array.from(
      { length: CHUNK_ROWS },
      (_, row) => (col + row * 0.35 + Math.random() * 0.45) / CHUNK_COLS,
    ),
);

const PARTIAL_WINDOW = 0.06;

type CellState = "filled" | "partial" | "empty";

function getCellState(col: number, row: number): CellState {
  const threshold = cellThresholds[col]![row]!;
  const normalized = progress.value / 100;
  if (normalized >= threshold) return "filled";
  if (normalized >= threshold - PARTIAL_WINDOW) return "partial";
  return "empty";
}

function cellClass(col: number, row: number) {
  const state = getCellState(col, row);
  if (state === "filled") return "chunk-filled";
  if (state === "partial") return "chunk-partial";
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
let sidebarMedia: MediaQueryList | null = null;
let handleSidebarMediaChange:
  | ((event: MediaQueryList | MediaQueryListEvent) => void)
  | null = null;

function onDownloadComplete() {
  downloadDone.value = true;
  finishedTotal.value += 1;
  activeTransfers.value = 2;
  queuedTransfers.value = 5;
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
  activeTransfers.value = 3;
  queuedTransfers.value = 6;
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
  sidebarMedia = window.matchMedia("(max-width: 699px)");
  handleSidebarMediaChange = (event?: MediaQueryList | MediaQueryListEvent) => {
    isCompactSidebar.value = (event ?? sidebarMedia!).matches;
  };
  handleSidebarMediaChange(sidebarMedia);
  sidebarMedia.addEventListener("change", handleSidebarMediaChange);

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
  if (sidebarMedia && handleSidebarMediaChange) {
    sidebarMedia.removeEventListener("change", handleSidebarMediaChange);
  }
  if (speedTimer) clearInterval(speedTimer);
  if (loopTimeout) clearTimeout(loopTimeout);
});
</script>

<template>
  <section class="relative flex items-center justify-center pt-32 pb-20">
    <div class="mx-auto w-full max-w-[1600px] px-6">
      <div class="mx-auto max-w-4xl text-center">
        <RevealSection :delay="100">
          <h1
            class="mx-auto max-w-3xl text-center text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6"
          >
            Ophelia,
            <span class="text-on-surface-alt font-normal"
              >an extensible download manager.</span
            >
          </h1>
        </RevealSection>
      </div>

      <!-- App mockup -->
      <RevealSection :delay="200">
        <div
          class="mx-auto mt-6 w-full min-[700px]:w-[85vw] max-w-[1360px] overflow-hidden rounded-2xl border border-white/[0.07] bg-surface-deep"
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

          <div class="flex min-w-0">
            <!-- Mini sidebar -->
            <div
              class="shrink-0 border-r border-white/[0.07] bg-surface-raised transition-all duration-300"
              :class="
                isCompactSidebar
                  ? 'w-[56px] px-2 py-4 flex flex-col items-center gap-3'
                  : 'w-[180px] px-4 py-5 flex flex-col gap-4'
              "
            >
              <!-- Logo -->
              <div class="mb-2" :class="isCompactSidebar ? '' : 'px-1'">
                <OpheliaLogo v-if="isCompactSidebar" :size="24" />
                <Wordmark v-else :width="168" class="block" />
              </div>

              <!-- New download btn -->
              <button
                class="rounded-md bg-accent text-bg text-[12px] font-semibold transition-all duration-200"
                :class="
                  isCompactSidebar
                    ? 'flex h-10 w-10 items-center justify-center'
                    : 'flex w-full items-center gap-2 px-3 py-3'
                "
              >
                <Download :size="14" :stroke-width="2.5" />
                <span v-if="!isCompactSidebar">Download</span>
              </button>

              <div
                class="h-px bg-white/[0.07]"
                :class="isCompactSidebar ? 'w-8' : ''"
              />

              <!-- Nav -->
              <div class="flex flex-col gap-0.5">
                <div
                  class="rounded-md text-[12px] font-semibold bg-surface-hover"
                  :class="
                    isCompactSidebar
                      ? 'flex h-10 w-10 items-center justify-center'
                      : 'flex items-center gap-2.5 px-3 py-3'
                  "
                >
                  <Inbox :size="15" :stroke-width="2" />
                  <span v-if="!isCompactSidebar">Downloads</span>
                </div>
                <div
                  class="rounded-md text-[12px] text-muted-fg"
                  :class="
                    isCompactSidebar
                      ? 'flex h-10 w-10 items-center justify-center'
                      : 'flex items-center gap-2.5 px-3 py-3'
                  "
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
                  <span v-if="!isCompactSidebar">History</span>
                </div>
                <div
                  v-if="!isCompactSidebar"
                  class="flex items-center gap-2.5 px-3 py-3 rounded-md text-[12px] text-muted-fg"
                ></div>
              </div>

              <div
                class="h-px bg-white/[0.07]"
                :class="isCompactSidebar ? 'w-8' : ''"
              />

              <!-- Categories -->
              <div class="flex flex-col gap-0.5">
                <div
                  class="rounded-md text-[12px] text-muted-fg"
                  :class="
                    isCompactSidebar
                      ? 'flex h-10 w-10 items-center justify-center'
                      : 'flex items-center gap-2.5 px-3 py-3'
                  "
                >
                  <FolderArchive :size="15" :stroke-width="2" />
                  <span v-if="!isCompactSidebar">Archives</span>
                </div>
                <div
                  class="rounded-md text-[12px] text-muted-fg"
                  :class="
                    isCompactSidebar
                      ? 'flex h-10 w-10 items-center justify-center'
                      : 'flex items-center gap-2.5 px-3 py-3'
                  "
                >
                  <Film :size="15" :stroke-width="2" />
                  <span v-if="!isCompactSidebar">Media</span>
                </div>
                <div
                  class="rounded-md text-[12px] text-muted-fg"
                  :class="
                    isCompactSidebar
                      ? 'flex h-10 w-10 items-center justify-center'
                      : 'flex items-center gap-2.5 px-3 py-3'
                  "
                >
                  <FileText :size="15" :stroke-width="2" />
                  <span v-if="!isCompactSidebar">Documents</span>
                </div>
              </div>

              <!-- Storage card -->
              <div
                class="mt-auto rounded-lg border border-white/[0.07] bg-surface-card"
                :class="isCompactSidebar ? 'w-full px-2 py-2.5' : 'px-3 py-3.5'"
              >
                <div
                  class="mb-1.5 flex items-center gap-1.5"
                  :class="isCompactSidebar ? 'justify-center' : ''"
                >
                  <Database
                    :size="13"
                    :stroke-width="2"
                    class="text-secondary"
                  />
                  <span
                    v-if="!isCompactSidebar"
                    class="text-[11px] text-muted-fg"
                  >
                    Storage
                  </span>
                </div>
                <div
                  v-if="!isCompactSidebar"
                  class="text-[13px] leading-tight mb-0.5"
                >
                  <span class="font-bold">318.5</span>
                  <span class="text-muted-fg font-medium"> / 512 GB</span>
                </div>
                <div
                  v-if="!isCompactSidebar"
                  class="text-[10px] text-muted-fg mb-2"
                >
                  used
                </div>
                <div
                  class="h-1.5 rounded-full overflow-hidden bg-surface-hover"
                  :class="isCompactSidebar ? 'w-full' : ''"
                >
                  <div class="h-full w-[62%] rounded-full bg-secondary" />
                </div>
              </div>
            </div>

            <!-- Main content -->
            <div class="flex-1 px-4 py-4 flex flex-col gap-3 min-w-0">
              <!-- Top row: stats bar + chunk map -->
              <div
                class="grid grid-cols-1 min-[700px]:grid-cols-[minmax(0,1fr)_300px] gap-2.5 items-stretch"
              >
                <div
                  class="rounded-xl border border-white/[0.07] bg-surface-card px-4 py-4"
                >
                  <div class="flex flex-wrap items-start justify-between gap-5">
                    <div class="min-w-[180px] flex-1">
                      <div class="text-[11px] font-light text-muted-fg">
                        Download
                      </div>
                      <div class="mt-1 flex items-end gap-2">
                        <span
                          class="text-[28px] font-extrabold leading-none tabular-nums text-on-surface"
                        >
                          {{ speedDisplay }}
                        </span>
                        <span class="pb-[3px] text-sm font-light text-muted-fg">
                          MB/s
                        </span>
                      </div>
                    </div>

                    <div class="flex min-w-[185px] items-start gap-3">
                      <HardDrive
                        :size="14"
                        :stroke-width="2.2"
                        class="mt-0.5 text-muted-fg"
                      />

                      <div class="flex flex-col gap-1.5">
                        <div class="text-[11px] font-light text-muted-fg">
                          Disk I/O
                        </div>
                        <div class="flex items-start gap-5">
                          <div>
                            <div class="text-[11px] font-light text-muted-fg">
                              Read
                            </div>
                            <div
                              class="mt-0.5 text-[13px] font-light text-on-surface"
                            >
                              {{ readSpeedDisplay }} MB/s
                            </div>
                          </div>
                          <div>
                            <div class="text-[11px] font-light text-muted-fg">
                              Write
                            </div>
                            <div
                              class="mt-0.5 text-[13px] font-light text-on-surface"
                            >
                              {{ writeSpeedDisplay }} MB/s
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <svg
                    class="mt-5 block h-[84px] w-full"
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
                          stop-opacity="0.42"
                        />
                        <stop
                          offset="100%"
                          class="[stop-color:theme(colors.accent)]"
                          stop-opacity="0"
                        />
                      </linearGradient>
                    </defs>

                    <line
                      v-for="fraction in GRID_LINES"
                      :key="fraction"
                      x1="0"
                      :x2="CHART_W"
                      :y1="(CHART_H * fraction).toFixed(2)"
                      :y2="(CHART_H * fraction).toFixed(2)"
                      stroke="rgba(255,255,255,0.08)"
                      stroke-width="0.5"
                    />

                    <path :d="areaPath" fill="url(#speed-grad)" />
                    <path
                      :d="linePath"
                      fill="none"
                      class="stroke-accent"
                      stroke-width="1.8"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      vector-effect="non-scaling-stroke"
                    />
                  </svg>

                  <div
                    class="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1.5"
                  >
                    <div class="flex items-center gap-1.5 text-sm">
                      <span class="font-light text-muted-fg">Active</span>
                      <span class="font-extrabold text-accent">
                        {{ activeTransfers }}
                      </span>
                    </div>
                    <div class="flex items-center gap-1.5 text-sm">
                      <span class="font-light text-muted-fg">Finished</span>
                      <span class="font-extrabold text-secondary">
                        {{ finishedTotal }}
                      </span>
                    </div>
                    <div class="flex items-center gap-1.5 text-sm">
                      <span class="font-light text-muted-fg">Queued</span>
                      <span class="font-extrabold text-[#A78BFA]">
                        {{ queuedTransfers }}
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  class="grid min-w-0 h-full grid-rows-[auto_minmax(0,1fr)_auto] rounded-xl border border-white/[0.07] bg-surface-card px-3 py-3 overflow-hidden"
                >
                  <div class="flex items-center justify-between gap-3">
                    <span class="min-w-0 truncate text-[11px] text-on-surface">
                      {{ chunkMapItem?.name ?? "Chunk map" }}
                    </span>
                    <span class="shrink-0 text-[10px] text-muted-fg">
                      {{ chunkMapItem?.size ?? "—" }}
                    </span>
                  </div>

                  <div
                    class="mt-3 grid min-h-[132px] min-w-0 flex-1 gap-1.5 overflow-hidden"
                    :style="{
                      gridTemplateRows: `repeat(${CHUNK_ROWS}, minmax(0, 1fr))`,
                    }"
                  >
                    <div
                      v-for="row in CHUNK_ROWS"
                      :key="row"
                      class="grid min-h-0 min-w-0 gap-1"
                      :style="{
                        gridTemplateColumns: `repeat(${CHUNK_COLS}, 1fr)`,
                      }"
                    >
                      <div
                        v-for="col in CHUNK_COLS"
                        :key="`${row}-${col}`"
                        class="min-h-0 min-w-0 rounded-[2px] transition-colors duration-300"
                        :class="cellClass(col - 1, row - 1)"
                      />
                    </div>
                  </div>

                  <div
                    class="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-muted-fg"
                  >
                    <div class="flex items-center gap-1.5">
                      <span class="h-2 w-2 rounded-[2px] bg-white/[0.08]" />
                      Empty
                    </div>
                    <div class="flex items-center gap-1.5">
                      <span class="h-2 w-2 rounded-[2px] bg-secondary" />
                      Partial
                    </div>
                    <div class="flex items-center gap-1.5">
                      <span class="h-2 w-2 rounded-[2px] bg-accent" />
                      Complete
                    </div>
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
                      <div class="flex items-center justify-between gap-3 mb-2">
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
  </section>
</template>

<style scoped>
.chunk-filled {
  background: theme("colors.accent");
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.14),
    inset 0 -1px 0 rgba(0, 0, 0, 0.18);
}

.chunk-partial {
  background: theme("colors.secondary");
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.chunk-empty {
  background: rgba(255, 255, 255, 0.08);
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
