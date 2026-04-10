<script setup lang="ts">
import {
  Download,
  Globe,
  ArrowDown,
  Check,
  ExternalLink,
} from "lucide-vue-next";

const { el, isVisible } = useReveal({ threshold: 0.3 });
// ms
const TIMELINE = { click: 400, popup: 1200, appRow: 2200 } as const;
const PROGRESS_DURATION = 2800;

const MACOS_DOTS = ["#ff5f57", "#febc2e", "#28c840"] as const;

const stage = ref(0);
// 0: browser idle
// 1: click download
// 2: extension catches
// 3: download appears in ophelia
// 4: progress
// 5: done

const progress = ref(0);

watch(isVisible, (visible) => {
  if (!visible) return;

  setTimeout(() => (stage.value = 1), TIMELINE.click);
  setTimeout(() => (stage.value = 2), TIMELINE.popup);
  setTimeout(() => (stage.value = 3), TIMELINE.appRow);
  setTimeout(() => {
    stage.value = 4;
    const start = performance.now();
    // smoothstep easing
    function tick(now: number) {
      const t = Math.min((now - start) / PROGRESS_DURATION, 1);
      const eased = t * t * (3 - 2 * t);
      progress.value = Math.round(eased * 100);
      if (t < 1) requestAnimationFrame(tick);
      else stage.value = 5;
    }
    requestAnimationFrame(tick);
  }, TIMELINE.appRow);
});
</script>

