import { test, expect } from "playwright-test-coverage";

test.describe("StudyBuddy Page Shows Correctly", () => {
	test("Check if all needed things show", async ({ page }) => {
		await page.goto('http://localhost:5173/home');
		await expect(page.getByRole('button').filter({ hasText: /^$/ }).nth(1)).toBeVisible();
		await page.getByRole('button').filter({ hasText: /^$/ }).nth(1).click();
		await page.waitForURL('http://localhost:5173/notifications');
		await expect(page.getByRole('heading', { name: 'Notifications' })).toBeVisible();
		await expect(page.getByRole('button', { name: 'Show Unread' })).toBeVisible();
		await expect(page.getByRole('button', { name: 'Mark all as read' })).toBeVisible();
		await expect(page.getByRole('button', { name: 'Clear All' })).toBeVisible();
		await expect(page.getByRole('main').locator('svg').first()).toBeVisible();
		await page.locator('div').filter({ hasText: 'New Friend Request2 min' }).nth(2).click();

	});
});
