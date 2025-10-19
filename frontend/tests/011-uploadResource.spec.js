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
		await expect(
			page.getByRole("button", { name: "Upload Resource" }).nth(1)
		).toBeVisible();
		await page.getByRole("button", { name: "Upload Resource" }).nth(1).click();
		await page.getByRole("textbox", { name: "Resource title" }).click();
		await page
			.getByRole("textbox", { name: "Resource title" })
			.press("CapsLock");
		await page.getByRole("textbox", { name: "Resource title" }).fill("T");
		await page
			.getByRole("textbox", { name: "Resource title" })
			.press("CapsLock");
		await page.getByRole("textbox", { name: "Resource title" }).fill("Test ");
		await page
			.getByRole("textbox", { name: "Resource title" })
			.press("CapsLock");
		await page.getByRole("textbox", { name: "Resource title" }).fill("Test R");
		await page
			.getByRole("textbox", { name: "Resource title" })
			.press("CapsLock");
		await page
			.getByRole("textbox", { name: "Resource title" })
			.fill("Test Recource");
		await expect(
			page.getByRole("heading", { name: "Upload Study Resource" })
		).toBeVisible();
		await expect(page.getByText("Choose Files")).toBeVisible();
		await page.getByRole("textbox", { name: "Course Code" }).click();
		await page.getByRole("textbox", { name: "Course Code" }).press("CapsLock");
		await page.getByRole("textbox", { name: "Course Code" }).fill("C");
		await page.getByRole("textbox", { name: "Course Code" }).press("CapsLock");
		await page.getByRole("textbox", { name: "Course Code" }).fill("");
		await page.getByRole("textbox", { name: "Course Code" }).press("CapsLock");
		await page.getByRole("textbox", { name: "Course Code" }).fill("T");
		await page.getByRole("textbox", { name: "Course Code" }).press("CapsLock");
		await page.getByRole("textbox", { name: "Course Code" }).fill("2");
		await page.getByRole("textbox", { name: "Description" }).click();
		await page.getByRole("textbox", { name: "Description" }).press("CapsLock");
		await page.getByRole("textbox", { name: "Description" }).fill("T");
		await page.getByRole("textbox", { name: "Description" }).press("CapsLock");
		await page.getByRole("textbox", { name: "Description" }).fill("Test ");
		await page.getByRole("textbox", { name: "Description" }).press("CapsLock");
		await page.getByRole("textbox", { name: "Description" }).fill("Test P");
		await page.getByRole("textbox", { name: "Description" }).press("CapsLock");
		await page.getByRole("textbox", { name: "Description" }).fill("Test Pd");
		await page.getByRole("textbox", { name: "Description" }).press("CapsLock");
		await page.getByRole("textbox", { name: "Description" }).fill("Test PdF");
		await page.getByRole("textbox", { name: "Description" }).press("CapsLock");
		await page.getByText("Choose Files").click();

		await page.locator("input[type='file']").setInputFiles(filePath);
		await expect(page.getByText("Test.pdf")).toBeVisible();
		await expect(
			page.getByRole("button", { name: "Submit Upload" })
		).toBeVisible();
		page.once("dialog", (dialog) => {
			console.log(`Dialog message: ${dialog.message()}`);
			dialog.dismiss().catch(() => {});
		});
		await page.getByRole("button", { name: "Submit Upload" }).click();
	});
});