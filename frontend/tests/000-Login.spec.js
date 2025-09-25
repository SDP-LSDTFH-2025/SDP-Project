import { test, expect } from "@playwright/test";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const stateFile = path.join(__dirname, "./state/storageState.json");

test.describe("Login and Setup Process", () => {
  test("Login Test + Setup", async ({ page, context }) => {
    // Set default timeout for the entire context
    context.setDefaultTimeout(60000);

    const email = process.env.GOOGLE_TEST_EMAIL;
    const password = process.env.GOOGLE_TEST_PASSWORD;

    if (!email || !password) {
      throw new Error("Google test credentials not found. Please set GOOGLE_TEST_EMAIL and GOOGLE_TEST_PASSWORD.");
    }

    // Navigate to the initial page
    await page.goto("http://localhost:5173/");
    await page.waitForURL("http://localhost:5173/");

    // Click the "Log In" button
    await page.click('button:has-text("Log In")');
    await page.waitForURL("http://localhost:5173/login");

    // Click the "Sign in with Google" button
    await page.getByRole("button", { name: "Sign in with Google" }).first().click();

    // Wait for the popup and handle it
    const [popup] = await Promise.all([page.waitForEvent("popup")]);
    await popup.waitForLoadState();

    // Fill in the email and click "Next"
    await popup.fill('input[type="email"]', email);
    await popup.click('button:has-text("Next")');

    // Fill in the password and click "Next"
    await popup.fill('input[type="password"]', password);
    await popup.click('button:has-text("Next")');

    // Handle the "Allow" button, if it exists
    const allowButton = popup.locator('button:has-text("Allow")');
    if (await allowButton.isVisible()) {
      await allowButton.click();
    }

    // Wait for the page to navigate to the home screen
    await page.waitForURL("http://localhost:5173/home");

    // Save the storage state for session persistence
    await context.storageState({ path: stateFile });
  });
});
