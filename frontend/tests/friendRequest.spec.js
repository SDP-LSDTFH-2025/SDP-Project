import { test, expect } from "playwright-test-coverage";

test.describe("Friend Request Page Shows Correctly", () => {
	test("Check if all needed things show", async ({ page }) => {
		await page.goto('http://localhost:5173/home');
		await expect(page.getByRole('button', { name: 'Friend Requests' })).toBeVisible();
		await page.getByRole('button', { name: 'Friend Requests' }).click();
		const loader = await page.locator('div').filter({ hasText: /^Loading friends\.\.\.$/ }).getByRole('paragraph');

		await loader.waitFor({ state: 'hidden' });
		
		await expect(page.getByRole('heading', { name: 'Friend Requests' })).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Suggested Study Buddies' })).toBeVisible();
		await expect(page.locator('div').filter({ hasText: /^MmveloUnknown • N\/AAdd Friend$/ }).getByRole('button')).toBeVisible();
		await page.locator('div').filter({ hasText: /^MmveloUnknown • N\/AAdd Friend$/ }).getByRole('button').click();


	});
});
