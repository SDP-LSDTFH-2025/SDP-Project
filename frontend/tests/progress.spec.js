import { test, expect } from "playwright-test-coverage";

test.describe("Progress Page Shows Correctly", () => {
	test("Check if all needed things show", async ({ page }) => {
		await page.goto('http://localhost:5173/home');
		await expect(page.getByRole('button', { name: 'Progress' })).toBeVisible();
		await page.getByRole('button', { name: 'Progress' }).click();
		await expect(page.getByRole('heading', { name: 'Study Dashboard' })).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Study Streak' })).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Courses' })).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Course Progress' })).toBeVisible();
		await expect(page.getByRole('button', { name: 'View All' })).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Study Hours' })).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Group Sessions' })).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Upcoming Sessions' })).toBeVisible();
		await page.getByText('Study Streak7days in a row').click();
		await page.locator('div').filter({ hasText: /^Mathematics65%Physics42%Computer Science88%$/ }).locator('svg').first().click();
		await expect(page.getByRole('button', { name: 'Mark as done' })).toBeVisible();
		await expect(page.getByRole('button', { name: 'Add Topic' })).toBeVisible();
		await expect(page.getByRole('textbox', { name: 'Add a new topic...' })).toBeVisible();
		await page.getByRole('textbox', { name: 'Add a new topic...' }).click();
		await page.getByRole('textbox', { name: 'Add a new topic...' }).press('CapsLock');
		await page.getByRole('textbox', { name: 'Add a new topic...' }).fill('S');
		await page.getByRole('textbox', { name: 'Add a new topic...' }).press('CapsLock');
		await page.getByRole('textbox', { name: 'Add a new topic...' }).fill('Summations');
		await page.getByRole('button', { name: 'Add Topic' }).click();
		await expect(page.getByText('Summations')).toBeVisible();
		// await page.getByRole('listitem').filter({ hasText: 'SummationsMark as done' }).getByRole('button').click();
		// await page.locator('div').filter({ hasText: /^Mathematics65%$/ }).locator('path').click();
		// await page.locator('div').filter({ hasText: /^Calculus Study Group2025-09-30View$/ }).getByRole('button').click();
		// await expect(page.getByRole('heading', { name: 'Calculus Study Group' })).toBeVisible();
		// await expect(page.getByText('Description:')).toBeVisible();
		// await page.getByRole('button', { name: 'Close' }).click();


	});
});
