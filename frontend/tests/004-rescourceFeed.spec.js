import { test, expect } from "playwright-test-coverage";

test.describe("Rescource Feed Page Shows Correctly", () => {
	test("Check if all needed things show", async ({ page }) => {
		await page.goto('http://localhost:5174/home');
		await expect(page.getByRole('button', { name: 'Resource Feed' })).toBeVisible();
		await page.getByRole('button', { name: 'Resource Feed' }).click();
		await expect(page.getByRole('heading', { name: 'Resources' })).toBeVisible();
		// await expect(page.getByRole('button', { name: 'Share' })).toBeVisible();
		await expect(page.locator('.file-preview').first()).toBeVisible();
		await expect(page.getByRole('textbox', { name: 'Search resource by Title,' })).toBeVisible();
		await expect(page.locator('.download-btn').first()).toBeVisible();
		await expect(page.locator('.comment-input > button').first()).toBeVisible();
		await expect(page.locator('.file-actions').first()).toBeVisible();
		await page.locator('.lucide.lucide-heart').first().click();
		await page.locator('.lucide.lucide-heart').first().click();
		await page.locator('span:nth-child(2) > .lucide').first().click();
		await page.locator('span:nth-child(3) > .lucide > line:nth-child(5)').first().click();
		await page.locator('.comment-input > input').first().click();

	});
});