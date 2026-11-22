import { defineConfig, devices } from "@playwright/test";

// The app is built against a same-origin fake API path; tests answer those requests with
// page.route(), so no backend, database or model is needed.
const PORT = 3100;
export const MOCK_API = `http://localhost:${PORT}/mock-api`;

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: { baseURL: `http://localhost:${PORT}`, trace: "retain-on-failure" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `npm run build && npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    timeout: 240_000,
    reuseExistingServer: !process.env.CI,
    env: { NEXT_PUBLIC_API_URL: MOCK_API, NEXT_TELEMETRY_DISABLED: "1" },
  },
});
