import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("home, analytics and mobile flow", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Painel analitico/i })).toBeVisible();

  await page.getByRole("link", { name: /Ver dados analiticos/i }).click();
  await expect(page).toHaveURL(/\/analytics/);
  await expect(page.getByRole("heading", { name: /Registros/i })).toBeVisible();
  await expect(page.getByRole("table")).toBeVisible();

  await page.goto("/");
  await page.getByRole("link", { name: /frontend mobile integrado/i }).click();
  await expect(page).toHaveURL(/\/mobile/);
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Mobile sections" })).toBeVisible();
});

test("basic accessibility scan on homepage", async ({ page }) => {
  await page.goto("/");

  const scan = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
  const highImpactViolations = scan.violations.filter((item) =>
    ["serious", "critical"].includes(item.impact ?? "")
  );

  expect(highImpactViolations).toEqual([]);
});
