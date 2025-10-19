import { test, expect } from "playwright-test-coverage";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const filePath = await path.join(__dirname, "/docs/Test.pdf");

test.describe("uploadResource Page Shows Correctly", () => {
	test("Check if all needed things show", async ({ page }) => {
		await page.goto("http://localhost:5174/home");
		
	});
});
