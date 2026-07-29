import { access, readFile, readdir, stat } from "node:fs/promises";
import { join } from "node:path";

const root = new URL("../", import.meta.url).pathname;
const dist = join(root, "dist");
const requiredFiles = [
  "index.html",
  "projects/index.html",
  "projects/ecommerce-platform/index.html",
  "projects/payment-processing-platform/index.html",
  "projects/event-driven-notification-platform/index.html",
  "resume/index.html",
  "resume/basil-ng-resume.pdf",
  "robots.txt",
  "site.webmanifest",
  "sitemap-index.xml",
  ".well-known/security.txt"
];

const failures = [];

for (const relativePath of requiredFiles) {
  try {
    await access(join(dist, relativePath));
  } catch {
    failures.push(`Missing build output: ${relativePath}`);
  }
}

try {
  await access(join(dist, "404.html"));
} catch {
  try {
    await access(join(dist, "404/index.html"));
  } catch {
    failures.push("Missing build output: 404 page");
  }
}

async function collectHtml(directory) {
  const entries = await readdir(directory);
  const files = [];

  for (const entry of entries) {
    const path = join(directory, entry);
    const details = await stat(path);

    if (details.isDirectory()) {
      files.push(...(await collectHtml(path)));
    } else if (entry.endsWith(".html")) {
      files.push(path);
    }
  }

  return files;
}

try {
  const htmlFiles = await collectHtml(dist);

  for (const file of htmlFiles) {
    const html = await readFile(file, "utf8");

    if (!html.includes('<meta name="description"')) {
      failures.push(`Missing meta description: ${file}`);
    }

    if (!html.includes('<link rel="canonical"')) {
      failures.push(`Missing canonical URL: ${file}`);
    }

    if (html.includes("YOUR_") || html.includes("YOUR-DOMAIN")) {
      failures.push(`Unresolved placeholder: ${file}`);
    }
  }
} catch (error) {
  failures.push(`Unable to inspect generated HTML: ${error.message}`);
}

if (failures.length > 0) {
  console.error("Build verification failed:\n- " + failures.join("\n- "));
  process.exit(1);
}

console.log("Build verification passed.");
