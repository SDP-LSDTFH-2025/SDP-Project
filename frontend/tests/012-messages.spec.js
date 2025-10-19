import { test, expect } from "playwright-test-coverage";

test.describe("Home Page Shows Correctly", () => {
test('test', async ({ page }) => {
	  test.setTimeout(240000); 

  await expect(page.getByRole('button', { name: 'Messages' })).toBeVisible();
  await page.getByRole('button', { name: 'Messages' }).click();

  await expect(page.getByRole('button', { name: 'Progress' })).toBeVisible();
  await page.getByRole('button', { name: 'Messages' }).click();
  await page.waitForTimeout(30000); 
  await page.getByRole('button', { name: 'Notifications' }).nth(1).click();
  await page.waitForTimeout(30000); 
  await page.getByRole('button', { name: 'Messages' }).click();

  await expect(page.getByRole('heading', { name: 'Messages' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Back to Home' })).toBeVisible();
  await expect(page.locator('div').filter({ hasText: /^Chats$/ }).nth(1)).toBeVisible();
  await expect(page.locator('.chat-window')).toBeVisible();
  await page.getByText('Dimpho Matea22:').click();
  await expect(page.getByRole('button', { name: 'Start video call' })).toBeVisible();
  await expect(page.locator('.whatsapp-input-container')).toBeVisible();
  await page.getByRole('button', { name: 'Back to Home' }).click();
});
});
