import type { Config } from "tailwindcss";

export default {
  content: [],
  theme: {
    extend: {
      colors: {
        bg: "#000000",
        surface: "#121212",
        "surface-alt": "#1a1a1a",
        "surface-deep": "oklch(0.08 0.004 264)",
        "surface-raised": "oklch(0.09 0.004 264)",
        "surface-card": "oklch(0.11 0.004 264)",
        "surface-hover": "oklch(0.15 0.004 264)",
        "surface-section": "oklch(0.1 0.004 264)",
        outline: "#2a2a2a",
        accent: "#7ED37F",
        "accent-dim": "#5FB262",
        secondary: "oklch(0.52 0.13 240)",
        muted: "oklch(0.15 0.004 264)",
        "muted-fg": "oklch(0.5 0.008 264)",
        destructive: "oklch(0.62 0.22 25)",
        link: "#79c0ff",
        "on-surface": "#ffffff",
        "on-surface-alt": "#a1a1a1",
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
    },
  },
} satisfies Config;
