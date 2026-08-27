import { test, expect } from "@playwright/test";

import { SUPER_ADMIN } from "./constants.js";

test.describe("role-based access", () => {
  test("a super admin can manage users; a plain admin cannot", async ({ page }) => {
    const stamp = Date.now();
    const newAdminUsername = `e2e-role-admin-${stamp}`;
    const newAdminPassword = "e2eRoleAdminPass123";

    // Super admin: Users nav visible, can create a plain admin account.
    await page.goto("/login");
    await page.fill('input[name="username"]', SUPER_ADMIN.username);
    await page.fill('input[name="password"]', SUPER_ADMIN.password);
    await page.click('button:has-text("Log In")');
    await expect(page).toHaveURL("/");

    await expect(page.getByRole("link", { name: "Users" })).toBeVisible();

    await page.goto("/users/createUser");
    await page.fill('input[name="username"]', newAdminUsername);
    await page.fill('input[name="password"]', newAdminPassword);
    await page.selectOption('select[name="role"]', "admin");
    await page.click('button:has-text("Save User")');
    await expect(page).toHaveURL("/users");
    await expect(page.getByText(newAdminUsername)).toBeVisible();

    await page.click('button:has-text("Log Out")');
    await expect(page).toHaveURL(/\/login/);

    // Plain admin: no Users nav, redirected away from /users, but full
    // access elsewhere.
    await page.fill('input[name="username"]', newAdminUsername);
    await page.fill('input[name="password"]', newAdminPassword);
    await page.click('button:has-text("Log In")');
    await expect(page).toHaveURL("/");

    await expect(page.getByRole("link", { name: "Users" })).not.toBeVisible();

    await page.goto("/users");
    await expect(page).toHaveURL("/"); // bounced back

    await page.goto("/products");
    await expect(page.getByRole("heading", { name: "Products" })).toBeVisible();
  });
});
