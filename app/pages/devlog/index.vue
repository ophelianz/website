<script setup lang="ts">
import { Github } from "lucide-vue-next";

useHead({ title: "Devlog — Ophelia" });

const { data: posts } = await useAsyncData("devlog-list", () =>
  queryCollection("devlog").order("date", "DESC").all(),
);

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
</script>

<template>
  <div class="pt-32 pb-20">
    <div class="max-w-3xl mx-auto px-6">
      <RevealSection>
        <div class="mb-16">
          <p
            class="text-xs uppercase tracking-widest text-accent mb-4 font-bold"
          >
            Devlog
          </p>
          <h1 class="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            Hi guys<br />
            <span class="text-on-surface-alt">:3</span>
          </h1>
          <p
            class="text-on-surface-alt text-lg max-w-md leading-relaxed font-semibold"
          >
            I'll (try to) post updates here as I work on this project
          </p>
        </div>
      </RevealSection>

      <div v-if="posts" class="space-y-2">
        <RevealSection
          v-for="(post, i) in posts"
          :key="post.path"
          :delay="i * 60"
        >
          <NuxtLink :to="post.path">
            <article
              class="group rounded-xl p-6 -mx-2 hover:bg-white/[0.02] transition-colors duration-200 cursor-pointer border border-transparent hover:border-white/[0.04]"
            >
              <div class="flex items-start justify-between gap-4 mb-3">
                <!-- Author + date -->
                <div class="flex items-center gap-3">
                  <img
                    :src="`https://github.com/${post.author.github}.png?size=64`"
                    :alt="post.author.name"
                    class="w-7 h-7 rounded-full ring-1 ring-white/10"
                  />
                  <div class="flex items-center gap-2">
                    <span class="text-[13px] font-bold">{{
                      post.author.name
                    }}</span>
                    <a
                      :href="`https://github.com/${post.author.github}`"
                      target="_blank"
                      rel="noopener"
                      class="inline-flex items-center text-muted-fg hover:text-on-surface-alt transition-colors"
                      @click.stop
                    >
                      <Github :size="13" :stroke-width="2.5" />
                    </a>
                    <span class="text-muted-fg text-[13px]">&middot;</span>
                    <time class="text-[13px] text-muted-fg font-mono">
                      {{ formatDate(post.date) }}
                    </time>
                  </div>
                </div>

                <!-- Tags -->
                <div class="flex gap-2 shrink-0">
                  <span
                    v-for="tag in post.tags"
                    :key="tag"
                    class="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full border border-outline text-on-surface-alt/60"
                  >
                    {{ tag }}
                  </span>
                </div>
              </div>

              <h2
                class="text-xl font-bold tracking-tight mb-2 group-hover:text-accent transition-colors duration-200"
              >
                {{ post.title }}
              </h2>
              <p
                class="text-[15px] text-on-surface-alt leading-relaxed font-medium"
              >
                {{ post.summary }}
              </p>
            </article>
          </NuxtLink>
        </RevealSection>
      </div>
    </div>
  </div>
</template>
