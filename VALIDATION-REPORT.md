# Validation report

Generated: 2026-07-29

## Completed successfully

- JSON syntax validation for `package.json`, `vercel.json`, manifest and Prettier configuration.
- YAML syntax validation for Podman Compose, Dependabot and GitHub Actions workflows.
- Node.js syntax validation for Astro/ESLint configuration and repository verification scripts.
- Repository security verification:
  - required Vercel security headers are present;
  - required CSP directives are present;
  - source files contain no `set:html`, script tags, `javascript:` URLs, `eval()` or function constructors;
  - `security.txt` contains a valid contact, HTTPS canonical URL and future expiry.
- Manual import-path and file-structure review.
- Primary colour-pair contrast calculations exceed WCAG AA normal-text thresholds.
- Resume PDF inspection:
  - valid two-page A4 PDF;
  - selectable text;
  - no embedded JavaScript;
  - no encryption or form actions.

## Requires execution on the developer machine

The npm registry was not reachable from the artifact-generation environment, so dependency resolution could not complete. Consequently, these dependency-backed checks must be run after `bootstrap.ps1` creates `package-lock.json`:

```powershell
podman compose -f compose.dev.yaml run --rm portfolio npm run check
podman compose -f compose.dev.yaml run --rm portfolio npm run lint
podman compose -f compose.dev.yaml run --rm portfolio npm run format:check
podman compose -f compose.dev.yaml run --rm portfolio npm run build
podman compose -f compose.dev.yaml run --rm portfolio npm run test:a11y
```

Do not deploy until all five commands pass and the real domain and GitHub URL have been configured.

## Accessibility note

The HTML site includes an automated accessibility suite. The included baseline PDF is text-selectable but is not a tagged PDF; replace it with a tagged, accessibility-checked final resume before treating the PDF itself as fully accessible.
