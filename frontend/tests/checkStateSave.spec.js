import { test, expect } from "playwright-test-coverage";

test.describe("Home Saved state", () => {
	test.skip("Check if state works", async ({ page }) => {
		await page.goto("http://localhost:5173/home");

		// await page.getByRole('button', { name: 'Log In' }).click();

		// await page.getByRole('button', { name: 'Sign in with Google' })
		// .first()
		// .click();

		// const [popup] = await Promise.all([page.waitForEvent('popup')]);
		// await popup.waitForLoadState();

		// await popup.getByRole('link', { name: 'Test User' }).click();

		await page.waitForURL("http://localhost:5173/home");

		await expect(page.getByRole("button", { name: "Log In" })).not.toBeVisible();
		await expect(page.getByRole("button", { name: "Sign In" })).not.toBeVisible();
		await expect(page.getByRole("button", { name: "Logout" })).toBeVisible();
	});
});
