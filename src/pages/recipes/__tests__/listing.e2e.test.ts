import { expect, test } from '../../../../tests/e2e-fixtures';

test('renders recipes listing page', async ({ page }) => {
	await page.goto('/recipes');
	await expect(page.locator('h2.page-title')).toHaveText('Recipes');
});
