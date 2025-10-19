import { test, expect } from "playwright-test-coverage";

test.describe("Home Page Shows Correctly", () => {
	test("Check if all needed things show", async ({ page }) => {
		await page.goto('http://localhost:5174/home');
  await expect(page.getByRole('button', { name: 'Notifications' })).toBeVisible();
  await expect(page.getByRole('button').filter({ hasText: /^$/ }).nth(2)).toBeVisible();
  await page.getByRole('button', { name: 'Notifications' }).click();
  await expect(page.getByRole('button', { name: 'Show Unread' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Mark all as read' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Clear All' })).toBeVisible();
  await expect(page.locator('h1').filter({ hasText: 'Notifications' })).toBeVisible();
  await expect(page.getByRole('main').filter({ hasText: 'NavigationResource' }).getByRole('main')).toBeVisible();
	});
});
