import { test, expect } from "playwright-test-coverage";

test.describe("Logging out Page Shows Correctly", () => {
	test("Check if all needed things show", async ({ page }) => {
		await page.goto('http://localhost:5173/home');
        await page.getByRole('button', { name: 'Logout' }).click();
        await page.getByRole('link', { name: 'Forgot password?' }).click();
        await page.getByRole('textbox', { name: 'Enter your email' }).click();
        await page.getByRole('textbox', { name: 'Enter your email' }).fill('example.gamil.com');
        await page.getByRole('textbox', { name: 'Enter your email' }).click();
        await page.getByRole('textbox', { name: 'Enter your email' }).press('ArrowLeft');
        await page.getByRole('textbox', { name: 'Enter your email' }).press('ArrowLeft');
        await page.getByRole('textbox', { name: 'Enter your email' }).press('ArrowLeft');
        await page.getByRole('textbox', { name: 'Enter your email' }).press('ArrowLeft');
        await page.getByRole('textbox', { name: 'Enter your email' }).fill('example.gmail.com');
        await page.getByRole('button', { name: 'Reset Password' }).click();
        await page.getByRole('textbox', { name: 'Enter your email' }).click();
        await page.getByRole('textbox', { name: 'Enter your email' }).press('ArrowLeft');
        await page.getByRole('textbox', { name: 'Enter your email' }).press('ArrowLeft');
        await page.getByRole('textbox', { name: 'Enter your email' }).press('ArrowLeft');
        await page.getByRole('textbox', { name: 'Enter your email' }).press('ArrowLeft');
        await page.getByRole('textbox', { name: 'Enter your email' }).press('ArrowLeft');
        await page.getByRole('textbox', { name: 'Enter your email' }).press('ArrowLeft');
        await page.getByRole('textbox', { name: 'Enter your email' }).press('ArrowLeft');
        await page.getByRole('textbox', { name: 'Enter your email' }).press('ArrowLeft');
        await page.getByRole('textbox', { name: 'Enter your email' }).press('ArrowLeft');
        await page.getByRole('textbox', { name: 'Enter your email' }).fill('example@gmail.com');
        page.once('dialog', dialog => {
            console.log(`Dialog message: ${dialog.message()}`);
            dialog.dismiss().catch(() => {});
        });
        await page.getByRole('button', { name: 'Reset Password' }).click();
        await page.getByRole('link', { name: 'Back to login' }).click();
        await page.getByRole('link', { name: 'Sign up' }).click();
        await page.getByRole('textbox', { name: 'Optional' }).click();
        await page.goto('http://localhost:5173/');
        await page.getByRole('button', { name: 'Get Started →' }).click();
        // await expect(page.locator('div').filter({ hasText: /^Academic ResourcesAccess study materials and course content$/ }).locator('svg')).toBeVisible();
        // await expect(page.getByRole('heading', { name: 'Connect with Peers' })).toBeVisible();
        // await expect(page.getByRole('heading', { name: 'Track Progress' })).toBeVisible();
        // await page.getByRole('button', { name: 'Get Started', exact: true }).click();
        // await expect(page.getByRole('heading', { name: 'StudyBuddy' })).toBeVisible();


	});
});