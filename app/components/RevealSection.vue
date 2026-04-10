<script setup lang="ts">
const props = defineProps<{
  delay?: number;
  direction?: "up" | "left" | "right";
}>();

const { el, isVisible } = useReveal();

const transformOrigin = computed(() => {
  switch (props.direction) {
    case "left":
      return "translateX(-32px)";
    case "right":
      return "translateX(32px)";
    default:
      return "translateY(32px)";
  }
});
</script>

<template>
  <div
    ref="el"
    class="transition-all duration-700 ease-out"
    :style="{
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translate(0, 0)' : transformOrigin,
      transitionDelay: `${delay ?? 0}ms`,
    }"
  >
    <slot />
  </div>
</template>
