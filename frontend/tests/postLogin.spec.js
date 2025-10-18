import { test, expect } from "playwright-test-coverage";

test.describe("Home Page Shows Correctly", () => {
	test("Check if all needed things show", async ({ page }) => {
		await page.goto('http://localhost:5174/home');

	});
});
