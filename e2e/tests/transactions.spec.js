import { test, expect } from "@playwright/test";

import { SUPER_ADMIN } from "./constants.js";

test.describe("transaction stock validation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[name="username"]', SUPER_ADMIN.username);
    await page.fill('input[name="password"]', SUPER_ADMIN.password);
    await page.click('button:has-text("Log In")');
    await expect(page).toHaveURL("/");
  });

  test("a purchase adds stock, a sale within stock succeeds, an oversell is blocked", async ({ page }) => {
    const stamp = Date.now();
    const godownName = `E2E Godown ${stamp}`;
    const productName = `E2E Gadget ${stamp}`;
    const supplierName = `E2E Supplier ${stamp}`;
    const customerName = `E2E Customer ${stamp}`;

    // Set up a godown, a product, and both party types.
    await page.goto("/godowns/createGodown");
    await page.fill('input[name="name"]', godownName);
    await page.click('button:has-text("Save Godown")');
    await expect(page).toHaveURL("/godowns");

    await page.goto("/products/createProduct");
    await page.fill('input[name="name"]', productName);
    await page.fill('input[name="sku"]', `SKU-${stamp}`);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL("/products");

    await page.goto("/parties/createParty");
    await page.fill('input[name="name"]', supplierName);
    await page.check('label:has-text("Supplier") input[type="checkbox"]');
    await page.click('button:has-text("Save Party")');
    await expect(page).toHaveURL("/parties");

    await page.goto("/parties/createParty");
    await page.fill('input[name="name"]', customerName);
    await page.check('label:has-text("Customer") input[type="checkbox"]');
    await page.click('button:has-text("Save Party")');
    await expect(page).toHaveURL("/parties");

    // Purchase 10 units -- adds stock.
    await page.goto("/transactions/createTransaction");
    await page.selectOption('select[name="type"]', "purchase");
    await page.selectOption('select[name="party"]', { label: supplierName });
    await page.selectOption('select[name="godown"]', { label: godownName });
    await page.selectOption('select >> nth=3', { label: productName }); // first product-row select
    await page.fill('input[placeholder="Qty"]', "10");
    await page.fill('input[placeholder="Price"]', "10");
    await page.click('button:has-text("Create Transaction")');
    await expect(page).toHaveURL("/transactions");

    // Sell 4 units -- within the 10 in stock, should succeed.
    await page.goto("/transactions/createTransaction");
    await page.selectOption('select[name="type"]', "sale");
    await page.selectOption('select[name="party"]', { label: customerName });
    await page.selectOption('select[name="godown"]', { label: godownName });
    await page.selectOption('select >> nth=3', { label: productName });
    await page.fill('input[placeholder="Qty"]', "4");
    await page.fill('input[placeholder="Price"]', "15");
    await page.click('button:has-text("Create Transaction")');
    await expect(page).toHaveURL("/transactions");

    // Attempt to sell 100 more -- only 6 remain, should be blocked.
    await page.goto("/transactions/createTransaction");
    await page.selectOption('select[name="type"]', "sale");
    await page.selectOption('select[name="party"]', { label: customerName });
    await page.selectOption('select[name="godown"]', { label: godownName });
    await page.selectOption('select >> nth=3', { label: productName });
    await page.fill('input[placeholder="Qty"]', "100");
    await page.fill('input[placeholder="Price"]', "15");
    await page.click('button:has-text("Create Transaction")');

    await expect(page.getByText(/not enough stock/i)).toBeVisible();
    await expect(page).toHaveURL("/transactions/createTransaction"); // stayed put, not created
  });
});
