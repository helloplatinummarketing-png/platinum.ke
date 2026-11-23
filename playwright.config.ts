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
    // Layer 1 and everything that must work with JavaScript off
    {
      name: "no-js 320px",
      testIgnore: /layer2|layer3/,
      use: { javaScriptEnabled: false, viewport: { width: 320, height: 720 } },
    },
    {
      name: "no-js 1280px",
      testIgnore: /layer2|layer3/,
      use: { javaScriptEnabled: false, viewport: { width: 1280, height: 800 } },
    },
    // Layers 2 and 3 (JavaScript on)
    {
      name: "js 390px",
      testMatch: /layer2|layer3/,
      use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
    },
    { name: "js 1280px", testMatch: /layer2|layer3/, use: { viewport: { width: 1280, height: 800 } } },
  ],
});
