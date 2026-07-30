import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const httpUrl = z.url({
  protocol: /^https?$/
});

const nonEmptyStringArray = z.array(z.string().min(1)).min(1);

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

    technologies: nonEmptyStringArray,

    repositoryUrl: httpUrl.optional(),

    demoUrl: httpUrl.optional(),

    problem: z.string().min(30),

    responsibilities: nonEmptyStringArray,

    architectureHighlights: nonEmptyStringArray,

    productionConcerns: nonEmptyStringArray,

    securityControls: nonEmptyStringArray,

    observability: nonEmptyStringArray,

    tradeOffs: nonEmptyStringArray,

    publishedAt: z.coerce.date(),

    updatedAt: z.coerce.date()
  })
});

export const collections = {
  projects
};
