import { test, expect } from "playwright-test-coverage";

test.describe("StudyBuddy Page Shows Correctly", () => {
	test("Check if all needed things show", async ({ page }) => {
		await page.goto('http://localhost:5174/home');
		await expect(page.getByRole('button', { name: 'Resource Feed' })).toBeVisible();
		await page.getByRole('button', { name: 'Resource Feed' }).click();
		await expect(page.getByRole('heading', { name: 'Resources' })).toBeVisible();
		await expect(page.getByRole('button', { name: 'Share' })).toBeVisible();
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
		await expect(page.getByRole('button', { name: 'Study Buddies' })).toBeVisible();
		await page.getByRole('button', { name: 'Study Buddies' }).click();
		await expect(page.getByRole('heading', { name: 'My Buddies' })).toBeVisible();
		await expect(page.getByRole('textbox', { name: 'Search friends...' })).toBeVisible();
		await expect(page.locator('div').filter({ hasText: /^DMDimpho Matea@Dimpho_MateaComputer • MIT FriendOnline Message Profile$/ }).getByRole('paragraph')).toBeVisible();
		await page.getByRole('button', { name: 'Profile' }).first().click();
		await expect(page.getByRole('heading', { name: 'Courses' })).toBeVisible();
		await expect(page.getByRole('heading', { name: 'About' })).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Interests' })).toBeVisible();
		await expect(page.getByText('Role')).toBeVisible();

	});
});