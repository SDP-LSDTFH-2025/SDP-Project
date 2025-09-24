import { chromium } from "playwright-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import path from 'path';
import { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const stateFile = await path.join(__dirname, './state/storageState.json');
export default async () => {
  
  chromium.use(StealthPlugin());
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  context.setDefaultTimeout(60000); // 60 seconds
  const page = await context.newPage();

  const email = process.env.GOOGLE_TEST_EMAIL;
  const password = process.env.GOOGLE_TEST_PASSWORD;

  if (!email || !password) {
    console.warn("Google test credentials not found");
    await browser.close();
    return;
  }

  await page.goto('http://localhost:5173/');
  await page.waitForURL("http://localhost:5173/");
  await page.click('button:has-text("Log In")');
  await page.waitForURL("http://localhost:5173/login");
  await page
    .getByRole('button', { name: 'Sign in with Google' })
    .first()
    .click();

  const [popup] = await Promise.all([page.waitForEvent('popup')]);
  await popup.waitForLoadState();

  await popup.fill('input[type="email"]', email,{ timeout: 45000 });
  await popup.click('button:has-text("Next")');

  await popup.fill('input[type="password"]', password,{ timeout: 45000 });
  await popup.click('button:has-text("Next")');

  const allowButton = popup.locator('button:has-text("Allow")');
  if (await allowButton.isVisible({ timeout: 5000 })) {
    await allowButton.click();
  }

  await page.waitForURL("http://localhost:5173/home");

  await context.storageState({ path: stateFile });

  await browser.close();
};

