import { defineConfig } from "@playwright/test";

/**
 * Tests run against the real production build (`npm run build` first),
 * in the Microsoft Edge already installed on this computer.
 * Run: npm test
 */
export default defineConfig({
  testDir: "tests",
  outputDir: "test-results",
  fullyParallel: true,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:3200",
    channel: "msedge",
  },
  webServer: {
    command: "npx next start -p 3200",
    url: "http://localhost:3200",
    reuseExistingServer: true,
    timeout: 60_000,
  },
  projects: [
    { name: "no-js 320px", use: { javaScriptEnabled: false, viewport: { width: 320, height: 720 } } },
    { name: "no-js 1280px", use: { javaScriptEnabled: false, viewport: { width: 1280, height: 800 } } },
  ],
});
