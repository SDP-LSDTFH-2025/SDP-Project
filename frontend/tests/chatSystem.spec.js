import { test, expect } from "playwright-test-coverage";

test.describe("Chat Page Shows Correctly", () => {
	test("Check if all needed things show", async ({ page }) => {
		await page.goto('http://localhost:5173/home');
		await expect(page.getByRole('button').filter({ hasText: /^$/ }).first()).toBeVisible();
		await page.getByRole('button').filter({ hasText: /^$/ }).first().click();
		await page.waitForURL('http://localhost:5173/messages');
		await expect(page.getByRole('heading', { name: 'Chats' })).toBeVisible();
		await expect(page.getByText('DMDimpho Matea')).toBeVisible();
		await page.getByText('DMDimpho Matea').click();
		await expect(page.locator('h2').filter({ hasText: 'Dimpho Matea' })).toBeVisible();

		await expect(page.getByRole('textbox', { name: 'Type a message...' })).toBeVisible();
		await expect(page.getByRole('button')).toBeVisible();
		await page.getByRole('textbox', { name: 'Type a message...' }).click();
		await page.getByRole('textbox', { name: 'Type a message...' }).press('CapsLock');
		await page.getByRole('textbox', { name: 'Type a message...' }).fill('H');
		await page.getByRole('textbox', { name: 'Type a message...' }).press('CapsLock');
		await page.getByRole('textbox', { name: 'Type a message...' }).fill('Hello ');
		await page.getByRole('textbox', { name: 'Type a message...' }).press('CapsLock');
		await page.getByRole('textbox', { name: 'Type a message...' }).fill('Hello D');
		await page.getByRole('textbox', { name: 'Type a message...' }).press('CapsLock');
		await page.getByRole('textbox', { name: 'Type a message...' }).fill('Hello Dude ');
		await page.getByRole('textbox', { name: 'Type a message...' }).press('CapsLock');
		await page.getByRole('textbox', { name: 'Type a message...' }).fill('Hello Dude T');
		await page.getByRole('textbox', { name: 'Type a message...' }).press('CapsLock');
		await page.getByRole('textbox', { name: 'Type a message...' }).fill('Hello Dude Tesing ');
		await page.getByRole('textbox', { name: 'Type a message...' }).press('CapsLock');
		await page.getByRole('textbox', { name: 'Type a message...' }).fill('Hello Dude Tesing H');
		await page.getByRole('textbox', { name: 'Type a message...' }).press('CapsLock');
		await page.getByRole('textbox', { name: 'Type a message...' }).fill('Hello Dude Tesing Here.');
		await page.getByRole('textbox', { name: 'Type a message...' }).press('ArrowLeft');
		await page.getByRole('textbox', { name: 'Type a message...' }).press('ArrowLeft');
		await page.getByRole('textbox', { name: 'Type a message...' }).press('ArrowLeft');
		await page.getByRole('textbox', { name: 'Type a message...' }).press('ArrowLeft');
		await page.getByRole('textbox', { name: 'Type a message...' }).press('ArrowLeft');
		await page.getByRole('textbox', { name: 'Type a message...' }).press('ArrowLeft');
		await page.getByRole('textbox', { name: 'Type a message...' }).press('ArrowLeft');
		await page.getByRole('textbox', { name: 'Type a message...' }).press('ArrowLeft');
		await page.getByRole('textbox', { name: 'Type a message...' }).press('ArrowLeft');
		await page.getByRole('textbox', { name: 'Type a message...' }).fill('Hello Dude Testing Here.');
		await page.getByRole('button').click();
		await expect(page.locator('div').filter({ hasText: /^Hello Dude Testing Here\.09:07 AM$/ }).getByRole('paragraph')).toBeVisible();

	});
});
