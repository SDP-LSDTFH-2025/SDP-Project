import { test, expect } from 'playwright-test-coverage';

test('test', async ({ page }) => {
	await page.goto('http://localhost:5173/home');
	await expect(page.getByRole('button').filter({ hasText: /^$/ }).nth(2)).toBeVisible();
	await page.getByRole('button').filter({ hasText: /^$/ }).nth(2).click();
	await expect(page.getByRole('button', { name: 'Edit' })).toBeVisible();
	await expect(page.getByRole('heading', { name: 'Courses' })).toBeVisible();
	await expect(page.getByRole('heading', { name: 'About' })).toBeVisible();
	await expect(page.getByText('Role:')).toBeVisible();
	await expect(page.getByText('Year of Study:')).toBeVisible();
	await expect(page.getByText('Last Login:')).toBeVisible();
	await expect(page.getByRole('heading', { name: 'About' })).toBeVisible();
	await expect(page.getByRole('heading', { name: 'Interests' })).toBeVisible();

  	await expect(page.getByRole('button').filter({ hasText: /^$/ }).nth(2)).toBeVisible();
	await page.getByRole('button').filter({ hasText: /^$/ }).nth(2).click();

	await page.getByRole('button', { name: 'Edit' }).click();
	await expect(page.getByText('Username')).toBeVisible();
	await expect(page.getByText('Course', { exact: true })).toBeVisible();
	await expect(page.getByText('Institution')).toBeVisible();
	await expect(page.getByText('Faculty')).toBeVisible();
	await expect(page.getByRole('button', { name: 'Save' })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
});