<template>
  <section class="relative py-24">
    <div class="mx-auto max-w-6xl px-6">
      <RevealSection>
        <div class="mx-auto mb-16 max-w-3xl text-center">
          <h2 class="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            It&apos;s the 21st century,
            <span class="font-normal text-on-surface-alt">just ditch IDM</span>
          </h2>
        </div>
      </RevealSection>

      <!-- demo -->
      <RevealSection>
        <div ref="el" class="max-w-3xl mx-auto">
          <!-- mock browser -->
          <div
            class="rounded-t-2xl border border-b-0 border-white/[0.07] overflow-hidden bg-surface-card"
          >
            <!-- Browser toolbar -->
            <div
              class="flex items-center gap-3 px-4 h-11 border-b border-white/[0.07] bg-surface-raised"
            >
              <div class="flex gap-2">
                <div
                  v-for="color in MACOS_DOTS"
                  :key="color"
                  class="w-3 h-3 rounded-full"
                  :style="{ background: color }"
                />
              </div>
              <div class="flex-1 flex items-center justify-center">
                <div
                  class="flex items-center gap-2 px-4 py-1 rounded-md w-full max-w-sm bg-surface-hover/50"
                >
                  <Globe
                    :size="12"
                    :stroke-width="2"
                    class="text-muted-fg shrink-0"
                  />
                  <span class="text-[11px] text-muted-fg truncate"
                    >trustworthy-russian-website-from-fmhy.com/fight-club</span
                  >
                </div>
              </div>
            </div>

            <!-- Browser content -->
            <div class="p-8 min-h-[140px] relative">
              <div class="flex flex-col items-center gap-4">
                <div
                  class="text-[13px] text-muted-fg text-center font-semibold"
                >
                  fight_club_1080p.H264.mkv
                </div>
                <div class="text-[11px] text-muted-fg/60 text-center">
                  487 MB
                </div>

                <!-- Download button - animates on click -->
                <button
                  class="flex items-center gap-2 px-5 py-2 rounded-lg text-[12px] font-bold transition-all duration-300"
                  :class="
                    stage >= 1
                      ? 'bg-accent/20 text-accent scale-95'
                      : 'bg-white/10 text-on-surface hover:bg-white/15'
                  "
                >
                  <ArrowDown :size="14" :stroke-width="2.5" />
                  {{ stage >= 1 ? "Caught by Ophelia" : "Download" }}
                </button>
              </div>

              <!-- Extension popup -->
              <Transition name="popup">
                <div
                  v-if="stage >= 2"
                  class="absolute top-3 right-3 rounded-xl border border-white/[0.07] p-3 w-60 shadow-2xl bg-surface-card"
                >
                  <div class="flex items-center gap-2 mb-2.5">
                    <Wordmark :width="152" class="block" />
                    <span
                      class="text-[9px] px-1.5 py-0.5 rounded-full bg-accent/15 text-accent font-bold ml-auto"
                      >extension</span
                    >
                  </div>
                  <div class="text-[10px] text-muted-fg mb-2 font-semibold">
                    Download intercepted
                  </div>
                  <div
                    class="flex items-center gap-2 px-2 py-1.5 rounded-md border border-white/[0.07] mb-2 bg-surface-raised"
                  >
                    <Download
                      :size="11"
                      :stroke-width="2"
                      class="text-accent shrink-0"
                    />
                    <span class="text-[10px] font-semibold truncate"
                      >fight_club_1080p.H264.mkv</span
                    >
                  </div>
                  <div class="flex gap-2">
                    <button
                      class="flex-1 text-[10px] font-bold py-1 rounded-md bg-accent text-bg"
                    >
                      Download with Ophelia
                    </button>
                    <button
                      class="text-[10px] font-bold py-1 px-2 rounded-md border border-white/[0.07] text-muted-fg"
                    >
                      Skip
                    </button>
                  </div>
                </div>
              </Transition>
            </div>
          </div>

          <!-- Ophelia app row -->
          <Transition name="slide-row">
            <div
              v-if="stage >= 3"
              class="rounded-b-2xl border border-white/[0.07] overflow-hidden bg-surface-deep"
            >
              <div
                class="flex items-center gap-2 px-4 py-2 border-b border-white/[0.07] bg-surface-raised"
              >
                <Wordmark :width="140" class="block" />
                <span class="text-[10px] text-muted-fg ml-2">Downloads</span>
              </div>
              <div class="p-3">
                <div
                  class="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-white/[0.07] bg-surface-card"
                >
                  <Download
                    :size="16"
                    :stroke-width="1.5"
                    class="text-muted-fg shrink-0"
                  />
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between gap-3 mb-1.5">
                      <span class="text-[12px] font-semibold truncate"
                        >Fight Club (1999).mkv</span
                      >
                      <div class="flex items-center gap-3 shrink-0">
                        <span
                          class="text-[10px] text-muted-fg tabular-nums w-8 text-right font-semibold"
                        >
                          {{ stage >= 5 ? "100%" : `${progress}%` }}
                        </span>
                        <span
                          class="text-[10px] text-muted-fg tabular-nums font-semibold"
                          >487 MB</span
                        >
                        <span
                          class="text-[10px] px-2 py-0.5 rounded-full font-semibold transition-all duration-300"
                          :class="
                            stage >= 5
                              ? 'bg-secondary/20 text-secondary'
                              : 'border border-white/[0.07] text-on-surface-alt'
                          "
                        >
                          {{ stage >= 5 ? "finished" : "downloading" }}
                        </span>
                      </div>
                    </div>
                    <div
                      v-if="stage < 5"
                      class="h-1 rounded-full overflow-hidden bg-accent/20"
                    >
                      <div
                        class="h-full rounded-full bg-accent transition-all duration-[2s] ease-out"
                        :style="{ width: `${progress}%` }"
                      />
                    </div>
                  </div>
                  <div v-if="stage >= 5" class="shrink-0">
                    <Check
                      :size="16"
                      :stroke-width="2.5"
                      class="text-secondary"
                    />
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </RevealSection>
    </div>
  </section>
</template>

<style scoped>
.popup-enter-active {
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
.popup-leave-active {
  transition: all 0.2s ease-in;
}
.popup-enter-from {
  opacity: 0;
  transform: translateY(-8px) scale(0.95);
}
.popup-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.slide-row-enter-active {
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-row-leave-active {
  transition: all 0.3s ease-in;
}
.slide-row-enter-from {
  opacity: 0;
  transform: translateY(-12px);
  max-height: 0;
}
.slide-row-enter-to {
  max-height: 200px;
}
.slide-row-leave-to {
  opacity: 0;
}
</style>
