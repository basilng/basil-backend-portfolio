$ErrorActionPreference = "Stop"

$compose = @("compose", "-f", "compose.dev.yaml", "run", "--rm", "portfolio")

podman @compose npm install --save-exact astro@latest @astrojs/sitemap@latest
podman @compose npm install --save-dev --save-exact `
  @astrojs/check@latest `
  @axe-core/playwright@latest `
  @eslint/js@latest `
  @playwright/test@latest `
  @types/node@latest `
  eslint@latest `
  eslint-plugin-astro@latest `
  prettier@latest `
  prettier-plugin-astro@latest `
  typescript@7.0.2 `
  typescript-eslint@latest

podman @compose npm run build

Write-Host "Bootstrap complete. Commit package.json and package-lock.json."
