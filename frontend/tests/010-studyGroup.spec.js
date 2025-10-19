import { test, expect } from "playwright-test-coverage";

test.describe("Home Page Shows Correctly", () => {
test('test', async ({ page }) => {
  await page.goto('http://localhost:5174/home');
  await expect(page.getByRole('button', { name: 'Study Groups' })).toBeVisible();
  await page.getByRole('button', { name: 'Study Groups' }).click();
  await expect(page.getByRole('heading', { name: 'Study Groups' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Create Group' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Discover groups' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'My groups' })).toBeVisible();
  await page.getByRole('button', { name: 'My groups' }).click();
//   await expect(page.locator('span').filter({ hasText: 'CACH3090' })).toBeVisible();
//   await expect(page.getByRole('button', { name: 'View' })).toBeVisible();
//   await expect(page.getByRole('button', { name: 'Leave' })).toBeVisible();
//   await page.getByRole('button', { name: 'View' }).click();
//   await expect(page.getByRole('textbox', { name: 'Type your message...' })).toBeVisible();
//   await expect(page.getByRole('heading', { name: 'Trustgod_MOKGWADI' })).toBeVisible();

//   await page.getByRole('textbox', { name: 'Type your message...' }).click();
//   await page.getByRole('textbox', { name: 'Type your message...' }).press('CapsLock');
//   await page.getByRole('textbox', { name: 'Type your message...' }).fill('D');
//   await page.getByRole('textbox', { name: 'Type your message...' }).press('CapsLock');
//   await page.getByRole('textbox', { name: 'Type your message...' }).fill('Do the ');
//   await page.getByRole('textbox', { name: 'Type your message...' }).press('CapsLock');
//   await page.getByRole('textbox', { name: 'Type your message...' }).fill('Do the T');
//   await page.getByRole('textbox', { name: 'Type your message...' }).press('CapsLock');
//   await page.getByRole('textbox', { name: 'Type your message...' }).fill('Do the Thing.');
//   await page.locator('.send-btn').click();
//   await expect(page.getByText('Do the Thing.')).toBeVisible();
//   await expect(page.locator('.chat-header > button')).toBeVisible();
});
});
