<script setup lang="ts">
import { ArrowLeft } from "lucide-vue-next";

const route = useRoute();
const path = computed(
  () =>
    "/devlog/" +
    (Array.isArray(route.params.slug)
      ? route.params.slug.join("/")
      : route.params.slug),
);

const { data: post } = await useAsyncData(`devlog-${path.value}`, () =>
  queryCollection("devlog").path(path.value).first(),
);

if (!post.value) {
  throw createError({ statusCode: 404, statusMessage: "Post not found" });
}

useHead({ title: `${post.value.title} — Ophelia Devlog` })

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
</script>

<template>
  <div class="pt-32 pb-20">
    <div class="max-w-3xl mx-auto px-6">
      <NuxtLink
        to="/devlog"
        class="inline-flex items-center gap-2 text-sm text-on-surface-alt hover:text-on-surface font-semibold mb-10 transition-colors"
      >
        <ArrowLeft :size="16" :stroke-width="2" />
        Back to devlog
      </NuxtLink>

      <article v-if="post">
        <header class="mb-12">
          <h1 class="text-3xl sm:text-4xl font-bold tracking-tight mb-6">
            {{ post.title }}
          </h1>

          <div
            class="flex items-center gap-3 pb-6 border-b border-white/[0.06]"
          >
            <img
              :src="`https://github.com/${post.author.github}.png?size=80`"
              :alt="post.author.name"
              class="w-8 h-8 rounded-full ring-1 ring-white/10"
            />
            <span class="text-[14px] font-semibold">{{
              post.author.name
            }}</span>
            <span class="text-muted-fg">·</span>
            <time class="text-[14px] text-on-surface-alt">{{
              formatDate(post.date)
            }}</time>
            <div class="flex gap-1.5 ml-1">
              <span
                v-for="tag in post.tags"
                :key="tag"
                class="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full border border-outline text-on-surface-alt/60"
              >
                {{ tag }}
              </span>
            </div>
          </div>
        </header>

        <div class="prose-ophelia">
          <ContentRenderer :value="post" />
        </div>
      </article>
    </div>
  </div>
</template>
