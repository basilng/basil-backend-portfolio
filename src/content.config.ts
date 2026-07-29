import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const httpUrl = z.url({
  protocol: /^https?$/
});

const projects = defineCollection({
  loader: glob({
    pattern: "**/*.{md,mdx}",
    base: "./src/content/projects"
  }),

  schema: z.object({
    title: z.string().min(3),

    summary: z.string().min(40),

    status: z.enum(["active", "completed", "planned"]),

    featured: z.boolean().default(false),

    order: z.number().int().nonnegative(),

    technologies: z.array(z.string()).min(1),

    repositoryUrl: httpUrl.optional(),

    demoUrl: httpUrl.optional(),

    problem: z.string().min(30),

    responsibilities: z.array(z.string()).min(1),

    architectureHighlights: z.array(z.string()).min(1),

    productionConcerns: z.array(z.string()).min(1),

    securityControls: z.array(z.string()).min(1),

    observability: z.array(z.string()).min(1),

    tradeOffs: z.array(z.string()).min(1),

    publishedAt: z.coerce.date(),

    updatedAt: z.coerce.date()
  })
});

export const collections = {
  projects
};
