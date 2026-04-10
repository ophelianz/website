<script setup lang="ts">
import { Home, ArrowLeft } from "lucide-vue-next";

const props = defineProps<{
  error: {
    statusCode: number;
    statusMessage?: string;
  };
}>();

const is404 = computed(() => props.error.statusCode === 404);

const router = useRouter();

const handleError = () => clearError({ redirect: "/" });

const goBack = () => {
  clearError();
  router.back();
};
</script>

<template>
  <div
    class="min-h-screen bg-bg text-on-surface flex items-center justify-center px-6"
  >
    <div class="text-center max-w-md">
      <div class="text-8xl sm:text-9xl font-bold tracking-tighter mb-6">
        <span class="text-gradient">{{ error.statusCode }}</span>
      </div>

      <h1 class="text-2xl sm:text-3xl font-bold tracking-tight mb-4">
        <template v-if="is404"> nothing here chief</template>
        <template v-else> something probably broke </template>
      </h1>

      <p
        class="text-on-surface-alt text-[15px] font-medium mb-10 leading-relaxed"
      >
        <template v-if="is404">
          either this page doesn't exist yet or you typed something wrong (no
          judgment)
        </template>
        <template v-else>
          {{ error.statusMessage || "that's on us. probably." }}
        </template>
      </p>

      <div class="flex items-center justify-center gap-4">
        <button
          @click="handleError"
          class="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-bg font-bold text-sm hover:brightness-110 transition-all duration-200"
        >
          <Home :size="16" :stroke-width="2.5" />
          Go home
        </button>

        <button
          @click="goBack"
          class="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-outline text-on-surface-alt text-sm font-bold hover:border-on-surface-alt hover:text-on-surface transition-all duration-200"
        >
          <ArrowLeft :size="16" :stroke-width="2.5" />
          Go back
        </button>
      </div>
    </div>
  </div>
</template>
