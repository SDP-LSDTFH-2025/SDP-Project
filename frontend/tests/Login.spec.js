import { test, expect } from 'playwright-test-coverage';

test.describe('Home page spec', () => {
  test('Finds Relevant Buttons', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    
    await expect(page.getByRole('button', { name: 'Log In' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign Up' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Get Started' }).first()).toBeVisible();
  });
});

test.describe('Login spec', () => {
  test('Login Process', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    
    await page.getByRole('button', { name: 'Log In' }).click();
    await expect(page).toHaveURL('http://localhost:5173/login');
    
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    // await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Sign in with Google/ }).first()).toBeVisible() });

  });

