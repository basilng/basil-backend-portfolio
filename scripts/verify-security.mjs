import { readFile, readdir } from "node:fs/promises";
import { extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const failures = [];

const sourceExtensions = new Set([".astro", ".ts", ".tsx", ".js", ".mjs", ".html", ".md", ".mdx"]);

const forbiddenPatterns = [
  {
    pattern: /set:html\s*=/i,
    message: "Astro set:html bypasses normal output escaping"
  },
  {
    pattern: /<script\b/i,
    message:
      "Raw script tags are forbidden; use only reviewed framework integrations such as Vercel Analytics"
  },
  {
    pattern: /javascript\s*:/i,
    message: "javascript: URLs are forbidden"
  },
  {
    pattern: /\beval\s*\(/i,
    message: "eval() is forbidden"
  },
  {
    pattern: /\bnew\s+Function\s*\(/i,
    message: "Function constructors are forbidden"
  }
];

async function collectFiles(directory) {
  const entries = await readdir(directory, {
    withFileTypes: true
  });

  const files = [];

  for (const entry of entries) {
    const path = join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectFiles(path)));
      continue;
    }

    if (entry.isFile() && sourceExtensions.has(extname(entry.name))) {
      files.push(path);
    }
  }

  return files;
}

async function readText(path, displayName) {
  try {
    return await readFile(path, "utf8");
  } catch (error) {
    failures.push(
      `${displayName}: unable to read file: ${
        error instanceof Error ? error.message : String(error)
      }`
    );

    return "";
  }
}

async function readJson(path, displayName) {
  const content = await readText(path, displayName);

  if (!content) {
    return {};
  }

  try {
    return JSON.parse(content);
  } catch (error) {
    failures.push(
      `${displayName}: invalid JSON: ${error instanceof Error ? error.message : String(error)}`
    );

    return {};
  }
}

function parseContentSecurityPolicy(value) {
  const directives = new Map();
  const duplicates = [];

  for (const rawDirective of value.split(";")) {
    const directive = rawDirective.trim();

    if (!directive) {
      continue;
    }

    const [rawName, ...tokens] = directive.split(/\s+/);
    const name = rawName.toLowerCase();

    if (directives.has(name)) {
      duplicates.push(name);
    }

    directives.set(name, tokens);
  }

  return {
    directives,
    duplicates
  };
}

function verifyCspDirective(directives, name, expectedTokens) {
  const actualTokens = directives.get(name);

  if (!actualTokens) {
    failures.push(`vercel.json: CSP is missing ${name}`);
    return;
  }

  const actualTokenSet = new Set(actualTokens);
  const expectedTokenSet = new Set(expectedTokens);

  for (const expectedToken of expectedTokens) {
    if (!actualTokenSet.has(expectedToken)) {
      failures.push(`vercel.json: CSP ${name} is missing required value ${expectedToken}`);
    }
  }

  const unexpectedTokens = actualTokens.filter((token) => !expectedTokenSet.has(token));

  if (unexpectedTokens.length > 0) {
    failures.push(
      `vercel.json: CSP ${name} contains unexpected values: ${unexpectedTokens.join(", ")}`
    );
  }
}

async function verifySourceFiles() {
  const sourceDirectory = join(root, "src");

  let files;

  try {
    files = await collectFiles(sourceDirectory);
  } catch (error) {
    failures.push(
      `src: unable to scan source files: ${error instanceof Error ? error.message : String(error)}`
    );

    return;
  }

  for (const file of files) {
    const relativePath = relative(root, file);
    const content = await readText(file, relativePath);

    for (const check of forbiddenPatterns) {
      if (check.pattern.test(content)) {
        failures.push(`${relativePath}: ${check.message}`);
      }
    }
  }
}

async function verifyRuntimeDependencies() {
  const packageJson = await readJson(join(root, "package.json"), "package.json");

  const requiredRuntimeDependencies = ["@vercel/analytics", "@vercel/speed-insights"];

  for (const dependency of requiredRuntimeDependencies) {
    const configuredVersion = packageJson.dependencies?.[dependency];

    if (typeof configuredVersion !== "string" || configuredVersion.trim().length === 0) {
      failures.push(`package.json: ${dependency} must be declared under dependencies`);
    }
  }
}

