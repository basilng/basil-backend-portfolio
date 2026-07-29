import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const pages = [
  { path: "/", heading: /engineering backend systems/i },
  { path: "/projects/", heading: /projects and architecture case studies/i },
  { path: "/resume/", heading: /basil n g/i },
  { path: "/projects/ecommerce-platform/", heading: /e-commerce microservices platform/i }
];

for (const pageUnderTest of pages) {
  test(`${pageUnderTest.path} has no serious accessibility violations`, async ({ page }) => {
    await page.goto(pageUnderTest.path);
    await expect(
      page.getByRole("heading", { level: 1, name: pageUnderTest.heading })
    ).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    const blockingViolations = results.violations.filter((violation) =>
      ["serious", "critical"].includes(violation.impact ?? "")
    );

    expect(blockingViolations).toEqual([]);
  });
}

test("resume download is available", async ({ page }) => {
  await page.goto("/resume/");
  const resume = page.getByRole("link", { name: /download pdf resume/i });
  await expect(resume).toHaveAttribute("href", "/resume/basil-ng-resume.pdf");
  await expect(resume).toHaveAttribute("download", "");
});

test("keyboard skip link moves focus to main content", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");

  const skipLink = page.getByRole("link", { name: /skip to main content/i });
  await expect(skipLink).toBeFocused();

  await page.keyboard.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();
});

test("layout does not overflow a 320 pixel viewport", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/");

  const sizes = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth
  }));

  expect(sizes.content).toBeLessThanOrEqual(sizes.viewport);
});

test("new-tab links isolate the opener", async ({ page }) => {
  await page.goto("/");
  const links = page.locator('a[target="_blank"]');

  for (let index = 0; index < (await links.count()); index += 1) {
    const rel = (await links.nth(index).getAttribute("rel")) ?? "";
    expect(rel.split(/\s+/)).toEqual(expect.arrayContaining(["noopener", "noreferrer"]));
  }
});
