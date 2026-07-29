import eslint from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import astro from "eslint-plugin-astro";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
  globalIgnores([
    "dist/**",
    ".astro/**",
    "node_modules/**",
    "coverage/**",
    "playwright-report/**",
    "test-results/**",
    "blob-report/**"
  ]),

  eslint.configs.recommended,

  ...tseslint.configs.recommended,

  ...astro.configs.recommended,

  {
    files: ["**/*.{js,mjs,cjs,ts,tsx,astro}"],

    rules: {
      "no-console": [
        "error",
        {
          allow: ["warn", "error"]
        }
      ],

      "no-eval": "error",
      "no-implied-eval": "error",
      "no-new-func": "error",
      "no-script-url": "error",
      "astro/no-set-html-directive": "error"
    }
  },

  /*
   * Build scripts and configuration files execute in Node.js.
   *
   * nodeBuiltin is preferable to globals.node for ESM because it
   * does not expose CommonJS wrapper variables such as require,
   * module, __filename, and __dirname.
   */
  {
    files: ["scripts/**/*.mjs", "*.config.{js,mjs,cjs,ts}", "playwright.config.ts"],

    languageOptions: {
      globals: globals.nodeBuiltin
    },

    rules: {
      /*
       * Build and verification scripts must report their result
       * through stdout and stderr.
       */
      "no-console": "off"
    }
  },

  /*
   * This script intentionally searches source files for the unsafe
   * JavaScript URL scheme. The literal is test data, not an executed
   * browser URL.
   */
  {
    files: ["scripts/verify-security.mjs"],

    rules: {
      "no-script-url": "off"
    }
  }
]);
