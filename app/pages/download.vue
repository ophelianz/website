<script setup lang="ts">
import { ArrowRight, Download, ExternalLink } from "lucide-vue-next";

useHead({ title: "Download — Ophelia" });

type BuildArch = "arm64" | "x86_64";
type ReleaseChannel = "stable" | "nightly";

const macBuilds = [
  {
    key: "arm64" as BuildArch,
    icon: "simple-icons:apple",
    label: "Apple Silicon",
    detail: "macOS 13 Ventura or later",
    asset: "Ophelia-macos-arm64.dmg",
  },
  {
    key: "x86_64" as BuildArch,
    icon: "lucide:cpu",
    label: "Intel",
    detail: "macOS 13 Ventura or later",
    asset: "Ophelia-macos-x86_64.dmg",
  },
] as const;

const releaseChannels = [
  { key: "stable" as ReleaseChannel, label: "Stable" },
  { key: "nightly" as ReleaseChannel, label: "Nightly" },
] as const;

const upcomingPlatforms = [
  {
    label: "Windows",
    icon: "simple-icons:windows11",
  },
  {
    label: "Linux",
    icon: "simple-icons:linux",
  },
] as const;

const browsers = [
  {
    label: "Chrome",
    icon: "simple-icons:googlechrome",
    href: "https://github.com/ophelianz/ophelia",
  },
  {
    label: "Firefox",
    icon: "simple-icons:firefox",
    href: "https://github.com/ophelianz/ophelia",
  },
] as const;

const detectedBuild = ref<BuildArch | null>(null);
const selectedChannel = ref<ReleaseChannel>("stable");

const detectedBuildLabel = computed(() => {
  const build = macBuilds.find((entry) => entry.key === detectedBuild.value);
  return build?.label ?? null;
});

function buildDownloadUrl(asset: string, channel: ReleaseChannel) {
  if (channel === "nightly") {
    return `https://github.com/ophelianz/ophelia/releases/download/nightly/${asset}`;
  }

  return `https://github.com/ophelianz/ophelia/releases/latest/download/${asset}`;
}

function detectMacBuild(): BuildArch | null {
  if (!import.meta.client) return null;

  const nav = navigator as Navigator & {
    userAgentData?: { platform?: string; architecture?: string };
  };
  const ua = nav.userAgent.toLowerCase();
  const platform = nav.platform?.toLowerCase() ?? "";
  const userAgentPlatform = nav.userAgentData?.platform?.toLowerCase() ?? "";
  const architecture = nav.userAgentData?.architecture?.toLowerCase() ?? "";
  const isMac =
    platform.includes("mac") ||
    ua.includes("mac os x") ||
    userAgentPlatform === "macos";

  if (!isMac) return null;

  if (architecture.includes("arm")) return "arm64";
  if (architecture.includes("x86") || architecture.includes("intel"))
    return "x86_64";
  if (
    ua.includes("arm64") ||
    ua.includes("aarch64") ||
    ua.includes("apple silicon")
  ) {
    return "arm64";
  }
  if (ua.includes("x86_64")) return "x86_64";

  return null;
}

onMounted(() => {
  detectedBuild.value = detectMacBuild();
});
</script>

