export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: false },

  vite: {
    optimizeDeps: {
      include: ["lucide-vue-next"],
    },
  },

  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ["/", "/download", "/devlog", "/docs/01-getting-started"],
    },
  },

  modules: [
    "@nuxtjs/tailwindcss",
    "@nuxtjs/google-fonts",
    "@nuxt/content",
    "@vercel/analytics",
    "@nuxt/icon",
  ],

  mdc: {
    highlight: {
      theme: "github-dark-default",
      langs: [
        "rust",
        "typescript",
        "javascript",
        "bash",
        "toml",
        "json",
        "vue",
        "html",
        "css",
        "yaml",
      ],
    },
  },

  googleFonts: {
    families: {
      "IBM+Plex+Sans": [400, 500, 600, 700],
      "JetBrains+Mono": [400],
    },
    display: "swap",
    download: true,
    preload: true,
  },

  tailwindcss: {
    cssPath: "~/assets/css/tailwind.css",
  },

  routeRules: {
    "/docs": { redirect: "/docs/01-getting-started" },
    "/docs/**": { prerender: true },
    "/devlog/**": { prerender: true },
    "/updates/**": {
      headers: {
        "cache-control": "no-store, max-age=0",
      },
    },
  },

  experimental: {
    payloadExtraction: true,
  },

  app: {
    head: {
      title: "Ophelia Download Manager",
      meta: [
        {
          name: "description",
          content: "Free, open source download manager.",
        },
        { name: "theme-color", content: "#7ED37F" },
        { property: "og:type", content: "website" },
        { property: "og:title", content: "Ophelia Download Manager" },
        {
          property: "og:description",
          content: "Free, open source download manager.",
        },
        { property: "og:image", content: "https://ophelia.nz/og-image.png" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: "Ophelia Download Manager" },
        {
          name: "twitter:description",
          content: "Free, open source download manager.",
        },
        { name: "twitter:image", content: "https://ophelia.nz/og-image.png" },
      ],
      link: [
        { rel: "icon", href: "/favicon.ico", sizes: "32x32" },
        {
          rel: "icon",
          href: "/favicon-16x16.png",
          type: "image/png",
          sizes: "16x16",
        },
        {
          rel: "icon",
          href: "/favicon-32x32.png",
          type: "image/png",
          sizes: "32x32",
        },
        {
          rel: "apple-touch-icon",
          href: "/apple-touch-icon.png",
          sizes: "180x180",
        },
        { rel: "manifest", href: "/site.webmanifest" },
      ],
      htmlAttrs: {
        lang: "en",
      },
    },
    pageTransition: { name: "page", mode: "out-in" },
  },
});
