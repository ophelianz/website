<script setup lang="ts">
import { Check } from "lucide-vue-next";

type Status = "completed" | "in-progress" | "planned";

interface Version {
  version: string;
  status: Status;
  subtitle: string;
  items: string[];
}

const versions: Version[] = [
  {
    version: "v0.1.0",
    status: "completed",
    subtitle: "Foundation",
    items: [
      "macOS release",
      "Powerful download engine with work stealing, hedging, chunking and multithreading",
      "Configurable file destinations",
      "yt-dlp and browser extension plugins",
    ],
  },
  {
    version: "v0.2.0",
    status: "in-progress",
    subtitle: "Cross-platform",
    items: [
      "Windows & Linux release",
      "Auto-sort and auto-rename on completion",
      "Plugin settings UI",
    ],
  },
  {
    version: "Future",
    status: "planned",
    subtitle: "Ecosystem",
    items: [
      "Public plugin API for third-party extensions",
      "Plugin marketplace",
      "Remote control via CLI and REST API",
    ],
  },
];

const statusConfig: Record<
  Status,
  { label: string; node: string; pill: string; card: string }
> = {
  completed: {
    label: "Completed",
    node: "bg-white/20 ring-white/10",
    pill: "bg-white/[0.06] text-on-surface-alt",
    card: "border-white/[0.06] opacity-60",
  },
  "in-progress": {
    label: "In progress",
    node: "bg-accent ring-accent/30",
    pill: "bg-accent/10 text-accent",
    card: "border-accent/20",
  },
  planned: {
    label: "Planned",
    node: "bg-white/[0.05] ring-white/[0.07]",
    pill: "bg-white/[0.05] text-muted-fg",
    card: "border-white/[0.06] border-dashed",
  },
};
</script>

<template>
  <div class="relative min-h-screen pt-32 pb-24">
    <div class="max-w-2xl mx-auto px-6">
      <!-- Header -->
      <RevealSection>
        <div class="mb-16">
          <h1 class="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
            Roadmap
          </h1>
          <p class="text-[15px] text-on-surface-alt font-normal">
            These will be possible thanks to your support :)
          </p>
        </div>
      </RevealSection>

      <!-- Timeline -->
      <div class="relative">
        <!-- Spine -->
        <div
          class="absolute left-[11px] top-3 bottom-8 w-px bg-gradient-to-b from-white/[0.12] via-white/[0.06] to-transparent"
        />

        <div
          v-for="(v, vi) in versions"
          :key="v.version"
          class="relative pb-12 last:pb-0"
        >
          <RevealSection :delay="vi * 80">
            <!-- Node -->
            <div
              class="absolute left-0 top-1 z-10 flex h-[23px] w-[23px] items-center justify-center rounded-full ring-4"
              :class="statusConfig[v.status].node"
            >
              <Check
                v-if="v.status === 'completed'"
                :size="11"
                :stroke-width="3"
                class="text-on-surface"
              />
              <div
                v-else-if="v.status === 'in-progress'"
                class="h-2 w-2 rounded-full bg-accent animate-pulse"
              />
              <div v-else class="h-1.5 w-1.5 rounded-full bg-white/20" />
            </div>

            <!-- Content -->
            <div class="ml-11">
              <!-- Version header -->
              <div class="flex items-center gap-3 mb-4">
                <div>
                  <div class="flex items-center gap-2.5">
                    <span class="text-[17px] font-bold tracking-tight">{{
                      v.version
                    }}</span>
                    <span class="text-on-surface-alt font-normal text-[15px]">{{
                      v.subtitle
                    }}</span>
                  </div>
                </div>
                <span
                  class="ml-auto text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0"
                  :class="statusConfig[v.status].pill"
                >
                  {{ statusConfig[v.status].label }}
                </span>
              </div>

              <!-- Items -->
              <div
                class="rounded-xl border overflow-hidden"
                :class="statusConfig[v.status].card"
              >
                <div
                  v-for="(item, ii) in v.items"
                  :key="item"
                  class="flex items-start gap-2.5 px-4 py-3"
                  :class="
                    ii < v.items.length - 1
                      ? 'border-b border-white/[0.04]'
                      : ''
                  "
                >
                  <Check
                    v-if="v.status === 'completed'"
                    :size="13"
                    :stroke-width="2.5"
                    class="text-white/30 shrink-0 mt-0.5"
                  />
                  <div
                    v-else
                    class="mt-[5px] h-1.5 w-1.5 rounded-full shrink-0"
                    :class="
                      v.status === 'in-progress'
                        ? 'bg-accent/50'
                        : 'bg-white/10'
                    "
                  />
                  <span class="text-[13px] font-medium text-on-surface">{{
                    item
                  }}</span>
                </div>
              </div>
            </div>
          </RevealSection>
        </div>
      </div>
    </div>
  </div>
</template>
