import { expect, test } from "@playwright/test";

test("landing page shows heading", async ({ page }) => {
	// Navigate to the app root
	await page.goto("/");

	// Expect the main heading to be visible
	await expect(
		page.getByRole("heading", { name: "Welcome to PhishingMail AI" }),
	).toBeVisible();
});
