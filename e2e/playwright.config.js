import { defineConfig, devices } from "@playwright/test";

const CLIENT_URL = "http://localhost:5174";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false, // tests share one seeded database
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI
    ? [["line"], ["html", { open: "never" }]]
    : "html",
  use: {
    baseURL: CLIENT_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: [
    {
      command: "node start-test-api.mjs",
      url: "http://localhost:5050/",
      reuseExistingServer: false,
      timeout: 60_000,
      stdout: "pipe",
      stderr: "pipe",
    },
    {
      command: "npx vite --port 5174",
      cwd: "../client",
      url: CLIENT_URL,
      reuseExistingServer: false,
      timeout: 60_000,
      env: {
        VITE_API_URL: "http://localhost:5050/api",
        VITE_ENABLE_DEMO_LOGIN: "true",
      },
      stdout: "pipe",
      stderr: "pipe",
    },
  ],
});
