import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  testMatch: "**/*.pw.ts",
  workers: 1,
  retries: 0,
  use: { baseURL: "http://127.0.0.1:4199", trace: "retain-on-failure" },
  webServer: {
    command: "bun scripts/e2e-server.ts",
    url: "http://127.0.0.1:4199",
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
