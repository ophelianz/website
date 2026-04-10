<script setup lang="ts">
import { Download, Github } from "lucide-vue-next";
</script>

<template>
  <section class="py-32 relative">
    <div class="max-w-6xl mx-auto px-6">
      <RevealSection>
        <div class="text-center">
          <h2
            class="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6"
          >
            Made with &lt;3<br />
            <span class="text-gradient">in GPUI</span>
          </h2>
          <p
            class="text-on-surface-alt text-lg max-w-lg mx-auto mb-10 leading-relaxed font-normal"
          >
            This website is open source too!
            <a
              href="https://github.com/ophelianz/website"
              class="font-bold tracking-tight mb-2 group-hover:text-accent"
              >you can view the repo here</a
            >
          </p>
          <div class="flex items-center justify-center gap-4 flex-wrap">
            <a
              href="https://github.com/ophelianz/ophelia"
              class="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-accent text-bg font-bold text-sm hover:brightness-110 transition-all duration-200"
            >
              <Download :size="16" :stroke-width="2.5" />
              Download v0.1.0
            </a>
            <a
              href="https://github.com/ophelianz/ophelia"
              target="_blank"
              rel="noopener"
              class="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl border border-outline text-on-surface-alt text-sm font-bold hover:border-on-surface-alt hover:text-on-surface transition-all duration-200"
            >
              <Github :size="16" :stroke-width="2.5" />
              GitHub
            </a>
          </div>
        </div>
      </RevealSection>
    </div>
  </section>
</template>
