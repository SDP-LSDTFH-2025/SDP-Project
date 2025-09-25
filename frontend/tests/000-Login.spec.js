import { test, expect } from "@playwright/test";

import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const stateFile = path.join(__dirname, "./state/storageState.json");

test.describe("Login and Setup Process", () => {
	test("Login Test+Setup", async ({ page }) => {

			context.setDefaultTimeout(60000);

		
			const email = process.env.GOOGLE_TEST_EMAIL;
			const password = process.env.GOOGLE_TEST_PASSWORD;
		
			if (!email || !password) {
				console.warn("Google test credentials not found");
				return;
			}
		
			await page.goto("http://localhost:5173/");
			await page.waitForURL("http://localhost:5173/");
			await page.click('button:has-text("Log In")');
			await page.waitForURL("http://localhost:5173/login");
			await page
				.getByRole("button", { name: "Sign in with Google" })
				.first()
				.click();
		
			const [popup] = await Promise.all([page.waitForEvent("popup")]);
			await popup.waitForLoadState();
		
			await popup.fill('input[type="email"]', email);
			await popup.click('button:has-text("Next")');
		
			await popup.fill('input[type="password"]', password);
			await popup.click('button:has-text("Next")');
		
			const allowButton = popup.locator('button:has-text("Allow")');
			if (await allowButton.isVisible) {
				await allowButton.click();
			}
		
			await page.waitForURL("http://localhost:5173/home");
		
			await context.storageState({ path: stateFile });
	});
});
