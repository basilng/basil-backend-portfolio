import { readFile, readdir, stat } from "node:fs/promises";
import { extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const failures = [];

const sourceExtensions = new Set([".astro", ".ts", ".tsx", ".js", ".mjs", ".html"]);
const forbiddenPatterns = [
  { pattern: /set:html\s*=/i, message: "Astro set:html bypasses normal output escaping" },
  { pattern: /<script\b/i, message: "Baseline policy does not allow client-side scripts" },
  { pattern: /javascript\s*:/i, message: "javascript: URLs are forbidden" },
  { pattern: /\beval\s*\(/i, message: "eval() is forbidden" },
  { pattern: /\bnew\s+Function\s*\(/i, message: "Function constructors are forbidden" }
];

async function collectFiles(directory) {
  const entries = await readdir(directory);
  const files = [];

  for (const entry of entries) {
    const path = join(directory, entry);
    const details = await stat(path);

    if (details.isDirectory()) {
      files.push(...(await collectFiles(path)));
    } else if (sourceExtensions.has(extname(entry))) {
      files.push(path);
    }
  }

  return files;
}

for (const file of await collectFiles(join(root, "src"))) {
  const content = await readFile(file, "utf8");

  for (const check of forbiddenPatterns) {
    if (check.pattern.test(content)) {
      failures.push(`${relative(root, file)}: ${check.message}`);
    }
  }
}

const vercel = JSON.parse(await readFile(join(root, "vercel.json"), "utf8"));
const globalRule = vercel.headers?.find((rule) => rule.source === "/(.*)");
const headers = new Map(
  globalRule?.headers?.map((header) => [header.key.toLowerCase(), header.value]) ?? []
);

const requiredHeaders = [
  "content-security-policy",
  "referrer-policy",
  "x-content-type-options",
  "x-frame-options",
  "x-permitted-cross-domain-policies",
  "permissions-policy",
  "cross-origin-opener-policy",
  "cross-origin-resource-policy",
  "strict-transport-security"
];

for (const header of requiredHeaders) {
  if (!headers.has(header)) {
    failures.push(`vercel.json: missing ${header} header`);
  }
}

const csp = headers.get("content-security-policy") ?? "";
const requiredCspDirectives = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'none'",
  "script-src 'none'"
];

for (const directive of requiredCspDirectives) {
  if (!csp.includes(directive)) {
    failures.push(`vercel.json: CSP is missing ${directive}`);
  }
}

const securityText = await readFile(join(root, "public", ".well-known", "security.txt"), "utf8");
const expiresMatch = securityText.match(/^Expires:\s*(.+)$/m);

if (!expiresMatch) {
  failures.push("security.txt: missing Expires field");
} else if (Number.isNaN(Date.parse(expiresMatch[1]))) {
  failures.push("security.txt: Expires field is not a valid date");
} else if (Date.parse(expiresMatch[1]) <= Date.now()) {
  failures.push("security.txt: Expires field is in the past");
}

if (!/^Contact:\s*mailto:/m.test(securityText)) {
  failures.push("security.txt: missing mailto Contact field");
}

if (!/^Canonical:\s*https:\/\//m.test(securityText)) {
  failures.push("security.txt: Canonical URL must use HTTPS");
}

if (failures.length > 0) {
  console.error("Security verification failed:\n- " + failures.join("\n- "));
  process.exit(1);
}

console.log("Security verification passed.");
