import { test, expect } from "playwright-test-coverage";

test.describe("Home Page Shows Correctly", () => {
	test("Check if all needed things show", async ({ page }) => {
		await page.goto('http://localhost:5174/home');

		await expect(page.getByRole('button').filter({ hasText: /^$/ }).nth(3)).toBeVisible();
		await page.getByRole('button').filter({ hasText: /^$/ }).nth(3).click();

		await expect(page.getByRole('button', { name: 'Edit' })).toBeVisible();
		await expect(page.locator('#root section').getByRole('button', { name: 'Messages' })).toBeVisible();
		await expect(page.getByText('SUSDP-TLSDF undefined@SDP-')).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Courses' })).toBeVisible();
		await expect(page.getByRole('heading', { name: 'About' })).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Interests' })).toBeVisible();

		
		await page.getByRole('button', { name: 'Edit' }).click();
		await expect(page.getByRole('button', { name: 'Save' })).toBeVisible();
		await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
		await expect(page.getByText('Username')).toBeVisible();
		await expect(page.getByText('Course', { exact: true })).toBeVisible();
		await expect(page.getByText('Institution')).toBeVisible();
		await expect(page.getByText('Faculty')).toBeVisible();
		await page.locator('div').filter({ hasText: /^Faculty$/ }).getByRole('textbox').click();
		await page.locator('div').filter({ hasText: /^Faculty$/ }).getByRole('textbox').press('ArrowLeft');
		await page.locator('div').filter({ hasText: /^Faculty$/ }).getByRole('textbox').press('ArrowLeft');
		await page.locator('div').filter({ hasText: /^Faculty$/ }).getByRole('textbox').press('ArrowLeft');
		await page.locator('div').filter({ hasText: /^Faculty$/ }).getByRole('textbox').press('ArrowLeft');
		await page.locator('div').filter({ hasText: /^Faculty$/ }).getByRole('textbox').press('ArrowLeft');
		await page.locator('div').filter({ hasText: /^Faculty$/ }).getByRole('textbox').press('ArrowLeft');
		await page.locator('div').filter({ hasText: /^Faculty$/ }).getByRole('textbox').press('ArrowLeft');
		await page.locator('div').filter({ hasText: /^Faculty$/ }).getByRole('textbox').fill('edicine');
		await page.locator('div').filter({ hasText: /^Faculty$/ }).getByRole('textbox').press('CapsLock');
		await page.locator('div').filter({ hasText: /^Faculty$/ }).getByRole('textbox').fill('Medicine');
		await page.locator('div').filter({ hasText: /^Faculty$/ }).getByRole('textbox').press('CapsLock');
		await page.getByRole('button', { name: 'Save' }).click();
		await expect(page.getByText('student • Medicine')).toBeVisible();
	});
});
