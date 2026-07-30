import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://www.basilng.dev",
  output: "static",
  trailingSlash: "always",
  compressHTML: true,
  prerenderConflictBehavior: "error",
  build: {
    inlineStylesheets: "never"
  },
  integrations: [
    sitemap({
      filter: (page) => !page.endsWith("/404/")
    })
  ],
  vite: {
    build: {
      cssMinify: true
    }
  }
});
