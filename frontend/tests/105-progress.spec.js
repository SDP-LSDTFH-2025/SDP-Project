import { test, expect } from "playwright-test-coverage";

test.describe("Progress Page Shows Correctly", () => {
test('test', async ({ page }) => {
  test.setTimeout(240000); 

  await page.goto('http://localhost:5174/home');
  await expect(page.getByRole('button', { name: 'Progress' })).toBeVisible();
  await page.getByRole('button', { name: 'Progress' }).click();
  await page.waitForTimeout(30000); 
  await page.getByRole('button', { name: 'Notifications' }).nth(1).click();
  await page.waitForTimeout(30000); 
  await page.getByRole('button', { name: 'Progress' }).click();

  await expect(page.getByRole('heading', { name: 'Study Dashboard' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Course Progress' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Upcoming Sessions' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Study Streak' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Study Hours' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Courses' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'View All' })).toBeVisible();
  await page.getByRole('button', { name: 'View All' }).click();
  await expect(page.getByRole('button', { name: 'Show Less' })).toBeVisible();
  await expect(page.locator('.lucide.lucide-chevron-right').first()).toBeVisible();
  await page.locator('.lucide.lucide-chevron-right').first().click();
  await expect(page.getByRole('textbox', { name: 'Add a new topic...' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Add Topic' })).toBeVisible();
  await page.getByRole('textbox', { name: 'Add a new topic...' }).click();
  await page.getByRole('textbox', { name: 'Add a new topic...' }).press('CapsLock');
  await page.getByRole('textbox', { name: 'Add a new topic...' }).fill('H');
  await page.getByRole('textbox', { name: 'Add a new topic...' }).press('CapsLock');
  await page.getByRole('textbox', { name: 'Add a new topic...' }).fill('Heart');
  await expect(page.getByText('Completed')).toBeVisible();
  await expect(page.locator('div').filter({ hasText: /^Calculus Study Group2025-09-30View$/ }).getByRole('button')).toBeVisible();
  await page.locator('div').filter({ hasText: /^Calculus Study Group2025-09-30View$/ }).getByRole('button').click();
  await expect(page.getByText('Description:')).toBeVisible();
  await expect(page.getByText('Location:')).toBeVisible();
  await page.getByText('Category:').click();
  await expect(page.getByRole('button', { name: 'Close' })).toBeVisible();
  await page.getByRole('button', { name: 'Close' }).click();
});
});