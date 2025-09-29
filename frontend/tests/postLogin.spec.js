import { test, expect } from "@playwright/test";

test.describe("Home Page Shows Correctly", () => {
	test("Check if all needed things show", async ({ page }) => {
		await page.goto('http://localhost:5173/home');
		await expect(page.getByRole('button', { name: 'Resource Feed' })).toBeVisible();
		await expect(page.getByRole('button', { name: 'Progress' })).toBeVisible();
		await expect(page.getByRole('button', { name: 'Study Buddies' })).toBeVisible();
		await expect(page.getByRole('button', { name: 'Friend Requests' })).toBeVisible();
		await expect(page.getByRole('button', { name: 'Study Groups' })).toBeVisible();
		await expect(page.getByRole('button', { name: 'Upload Resource' })).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Study Buddies' })).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Group Activities' })).toBeVisible();
		await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Upcoming Events' })).toBeVisible();
	});
});
