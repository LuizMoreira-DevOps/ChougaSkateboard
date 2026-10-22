import { defineConfig } from "@playwright/test";

// Ambiente local dedicado. A API Supabase é interceptada por testes/e2e/helpers.
// Não reutiliza localhost:3000 nem consulta o banco Development/Production.
const baseURL = "http://127.0.0.1:3100";

export default defineConfig({
    testDir: "./tests/e2e",
    fullyParallel: false,
    forbidOnly: Boolean(process.env.CI),
    retries: process.env.CI ? 1 : 0,
    workers: process.env.CI ? 1 : 2,
    reporter: [["list"], ["html", { open: "never" }]],
    timeout: 40_000,
    expect: { timeout: 12_000 },
    use: {
        baseURL,
        browserName: "chromium",
        headless: true,
        trace: "retain-on-failure",
        screenshot: "only-on-failure",
    },
    projects: [
        { name: "mobile-320", use: { viewport: { width: 320, height: 608 } } },
        { name: "mobile-390", use: { viewport: { width: 390, height: 608 } } },
        { name: "tablet-768", use: { viewport: { width: 768, height: 608 } } },
        { name: "desktop-1440", use: { viewport: { width: 1440, height: 869 } } },
    ],
    webServer: {
        command: "npm run dev -- --hostname 127.0.0.1 --port 3100",
        url: `${baseURL}/loja`,
        timeout: 120_000,
        reuseExistingServer: false, // evita reaproveitar um servidor com env de produção
        env: {
            GITHUB_PAGES: "false",
            NEXT_PUBLIC_SUPABASE_URL: "https://chougae2etest.supabase.co",
            NEXT_PUBLIC_SUPABASE_DEV_PROJECT_REF: "chougae2etest",
            NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_e2e_mock_only",
        },
    },
});
