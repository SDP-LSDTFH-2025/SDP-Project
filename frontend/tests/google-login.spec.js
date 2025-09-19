import { test, expect } from 'playwright-test-coverage';
import { chromium } from "playwright-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import path from 'path';
import { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const stateFile = path.join(__dirname, '../tests/state/storageState.json');

test.describe('Post-login Page with Google Sign-In', () => {
  test.skip('Google Sign-In and Save for later tests to use', async () => {
    chromium.use(StealthPlugin());

    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    const email = process.env.GOOGLE_TEST_EMAIL;
    const password = process.env.GOOGLE_TEST_PASSWORD;

    if (!email || !password) {
      test.skip(true, "Google test credentials not found");
      await browser.close();
      return;
    }

    await page.goto('http://localhost:5173/');
    await page.getByRole('button', { name: 'Log In' }).click();
    await expect(page).toHaveURL('http://localhost:5173/login');
    await page
    .getByRole('button', { name: 'Sign in with Google' })
    .first()
    .click();

    const [popup] = await Promise.all([page.waitForEvent('popup')]);
    await popup.waitForLoadState();

    await popup.locator('input[type="email"]').fill(email);
    await popup.getByRole('button', { name: 'Next' }).click();

    await popup.locator('input[type="password"]').fill(password);
    await popup.getByRole('button', { name: 'Next' }).click();

    const allowButton = popup.getByRole('button', { name: 'Allow' });
    if (await allowButton.isVisible({ timeout: 5000 })) {
      await allowButton.click();
    }

    await page.waitForURL("http://localhost:5173/home");

	  //Save the browser state to use for later tests
	  await page.context().storageState({ path: stateFile });

    await browser.close();

  });
});
