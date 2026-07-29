import { defineConfig, devices } from "@playwright/test";

const isCi = Boolean(process.env.CI);

export default defineConfig({
  testDir: "./tests",

  fullyParallel: true,

  forbidOnly: isCi,

  retries: isCi ? 2 : 0,

  /*
   * Do not assign `undefined` when exactOptionalPropertyTypes is enabled.
   * Omit the property locally and let Playwright use its default.
   */
  ...(isCi ? { workers: 2 } : {}),

  reporter: isCi ? [["html", { open: "never" }], ["list"]] : "list",

  use: {
    baseURL: "http://127.0.0.1:4321",
    trace: "on-first-retry"
  },

  projects: [
    {
      name: "chromium-desktop",
      use: {
        ...devices["Desktop Chrome"]
      }
    },
    {
      name: "chromium-mobile",
      use: {
        ...devices["Pixel 7"]
      }
    }
  ],

  webServer: {
    command: "npm run preview -- --host 127.0.0.1",
    url: "http://127.0.0.1:4321",
    reuseExistingServer: !isCi,
    timeout: 120_000
  }
});