<template>
  <section
    class="relative overflow-hidden pb-12 pt-32 sm:pb-14 sm:pt-36 lg:pt-40"
  >
    <div class="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        class="absolute left-1/2 top-14 h-64 w-64 -translate-x-[120%] rounded-full bg-accent/10 blur-3xl"
      />
      <div
        class="absolute right-1/2 top-20 h-64 w-64 translate-x-[120%] rounded-full bg-[#7AB8FF]/10 blur-3xl"
      />
    </div>

    <div class="relative mx-auto max-w-6xl px-6">
      <RevealSection>
        <div class="mx-auto max-w-2xl text-center">
          <h1
            class="text-4xl font-bold tracking-tight sm:text-5xl lg:text-[3.5rem]"
          >
            Download
            <span class="font-normal text-on-surface-alt">Ophelia</span>
          </h1>
          <p class="mt-2 text-[13px] leading-5 text-on-surface-alt">
            Only macOS but Windows & Linux should be available in no time :)
          </p>
        </div>
      </RevealSection>

      <div class="mt-8 grid gap-4 lg:grid-cols-2">
        <RevealSection :delay="40">
          <div
            class="relative h-full overflow-hidden rounded-3xl border border-white/[0.08] bg-[#060607] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:p-6"
          >
            <div
              class="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.03] via-transparent to-accent/[0.03]"
            />
            <div
              class="pointer-events-none absolute -right-10 top-0 h-40 w-40 rounded-full bg-accent/8 blur-3xl"
            />

            <div class="relative flex items-start justify-between gap-3">
              <div>
                <h2
                  class="mt-2 text-2xl font-bold tracking-tight sm:text-[2rem]"
                >
                  1. Install
                </h2>
                <div
                  class="mt-3 inline-flex rounded-2xl border border-white/[0.09] bg-black/45 p-1"
                >
                  <button
                    v-for="channel in releaseChannels"
                    :key="channel.key"
                    type="button"
                    class="rounded-xl px-3 py-2 text-[12px] font-semibold transition-colors"
                    :class="
                      selectedChannel === channel.key
                        ? 'bg-white/[0.08] text-on-surface'
                        : 'text-on-surface-alt hover:text-on-surface'
                    "
                    @click="selectedChannel = channel.key"
                  >
                    {{ channel.label }}
                  </button>
                </div>
              </div>
              <a
                href="https://github.com/ophelianz/ophelia/releases"
                target="_blank"
                rel="noopener"
                class="inline-flex shrink-0 items-center gap-2 rounded-full border border-white/[0.09] bg-black/40 px-3 py-2 text-[12px] font-semibold text-on-surface transition-colors hover:text-accent"
              >
                Releases
                <ExternalLink :size="12" :stroke-width="2.2" />
              </a>
            </div>

            <div class="mt-5 flex flex-wrap items-center gap-2">
              <span
                v-if="detectedBuildLabel"
                class="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-accent"
              >
                Recommended: {{ detectedBuildLabel }}
              </span>
            </div>

            <div class="mt-4 grid gap-3 sm:grid-cols-2">
              <div
                v-for="build in macBuilds"
                :key="build.label"
                class="group relative overflow-hidden rounded-2xl border p-4 transition-all duration-300 hover:-translate-y-1"
                :class="
                  build.key === detectedBuild
                    ? 'border-accent/25 bg-gradient-to-br from-accent/[0.14] via-black/80 to-black/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]'
                    : 'border-white/[0.09] bg-gradient-to-br from-white/[0.04] via-black/80 to-black/95 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]'
                "
              >
                <div
                  class="pointer-events-none absolute right-0 top-0 h-24 w-24 rounded-full blur-3xl"
                  :class="
                    build.key === 'arm64' ? 'bg-accent/10' : 'bg-[#7AB8FF]/10'
                  "
                />

                <div class="relative flex items-start gap-3">
                  <div
                    class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.09] bg-black/45"
                  >
                    <Icon :name="build.icon" class="text-[18px]" />
                  </div>

                  <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-2">
                      <div class="text-[18px] font-bold tracking-tight">
                        {{ build.label }}
                      </div>
                      <span
                        v-if="build.key === detectedBuild"
                        class="rounded-full border border-accent/20 bg-accent/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-accent"
                      >
                        This Mac
                      </span>
                    </div>
                    <div class="mt-1 text-[12px] leading-5 text-on-surface-alt">
                      {{ build.detail }}
                    </div>

                    <div class="mt-4">
                      <a
                        :href="buildDownloadUrl(build.asset, selectedChannel)"
                        class="flex w-full items-center justify-between rounded-xl bg-accent px-4 py-3 text-[13px] font-bold text-bg transition-all duration-200 hover:brightness-110"
                      >
                        <span class="flex items-center gap-2">
                          <Icon :name="build.icon" class="text-[13px]" />
                          DMG
                        </span>
                        <ArrowRight :size="16" :stroke-width="2.6" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="mt-4 grid gap-3 sm:grid-cols-2">
              <div
                v-for="platform in upcomingPlatforms"
                :key="platform.label"
                class="flex items-center gap-3 rounded-2xl border border-dashed border-white/[0.09] bg-black/35 p-4 opacity-85"
              >
                <div
                  class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.09] bg-black/45 text-on-surface-alt"
                >
                  <Icon :name="platform.icon" class="text-[18px]" />
                </div>

                <div class="min-w-0 flex-1">
                  <div
                    class="text-[16px] font-bold tracking-tight text-on-surface"
                  >
                    {{ platform.label }}
                  </div>
                  <div
                    class="mt-1 text-[12px] uppercase tracking-[0.16em] text-on-surface-alt"
                  >
                    Coming soon
                  </div>
                </div>
              </div>
            </div>
          </div>
        </RevealSection>

        <RevealSection :delay="120">
          <div
            class="relative h-full overflow-hidden rounded-3xl border border-white/[0.08] bg-[#060607] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:p-6"
          >
            <div
              class="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.03] via-transparent to-[#7AB8FF]/[0.04]"
            />
            <div
              class="pointer-events-none absolute -left-10 top-6 h-40 w-40 rounded-full bg-[#7AB8FF]/8 blur-3xl"
            />

            <h2 class="mt-2 text-2xl font-bold tracking-tight sm:text-[2rem]">
              2. Get Extension
            </h2>
            <div class="relative mt-5 grid gap-3">
              <a
                v-for="browser in browsers"
                :key="browser.label"
                :href="browser.href"
                target="_blank"
                rel="noopener"
                class="group relative overflow-hidden rounded-2xl border border-white/[0.09] bg-gradient-to-br from-white/[0.04] via-black/80 to-black/95 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-white/[0.16]"
              >
                <div
                  class="pointer-events-none absolute right-0 top-0 h-24 w-24 rounded-full bg-white/[0.05] blur-3xl"
                />

                <div class="relative flex items-start gap-3">
                  <div
                    class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.09] bg-black/45"
                  >
                    <Icon :name="browser.icon" class="text-[18px]" />
                  </div>

                  <div class="min-w-0 flex-1">
                    <div class="text-[18px] font-bold tracking-tight">
                      {{ browser.label }}
                    </div>
                    <div class="mt-4">
                      <span
                        class="inline-flex items-center gap-2 rounded-xl border border-white/[0.09] bg-black/45 px-3.5 py-2 text-[13px] font-semibold text-on-surface transition-colors group-hover:text-accent"
                      >
                        Open link
                        <ExternalLink :size="13" :stroke-width="2.2" />
                      </span>
                    </div>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </RevealSection>
      </div>
    </div>
  </section>
</template>
