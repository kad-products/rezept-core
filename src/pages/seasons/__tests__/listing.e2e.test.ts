import { expect, test } from '../../../../tests/e2e-fixtures';

test('renders seasons listing page', async ({ page }) => {
	await page.goto('/seasons');
	await expect(page.locator('h2.page-title')).toHaveText('Seasons');
});
