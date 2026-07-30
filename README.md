# Basil N G - Backend Engineer Portfolio

Astro and TypeScript portfolio for a Staff Engineer / Senior Java Backend Engineer.

## Requirement coverage

| Requirement                         | Implementation                                                                                                                  |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Design system and responsive layout | Semantic CSS tokens, reusable layout primitives, mobile-first grids and reduced-motion support                                  |
| Navigation, hero and introduction   | Sticky responsive navigation, native no-JavaScript mobile menu, hero and professional profile sections                          |
| Skills, experience and education    | Typed profile data rendered through reusable sections and a browser-readable resume page                                        |
| Projects and case studies           | Typed Astro content collection, reusable cards and statically generated detail routes                                           |
| Downloadable resume                 | Versioned PDF under `public/resume` with download links and deployment headers                                                  |
| Contact and social links            | Email, LinkedIn and configurable GitHub links without a server-side contact form                                                |
| SEO, accessibility and performance  | Canonicals, Open Graph, sitemap, robots, semantic HTML, keyboard support, axe tests, static output and long-lived asset caching |
| Validation and build checks         | Astro/TypeScript check, ESLint, Prettier, security policy verification, output verification, Playwright and CI workflows        |

## Security baseline

- statically generated pages with no application server, database, authentication or runtime secret;
- no analytics, advertising, remote fonts, embedded widgets or third-party browser scripts;
- no client-side JavaScript in the baseline implementation;
- restrictive Content Security Policy and standard browser hardening headers;
- ESLint and repository scanning that reject `set:html`, script tags, `javascript:` URLs, `eval()` and function constructors;
- dependency audit, pull-request dependency review, Dependabot and CodeQL;
- container build with a non-root Nginx runtime and `no-new-privileges` in local development;
- security contact published through `/.well-known/security.txt`.

No static website can be declared absolutely secure. Review every public data item, keep dependencies patched and verify the actual deployment headers after each hosting change.

## Required personal configuration

Before public deployment, update:

1. `src/data/site.ts`
   - `links.github`
2. `astro.config.mjs`
   - `site`
3. `public/robots.txt`
   - sitemap domain
4. `public/.well-known/security.txt`
   - canonical domain and expiry date when required
5. Project Markdown files
   - add real `repositoryUrl` and `demoUrl` values when public
6. `public/resume/basil-ng-resume.pdf`
   - replace it whenever the resume changes

The baseline intentionally does not publish a phone number.

## Node and Podman baseline

Development and CI target Node.js 24. The local Compose environment uses:

```text
node:24-bookworm-slim
```

Node is a build tool only. The deployed portfolio consists of static HTML, CSS, images and the resume PDF.

## First installation with Podman

The generated starter cannot contain a trustworthy dependency lock without resolving packages from the npm registry. Run the bootstrap script once on your machine; `.npmrc` ensures resolved versions are saved exactly.

```powershell
.\bootstrap.ps1
```

Equivalent manual commands:

```powershell
podman compose -f compose.dev.yaml run --rm portfolio `
  npm install --save-exact astro@latest @astrojs/sitemap@latest
```

```powershell
podman compose -f compose.dev.yaml run --rm portfolio `
  npm install --save-dev --save-exact `
    @astrojs/check@latest `
    @axe-core/playwright@latest `
    @eslint/js@latest `
    @playwright/test@latest `
    @types/node@latest `
    eslint@latest `
    eslint-plugin-astro@latest `
    prettier@latest `
    prettier-plugin-astro@latest `
    typescript@latest `
    typescript-eslint@latest
```

Commit the deterministic dependency state:

```powershell
git add package.json package-lock.json
git commit -m "build: pin portfolio dependencies"
```

After the lock file exists, use `npm ci` rather than `npm install` in CI and repeatable builds.

## Development

Install the locked dependencies into the Compose-managed Linux volume:

```powershell
podman compose -f compose.dev.yaml run --rm portfolio npm ci
```

Start the local site:

```powershell
podman compose -f compose.dev.yaml up
```

Open `http://localhost:4321`.

## Validation

```powershell
podman compose -f compose.dev.yaml run --rm portfolio `
  npm install --package-lock-only
