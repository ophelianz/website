import { ref, onMounted, onUnmounted } from "vue";

export function useReveal(
  options: { threshold?: number; rootMargin?: string } = {},
) {
  const el = ref<HTMLElement | null>(null);
  const isVisible = ref(false);
  let observer: IntersectionObserver | null = null;

  onMounted(() => {
    if (!el.value) return;

    observer = new IntersectionObserver(
      ([entry]) => {
        if (entry!.isIntersecting) {
          isVisible.value = true;
          observer?.unobserve(entry!.target);
        }
      },
      {
        threshold: options.threshold ?? 0.15,
        rootMargin: options.rootMargin ?? "0px 0px -40px 0px",
      },
    );

    observer.observe(el.value);
  });

  onUnmounted(() => {
    observer?.disconnect();
  });

  return { el, isVisible };
}
