import { test, expect } from "@playwright/test";

import { SUPER_ADMIN, DEMO_ADMIN } from "./constants.js";

test.describe("authentication", () => {
  test("redirects an unauthenticated visitor away from a protected route", async ({ page }) => {
    await page.goto("/products");
    await expect(page).toHaveURL(/\/login/);
  });

  test("rejects invalid credentials with an error toast", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[name="username"]', "nobody");
    await page.fill('input[name="password"]', "wrong-password");
    await page.click('button:has-text("Log In")');

    await expect(page.getByText(/invalid username or password/i)).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test("logs in with valid credentials and reaches the dashboard", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[name="username"]', SUPER_ADMIN.username);
    await page.fill('input[name="password"]', SUPER_ADMIN.password);
    await page.click('button:has-text("Log In")');

    await expect(page).toHaveURL("/");
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  });

  test("the demo login button signs in as the seeded demo admin account", async ({ page }) => {
    await page.goto("/login");
    await page.click('button:has-text("Log In as Demo User")');

    await expect(page).toHaveURL("/");
    await expect(page.getByText(`Signed in as ${DEMO_ADMIN.username}`)).toBeVisible();
  });

  test("logout clears the session and does not fire a stray /me request", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[name="username"]', SUPER_ADMIN.username);
    await page.fill('input[name="password"]', SUPER_ADMIN.password);
    await page.click('button:has-text("Log In")');
    await expect(page).toHaveURL("/");
    // Let the dashboard's own data fetches settle before watching for
    // requests -- otherwise their tail end gets misattributed to logout.
    await page.waitForLoadState("networkidle");

    const requestsAfterLogout = [];
    page.on("request", (req) => {
      if (req.url().includes("/api/")) requestsAfterLogout.push(req.url());
    });

    await page.click('button:has-text("Log Out")');
    await expect(page).toHaveURL(/\/login/);
    await page.waitForTimeout(500);

    // Regression test: logout used to also fire a doomed getMe refetch
    // (see commit "Stop logout from triggering a doomed refetch of getMe").
    const nonLogoutCalls = requestsAfterLogout.filter((url) => !url.endsWith("/auth/logout"));
    expect(nonLogoutCalls).toEqual([]);

    // Session is genuinely gone, not just a client-side redirect.
    await page.goto("/products");
    await expect(page).toHaveURL(/\/login/);
  });
});
