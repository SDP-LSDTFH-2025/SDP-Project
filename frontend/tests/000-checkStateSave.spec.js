import { test, expect } from "playwright-test-coverage";
// import path from "path";
// import { dirname } from "path";
// import { fileURLToPath } from "url";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);
// const stateFile = path.join(__dirname, "./state/storageState.json");
// test.use({ storageState: stateFile });

test.describe("Home Saved state", () => {
	test("Check if state works", async ({ page }) => {
		await page.goto("http://localhost:5174/home");
		await expect(page.getByRole("button", { name: "Logout" })).toBeVisible();
	});
});
