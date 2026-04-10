<script setup lang="ts">
import {
  BookOpen,
  Puzzle,
  Zap,
  Globe,
  Settings,
  Package,
} from "lucide-vue-next";

const route = useRoute();
const path = computed(
  () =>
    "/docs/" +
    (Array.isArray(route.params.slug)
      ? route.params.slug.join("/")
      : route.params.slug),
);

// All docs for sidebar
const { data: allDocs } = await useAsyncData("docs-nav", () =>
  queryCollection("docs").order("order", "ASC").all(),
);

// Current doc watch route so it refetches on client-side navigation
const { data: doc } = await useAsyncData(
  () => `doc-${path.value}`,
  () => queryCollection("docs").path(path.value).first(),
  { watch: [path] },
);

if (!doc.value && import.meta.server) {
  throw createError({ statusCode: 404, statusMessage: "Page not found" });
}

useHead(() => ({
  title: doc.value ? `${doc.value.title} — Ophelia Docs` : "Ophelia Docs",
}));

// Section icons
const sectionIcons: Record<string, any> = {
  Basics: BookOpen,
  Plugins: Puzzle,
  Integration: Globe,
};

// Group by section
const sections = computed(() => {
  if (!allDocs.value) return [];
  const map = new Map<string, typeof allDocs.value>();
  for (const d of allDocs.value) {
    const section = d.section || "General";
    if (!map.has(section)) map.set(section, []);
    map.get(section)!.push(d);
  }
  return Array.from(map.entries());
});

// TOC from current doc
const toc = computed(() => doc.value?.body?.toc?.links || []);

// Active heading tracking
const activeId = ref("");

onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          activeId.value = entry.target.id;
        }
      }
    },
    { rootMargin: "-80px 0px -75% 0px", threshold: 0 },
  );

  // Observe all heading elements that match TOC ids
  const headings = document.querySelectorAll(
    ".prose-ophelia h2[id], .prose-ophelia h3[id]",
  );
  headings.forEach((el) => observer.observe(el));

  onUnmounted(() => observer.disconnect());
});
</script>

<template>
  <div class="pt-28 pb-20">
    <div class="max-w-7xl mx-auto px-6 flex gap-10">
      <!-- Left sidebar / table of contents -->
      <aside
        class="hidden lg:block w-56 shrink-0 sticky top-28 self-start max-h-[calc(100vh-8rem)] overflow-y-auto"
      >
        <div class="flex items-center gap-2 mb-6">
          <BookOpen :size="16" :stroke-width="2" class="text-accent" />
          <span
            class="text-[13px] font-bold uppercase tracking-widest text-accent"
            >Docs</span
          >
        </div>

        <nav class="space-y-5">
          <div v-for="[section, docs] in sections" :key="section">
            <div class="flex items-center gap-2 mb-2">
              <component
                :is="sectionIcons[section] || BookOpen"
                :size="12"
                :stroke-width="2.5"
                class="text-muted-fg"
              />
              <h4
                class="text-[11px] font-bold uppercase tracking-widest text-muted-fg"
              >
                {{ section }}
              </h4>
            </div>
            <ul class="space-y-0.5">
              <li v-for="d in docs" :key="d.path">
                <NuxtLink
                  :to="d.path"
                  class="block text-[13px] font-semibold px-3 py-1.5 rounded-md transition-colors duration-150"
                  :class="
                    d.path === doc?.path
                      ? 'bg-accent/10 text-accent'
                      : 'text-on-surface-alt hover:text-on-surface hover:bg-white/[0.03]'
                  "
                >
                  {{ d.title }}
                </NuxtLink>
              </li>
            </ul>
          </div>
        </nav>
      </aside>

      <!-- Content -->
      <main v-if="doc" class="flex-1 min-w-0">
        <header class="mb-8 pb-6 border-b border-white/[0.06]">
          <div
            v-if="doc.section"
            class="text-[11px] font-bold uppercase tracking-widest text-muted-fg mb-2"
          >
            {{ doc.section }}
          </div>
          <h1 class="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
            {{ doc.title }}
          </h1>
          <p class="text-[15px] text-on-surface-alt font-medium">
            {{ doc.description }}
          </p>
        </header>

        <div class="prose-ophelia">
          <ContentRenderer :value="doc" />
        </div>
      </main>

      <!-- Right sidebar on this page -->
      <aside
        v-if="toc.length"
        class="hidden xl:block w-48 shrink-0 sticky top-28 self-start max-h-[calc(100vh-8rem)] overflow-y-auto"
      >
        <h4
          class="text-[11px] font-bold uppercase tracking-widest text-muted-fg mb-3"
        >
          On this page
        </h4>
        <ul class="space-y-1 border-l border-white/[0.06]">
          <li v-for="link in toc" :key="link.id">
            <a
              :href="`#${link.id}`"
              class="block text-[12px] font-medium py-1 transition-colors duration-150 -ml-px border-l"
              :class="[
                link.depth === 3 ? 'pl-6' : 'pl-3',
                activeId === link.id
                  ? 'text-accent border-accent'
                  : 'text-on-surface-alt hover:text-on-surface border-transparent',
              ]"
            >
              {{ link.text }}
            </a>
          </li>
        </ul>
      </aside>
    </div>
  </div>
</template>
