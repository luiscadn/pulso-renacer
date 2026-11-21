import { defineConfig } from "@playwright/test";

/** Pruebas E2E contra la build de producción (`npm run build && npm start`) con la BD local de integración. */
const PUERTO = Number(process.env.E2E_PUERTO ?? 3100);

export default defineConfig({
  testDir: "./e2e",
  timeout: 120_000,
  expect: { timeout: 10_000 },
  workers: 1,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],
  outputDir: "test-results",
  use: {
    baseURL: `http://localhost:${PUERTO}`,
    locale: "es-CO",
    timezoneId: "America/Bogota",
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "movil-390", use: { viewport: { width: 390, height: 844 } } }],
  webServer: {
    command: `npm run build && npm run start -- -p ${PUERTO}`,
    url: `http://localhost:${PUERTO}/api/health`,
    reuseExistingServer: false,
    timeout: 300_000,
  },
});
