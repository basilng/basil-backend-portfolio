import eslint from "@eslint/js";
import tsParser from "@typescript-eslint/parser";
import { defineConfig, globalIgnores } from "eslint/config";
import astro from "eslint-plugin-astro";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
  globalIgnores([
    "node_modules/**",
    "dist/**",
    ".astro/**",
    "coverage/**",
    "playwright-report/**",
    "test-results/**",
    "blob-report/**"
  ]),

  /*
   * Base JavaScript rules.
   */
  eslint.configs.recommended,

  /*
   * TypeScript rules.
   *
   * These presets are scoped internally to TypeScript source files.
   */
  ...tseslint.configs.recommended,

  /*
   * This must remain present. It installs astro-eslint-parser as the
   * outer parser for .astro files.
   */
  ...astro.configs.recommended,

  /*
   * Astro files use two parsers:
   *
   * 1. astro-eslint-parser parses the .astro document.
   * 2. @typescript-eslint/parser parses TypeScript in frontmatter.
   *
   * Do not set languageOptions.parser to tsParser here. Doing so would
   * replace Astro's outer parser and break the template syntax.
   */
  {
    files: ["**/*.astro"],

    languageOptions: {
      parserOptions: {
        parser: tsParser,

        ecmaVersion: "latest",
        sourceType: "module"
      }
    },

    rules: {
      "astro/no-set-html-directive": "error",
      "astro/no-unsafe-inline-scripts": "error"
    }
  },

  /*
   * Shared source-code security rules.
   *
   * Notice that `.astro` is intentionally not included here. Astro has
   * its own parser-aware configuration above.
   */
  {
    files: ["**/*.{js,mjs,cjs,ts,tsx}"],

    rules: {
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-new-func": "error",
      "no-script-url": "error",

      "no-console": [
        "error",
        {
          allow: ["warn", "error"]
        }
      ]
    }
  },

  /*
   * Node.js tooling and configuration files.
   */
  {
    files: ["scripts/**/*.mjs", "*.config.{js,mjs,cjs,ts}", "playwright.config.ts"],

    languageOptions: {
      globals: globals.nodeBuiltin
    },

    rules: {
      "no-console": "off"
    }
  },

  /*
   * The security verifier intentionally contains prohibited strings
   * such as `javascript:` as scanning patterns.
   */
  {
    files: ["scripts/verify-security.mjs"],

    rules: {
      "no-script-url": "off"
    }
  }
]);
