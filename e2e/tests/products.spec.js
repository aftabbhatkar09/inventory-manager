import { test, expect } from "@playwright/test";

import { SUPER_ADMIN } from "./constants.js";

test.describe("products", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[name="username"]', SUPER_ADMIN.username);
    await page.fill('input[name="password"]', SUPER_ADMIN.password);
    await page.click('button:has-text("Log In")');
    await expect(page).toHaveURL("/");
  });

  test("creates a product, finds it via search, edits it, then deletes it", async ({ page }) => {
    const name = `E2E Widget ${Date.now()}`;
    const sku = `E2E-${Date.now()}`;

    await page.goto("/products");
    await page.click('button:has-text("Add Product")');
    await page.fill('input[name="name"]', name);
    await page.fill('input[name="sku"]', sku);
    await page.click('button:has-text("Update Product"), button:has-text("Save Product"), button[type="submit"]');

    await expect(page).toHaveURL("/products");
    await expect(page.getByText(name)).toBeVisible();

    // Search narrows to just this product
    await page.fill('input[placeholder="Search by name, SKU, or category"]', sku);
    await page.waitForTimeout(500); // debounce
    await expect(page.getByText(name)).toBeVisible();
    const rows = page.locator(".divide-y > div");
    await expect(rows).toHaveCount(1);

    // Edit it
    await page.click(`button[aria-label="Edit product"]`);
    const newName = `${name} (edited)`;
    await page.fill('input[name="name"]', newName);
    await page.click('button:has-text("Update Product")');
    await expect(page).toHaveURL("/products");

    await page.fill('input[placeholder="Search by name, SKU, or category"]', sku);
    await page.waitForTimeout(500);
    await expect(page.getByText(newName)).toBeVisible();

    // Delete it
    page.once("dialog", (dialog) => dialog.accept());
    await page.click('button[aria-label="Delete product"]');
    await page.waitForTimeout(500);
    await expect(page.getByText(newName)).not.toBeVisible();
  });
});
