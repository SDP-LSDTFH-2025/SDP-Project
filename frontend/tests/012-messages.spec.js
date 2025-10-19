import { test, expect } from "playwright-test-coverage";

test.describe("Home Page Shows Correctly", () => {

test('test', async ({ page }) => {
  await page.goto('http://localhost:5174/home');
  await expect(page.getByRole('button').filter({ hasText: /^$/ }).first()).toBeVisible();
  await page.getByRole('button').filter({ hasText: /^$/ }).first().click();
  await expect(page.getByRole('button', { name: 'Back to Home' })).toBeVisible();
  await expect(page.locator('h1')).toBeVisible();
});
});
