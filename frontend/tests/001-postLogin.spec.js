import { test, expect } from "playwright-test-coverage";

test.describe("Home Page Shows Correctly", () => {
	test("Check if all needed things show", async ({ page }) => {
		await page.goto('http://localhost:5174/home');
		await expect(page.getByRole('heading', { name: 'StudyBuddy' })).toBeVisible();
		await expect(page.getByText('NavigationResource')).toBeVisible();
		await page.getByRole('heading', { name: 'Study Buddies' }).click();
		await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();
		await expect(page.getByText('Resources Upload')).toBeVisible();
		await expect(page.locator('div').filter({ hasText: 'Upcoming' }).nth(2)).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Group Studies' })).toBeVisible();
	});
});
