import { defineContentConfig, defineCollection, z } from "@nuxt/content";

export default defineContentConfig({
  collections: {
    devlog: defineCollection({
      type: "page",
      source: "devlog/**",
      schema: z.object({
        title: z.string(),
        date: z.string(),
        tags: z.array(z.string()),
        summary: z.string(),
        author: z.object({
          name: z.string(),
          github: z.string(),
        }),
      }),
    }),
    docs: defineCollection({
      type: "page",
      source: "docs/**",
      schema: z.object({
        title: z.string(),
        description: z.string(),
        order: z.number().optional(),
        section: z.string().optional(),
      }),
    }),
  },
});
