import { defineConfig, devices } from "@playwright/test";

// Les pages sont servies telles quelles, comme par GitHub Pages, et testées
// sur un écran de téléphone : c'est là qu'elles servent.
export default defineConfig({
  testDir: "tests",
  testMatch: "*.spec.mjs",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: "http://127.0.0.1:8123",
    ...devices["Pixel 7"],
    locale: "fr-FR",
    timezoneId: "Europe/Paris",
    trace: "retain-on-failure"
  },
  // En CI, le Google Chrome déjà installé sur la machine de GitHub : rien à
  // télécharger, alors que le téléchargement de Chromium à chaque exécution
  // a bloqué la CI jusqu'à son délai. En local, le Chromium de Playwright.
  projects: [{ name: "mobile", use: { browserName: "chromium", ...(process.env.CI ? { channel: "chrome" } : {}) } }],
  webServer: {
    command: "python3 -m http.server 8123 --bind 127.0.0.1",
    url: "http://127.0.0.1:8123/index.html",
    reuseExistingServer: !process.env.CI,
    stderr: "ignore"
  }
});
