import { test, expect } from "@playwright/test";

// Uses real ARES API — requires network access.
// IČO 27082440 = Alza.cz a.s.  (verified via ARES)
// IČO 00000001 = does not exist in ARES (valid checksum, no entity)

test.describe("IČO search form", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("homepage shows the search form", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /vyhledat firmu/i }),
    ).toBeVisible();
    await expect(page.getByLabel(/IČO/)).toBeVisible();
    await expect(
      page.getByRole("button", { name: /ověřit firmu/i }),
    ).toBeVisible();
  });

  test("shows error for whitespace-only input", async ({ page }) => {
    // A space satisfies the HTML5 required attribute so the submit handler fires,
    // then validateIco trims it to "" and returns "Zadejte IČO."
    await page.getByLabel(/IČO/).fill(" ");
    await page.getByRole("button", { name: /ověřit firmu/i }).click();
    await expect(page.getByText("Zadejte IČO.")).toBeVisible();
  });

  test("shows error for non-digit input", async ({ page }) => {
    await page.getByLabel(/IČO/).fill("abc12");
    await page.getByRole("button", { name: /ověřit firmu/i }).click();
    await expect(
      page.getByText("IČO může obsahovat pouze číslice."),
    ).toBeVisible();
  });

  test("shows error for invalid checksum", async ({ page }) => {
    await page.getByLabel(/IČO/).fill("12345678");
    await page.getByRole("button", { name: /ověřit firmu/i }).click();
    await expect(
      page.getByText("IČO má neplatný kontrolní součet."),
    ).toBeVisible();
  });

  test("navigates to company detail page on valid IČO", async ({ page }) => {
    await page.getByLabel(/IČO/).fill("27082440");
    await page.getByRole("button", { name: /ověřit firmu/i }).click();
    await expect(page).toHaveURL(/\/firma\/27082440/);
  });
});

test.describe("Company detail page", () => {
  test("displays company information for Alza.cz (IČO 27082440)", async ({
    page,
  }) => {
    await page.goto("/firma/27082440");
    await expect(page.getByText(/alza/i)).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText("27082440", { exact: true })).toBeVisible();
  });

  test("shows 404 message for non-existent IČO", async ({ page }) => {
    await page.goto("/firma/00000001");
    await expect(
      page.getByText(/nebyla v ARES nalezena/i),
    ).toBeVisible({ timeout: 15_000 });
  });

  test("save button is present after company loads", async ({ page }) => {
    await page.goto("/firma/27082440");
    await expect(page.getByText(/alza/i)).toBeVisible({ timeout: 20_000 });
    await expect(
      page.getByRole("button", { name: /uložit|uložena/i }),
    ).toBeVisible();
  });
});

test.describe("Saved companies list", () => {
  test("saved companies page is reachable via navbar", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /moje firmy/i }).click();
    await expect(page).toHaveURL(/\/moje-firmy/);
  });

  test("shows empty state with link to search when no companies saved", async ({
    page,
  }) => {
    await page.goto("/moje-firmy");
    await expect(page.getByText(/zatím nemáte uložené/i)).toBeVisible();
    await expect(
      page.getByRole("link", { name: /vyhledat firmu/i }),
    ).toBeVisible();
  });
});
