import { test, expect } from "@playwright/test";

test.describe("Home Page Shows Correctly", () => {
	test("Check if all Buttons show and Work", async ({ page }) => {
		await page.goto("http://localhost:5173/home");
		await expect(page.getByRole("navigation")).toContainText("Logout");
		await expect(page.getByRole("main")).toContainText("Navigation");
		await expect(page.locator("h1")).toContainText("StudyBuddy");

		await expect(page.getByRole("button", { name: "Resource Feed" })).toBeVisible();
		await page.getByRole("button", { name: "Resource Feed" }).click();
		await expect(page.getByText("Share a Thought... Share")).toBeVisible();

		await expect(page.getByRole("button", { name: "Study Buddies" })).toBeVisible();
		await page.getByRole("button", { name: "Study Buddies" }).click();

		await expect(page.getByRole("button", { name: "Friend Requests" })).toBeVisible();
		await page.getByRole("button", { name: "Friend Requests" }).click();

		await expect(page.getByRole("button", { name: "Study Groups" })).toBeVisible();
		await page.getByRole("button", { name: "Study Groups" }).click();

		await expect(page.getByRole("button", { name: "Upload Resource" })).toBeVisible();
		await page.getByRole("button", { name: "Upload Resource" }).click();
		await expect(page.getByText("Choose Files")).toBeVisible();
		await expect(page.getByRole("heading", { name: "Upload Study Resource" })).toBeVisible();
	});
});
