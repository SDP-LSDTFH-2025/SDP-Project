import { test, expect } from "playwright-test-coverage";

test.describe("Home Page Shows Correctly", () => {
test('test', async ({ page }) => {
  await page.goto('http://localhost:5174/home#notifications');
  await expect(page.getByRole('button', { name: 'Notifications' }).nth(1)).toBeVisible();
  await page.getByRole('button', { name: 'Notifications' }).nth(1).click();
  await expect(page.locator('h2')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Show All' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Mark all as read' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Clear All' })).toBeVisible();
  await expect(page.getByRole('main').filter({ hasText: 'NavigationResource' }).getByRole('main')).toBeVisible();
  await page.getByRole('button', { name: 'Show All' }).click();
  await expect(page.getByRole('button', { name: 'Show Unread' })).toBeVisible();
  await page.getByRole('button', { name: 'Show Unread' }).click();
});
});
