import { test, expect } from "playwright-test-coverage";

test.describe("Home Page Shows Correctly", () => {
	test("Check if all needed things show", async ({ page }) => {
		await page.goto('http://localhost:5173/home');
		await expect(page.getByRole('button').filter({ hasText: /^$/ }).first()).toBeVisible();
		await page.getByRole('button').filter({ hasText: /^$/ }).first().click();
		await page.waitForURL('http://localhost:5173/messages');
		await expect(page.getByRole('heading', { name: 'Chats' })).toBeVisible();
		await expect(page.getByText('DMDimpho Matea')).toBeVisible();
		await page.getByText('DMDimpho Matea').click();
		await expect(page.locator('h2').filter({ hasText: 'Dimpho Matea' })).toBeVisible();

	});
});