async function verifyBaseLayoutIntegrations() {
  const baseLayoutPath = join(root, "src", "layouts", "BaseLayout.astro");
  const baseLayout = await readText(baseLayoutPath, "src/layouts/BaseLayout.astro");

  if (!baseLayout) {
    return;
  }

  const requiredIntegrations = [
    {
      packageName: "@vercel/analytics/astro",
      componentName: "Analytics"
    },
    {
      packageName: "@vercel/speed-insights/astro",
      componentName: "SpeedInsights"
    }
  ];

  for (const integration of requiredIntegrations) {
    const escapedPackageName = integration.packageName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const importPattern = new RegExp(
      `import\\s+${integration.componentName}\\s+from\\s+["']${escapedPackageName}["']`
    );

    const componentPattern = new RegExp(`<${integration.componentName}\\s*/>`);

    if (!importPattern.test(baseLayout)) {
      failures.push(
        `src/layouts/BaseLayout.astro: missing ${integration.componentName} import from ${integration.packageName}`
      );
    }

    if (!componentPattern.test(baseLayout)) {
      failures.push(
        `src/layouts/BaseLayout.astro: missing <${integration.componentName} /> component`
      );
    }
  }
}

async function verifyPrivacyDisclosure() {
  const privacyPage = await readText(
    join(root, "src", "pages", "privacy.astro"),
    "src/pages/privacy.astro"
  );

  if (privacyPage) {
    if (!/Vercel Web Analytics/i.test(privacyPage)) {
      failures.push("src/pages/privacy.astro: missing Vercel Web Analytics disclosure");
    }

    if (!/Vercel Speed Insights/i.test(privacyPage)) {
      failures.push("src/pages/privacy.astro: missing Vercel Speed Insights disclosure");
    }

    if (!/cookies?/i.test(privacyPage)) {
      failures.push("src/pages/privacy.astro: missing cookie or cookie-free analytics disclosure");
    }
  }

  const footer = await readText(
    join(root, "src", "components", "layout", "SiteFooter.astro"),
    "src/components/layout/SiteFooter.astro"
  );

  if (footer && !/href=["']\/privacy\/["']/.test(footer)) {
    failures.push("src/components/layout/SiteFooter.astro: missing link to /privacy/");
  }
}

async function verifyVercelHeaders() {
  const vercel = await readJson(join(root, "vercel.json"), "vercel.json");

  const globalRules = Array.isArray(vercel.headers)
    ? vercel.headers.filter((rule) => rule.source === "/(.*)")
    : [];

  if (globalRules.length === 0) {
    failures.push("vercel.json: missing global /(.*) header rule");
    return;
  }

  if (globalRules.length > 1) {
    failures.push("vercel.json: multiple global /(.*) header rules are configured");
  }

  const globalRule = globalRules[0];

  const headers = new Map(
    Array.isArray(globalRule?.headers)
      ? globalRule.headers
          .filter((header) => typeof header?.key === "string" && typeof header?.value === "string")
          .map((header) => [header.key.toLowerCase(), header.value.trim()])
      : []
  );

  const requiredHeaderValues = new Map([
    ["referrer-policy", "strict-origin-when-cross-origin"],
    ["x-content-type-options", "nosniff"],
    ["x-frame-options", "DENY"],
    ["x-permitted-cross-domain-policies", "none"],
    [
      "permissions-policy",
      "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()"
    ],
    ["cross-origin-opener-policy", "same-origin"],
    ["cross-origin-resource-policy", "same-origin"]
  ]);

  for (const [headerName, expectedValue] of requiredHeaderValues) {
    const actualValue = headers.get(headerName);

    if (!actualValue) {
      failures.push(`vercel.json: missing ${headerName} header`);
      continue;
    }

    if (actualValue !== expectedValue) {
      failures.push(
        `vercel.json: ${headerName} must be "${expectedValue}", found "${actualValue}"`
      );
    }
  }

  const hsts = headers.get("strict-transport-security");

  if (!hsts) {
    failures.push("vercel.json: missing strict-transport-security header");
  } else {
    const maxAgeMatch = hsts.match(/(?:^|;)\s*max-age=(\d+)/i);
    const maxAge = maxAgeMatch ? Number(maxAgeMatch[1]) : 0;

    if (maxAge < 31_536_000) {
      failures.push("vercel.json: HSTS max-age must be at least 31536000 seconds");
    }

    if (!/(?:^|;)\s*includeSubDomains(?:;|$)/i.test(hsts)) {
      failures.push("vercel.json: HSTS must include includeSubDomains");
    }
  }

  const csp = headers.get("content-security-policy");

  if (!csp) {
    failures.push("vercel.json: missing content-security-policy header");
    return;
  }

  const { directives, duplicates } = parseContentSecurityPolicy(csp);

  for (const duplicate of duplicates) {
    failures.push(`vercel.json: CSP contains duplicate ${duplicate} directive`);
  }

  const requiredCspDirectives = new Map([
    ["default-src", ["'self'"]],
    ["base-uri", ["'self'"]],
    ["object-src", ["'none'"]],
    ["frame-src", ["'none'"]],
    ["frame-ancestors", ["'none'"]],
    ["form-action", ["'none'"]],
    ["img-src", ["'self'", "data:"]],
    ["font-src", ["'self'"]],
    ["style-src", ["'self'"]],
    ["script-src", ["'self'"]],
    ["script-src-attr", ["'none'"]],
    ["connect-src", ["'self'"]],
    ["media-src", ["'self'"]],
    ["worker-src", ["'none'"]],
    ["manifest-src", ["'self'"]],
    ["upgrade-insecure-requests", []]
  ]);

  for (const [directiveName, expectedTokens] of requiredCspDirectives) {
    verifyCspDirective(directives, directiveName, expectedTokens);
  }

  const scriptSources = directives.get("script-src") ?? [];

  const prohibitedScriptSources = ["'unsafe-inline'", "'unsafe-eval'", "*", "data:", "blob:"];

  for (const prohibitedSource of prohibitedScriptSources) {
    if (scriptSources.includes(prohibitedSource)) {
      failures.push(`vercel.json: CSP script-src contains prohibited value ${prohibitedSource}`);
    }
  }

  const scriptAttributeSources = directives.get("script-src-attr") ?? [];

  if (scriptAttributeSources.length !== 1 || scriptAttributeSources[0] !== "'none'") {
    failures.push("vercel.json: CSP script-src-attr must contain only 'none'");
  }

  const connectionSources = directives.get("connect-src") ?? [];

  if (connectionSources.includes("*") || connectionSources.includes("data:")) {
    failures.push("vercel.json: CSP connect-src contains an overly broad source");
  }
}

async function verifySecurityText() {
  const securityText = await readText(
    join(root, "public", ".well-known", "security.txt"),
    "public/.well-known/security.txt"
  );

  if (!securityText) {
    return;
  }

  const expiresMatch = securityText.match(/^Expires:\s*(.+)$/m);

  if (!expiresMatch) {
    failures.push("security.txt: missing Expires field");
  } else {
    const expiresAt = Date.parse(expiresMatch[1]);

    if (Number.isNaN(expiresAt)) {
      failures.push("security.txt: Expires field is not a valid date");
    } else if (expiresAt <= Date.now()) {
      failures.push("security.txt: Expires field is in the past");
    }
  }

  if (!/^Contact:\s*mailto:[^\s@]+@[^\s@]+$/m.test(securityText)) {
    failures.push("security.txt: missing valid mailto Contact field");
  }

  const canonicalMatch = securityText.match(/^Canonical:\s*(https:\/\/\S+)$/m);

  if (!canonicalMatch) {
    failures.push("security.txt: Canonical URL must use HTTPS");
  } else if (!canonicalMatch[1].endsWith("/.well-known/security.txt")) {
    failures.push("security.txt: Canonical URL must point to /.well-known/security.txt");
  }
}

await verifySourceFiles();
await verifyRuntimeDependencies();
await verifyBaseLayoutIntegrations();
await verifyPrivacyDisclosure();
await verifyVercelHeaders();
await verifySecurityText();

if (failures.length > 0) {
  console.error(`Security verification failed:\n- ${failures.join("\n- ")}`);

  process.exit(1);
}

console.log("Security verification passed.");
