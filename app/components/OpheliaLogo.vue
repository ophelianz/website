<script setup lang="ts">
defineProps<{
  size?: number;
}>();
</script>

<template>
  <svg :width="size ?? 24" :height="size ?? 24" viewBox="0 0 24 24" fill="none">
    <path
      fill-rule="evenodd"
      d="M12 3 A9 9 0 1 0 12 21 A9 9 0 1 0 12 3 Z M15 4.5 A7.5 7.5 0 1 0 15 19.5 A7.5 7.5 0 1 0 15 4.5 Z"
      fill="oklch(0.75 0.15 145)"
    />
    <circle
      cx="15"
      cy="12"
      r="1.5"
      fill="oklch(0.75 0.15 145)"
      opacity="0.45"
    />
  </svg>
</template>
