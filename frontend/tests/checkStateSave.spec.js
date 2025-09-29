import { test, expect } from "playwright-test-coverage";

test.describe("Home Saved state", () => {
	test("Check if state works", async ({ page }) => {
		await page.goto("http://localhost:5173/home");

		await expect(page.getByRole("button", { name: "logout" })).toBeVisible();
	});
});
