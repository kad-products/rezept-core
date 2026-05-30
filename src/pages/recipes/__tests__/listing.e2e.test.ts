import { expect, test } from '@playwright/test';

test('renders recipes listing page', async ({ page }) => {
	await page.goto('/recipes');
	await expect(page.locator('h2.page-title')).toHaveText('Recipes');
});