podman compose -f compose.dev.yaml run --rm portfolio npm run check
podman compose -f compose.dev.yaml run --rm portfolio npm run lint
podman compose -f compose.dev.yaml run --rm portfolio npm run format:check
podman compose -f compose.dev.yaml run --rm portfolio npm run security:check
podman compose -f compose.dev.yaml run --rm portfolio npm run build
```

Install Chromium once and run the desktop/mobile accessibility suite:

```powershell
podman compose -f compose.dev.yaml run --rm portfolio npx playwright install chromium
podman compose -f compose.dev.yaml run --rm portfolio npm run test:a11y
```

```powershell
podman compose -f compose.dev.yaml run --rm portfolio npm run build
podman compose -f compose.test.yaml build
podman compose -f compose.test.yaml run --rm accessibility-test
podman compose -f compose.test.yaml run --rm accessibility-test `
>>   npm run test:a11y
podman compose -f compose.test.yaml run --rm accessibility-test `
>>   npx playwright test `
>>   --project=chromium-mobile `
>>   --grep="layout does not overflow"

 podman compose -f compose.dev.yaml run --rm portfolio npx prettier --write README.md
```

The accessibility suite checks the main routes with axe, the skip-link focus path, a 320-pixel viewport, external-link opener isolation and the resume download.

## Deployment to Vercel

1. Push the repository to GitHub.
2. Import it into Vercel.
3. Select the Astro framework preset.
4. Use `npm run build` as the build command.
5. Use `dist` as the output directory.
6. Configure and verify the custom domain.
7. Confirm the response headers using browser developer tools or an independent header scanner.

The site is statically generated, so no Astro server adapter or continuously running Node process is required.

## Optional container deployment

A multi-stage `Containerfile` builds the site with Node and serves only the generated `dist` directory from an unprivileged Nginx process on port `8080`.

```powershell
podman build -t basil-portfolio:local -f Containerfile .
podman run --rm -p 8080:8080 basil-portfolio:local
```

When TLS terminates at a reverse proxy or load balancer, configure HSTS there. Do not send HSTS from an HTTP-only local container.

## GitHub repository protection

Enable:

- Dependabot alerts and security updates;
- secret scanning and push protection;
- branch protection for `main`;
- required CI, CodeQL and dependency-review checks;
- pull-request review before merge;
- signed commits where practical.

## Content maintenance

Project case studies live under `src/content/projects`. A project entry must satisfy the schema in `src/content.config.ts`; the project list and detail route are generated automatically.

Professional history and skills live in `src/data/profile.ts`. Shared contact and navigation configuration lives in `src/data/site.ts`.

## Production checklist

- [x] Set the real domain and GitHub URL.
- [ ] Replace example domains in `robots.txt` and `security.txt`.
- [ ] Generate and commit `package-lock.json`.
- [ ] Run `npm audit --audit-level=high`.
- [ ] Run `npm run build`.
- [ ] Run `npm run test:a11y` for desktop and mobile projects.
- [ ] Confirm the PDF downloads with the expected filename.
- [ ] Replace the baseline PDF with a tagged, accessibility-checked final resume when available.
- [ ] Verify CSP and all response headers in the deployed environment.
- [ ] Test at 320 px, 768 px and a wide desktop viewport.
- [ ] Test with keyboard-only navigation and reduced motion enabled.
- [ ] Confirm that no employer-confidential information is present.
- [ ] Confirm all performance claims are accurate and defensible.

### Configurations

```powershell
Vercel
→ basil-backend-portfolio project
→ Settings
→ Domains
```

```powershell
Account
→ Domain Management
→ Find your domain
→ DNS
```

```powershell
Type:    A
Host:    blank
Answer:  value shown by Vercel
TTL:     600 or default
```

```powershell
Type:    CNAME
Host:    www
Answer:  value shown by Vercel
TTL:     600 or default
```

```powershell
Resolve-DnsName yourdomain.com -Type A
Resolve-DnsName www.yourdomain.com -Type CNAME
curl.exe -I https://www.yourdomain.com/
curl.exe -I https://yourdomain.com/
curl.exe -I https://www.yourdomain.com/resume/basil-ng-resume.pdf
```

```powershell
podman compose -f compose.dev.yaml run --rm portfolio `
  npm install --save-exact `
  @vercel/analytics@2.0.1 `
  @vercel/speed-insights@2.0.0

podman compose -f compose.dev.yaml run --rm portfolio `
  npm ls @vercel/analytics @vercel/speed-insights
```
