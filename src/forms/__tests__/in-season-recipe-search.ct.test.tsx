import { expect, test } from '@playwright/experimental-ct-react';
import InSeasonRecipeSearchForm from '../in-season-recipe-search';

const growingZoneOptions = [{ value: '550e8400-e29b-41d4-a716-446655440000', label: 'Minneapolis' }];
const monthOptions = [{ value: '7', label: 'July' }];

test('clears growingZoneId error after selecting a zone', async ({ mount, page }) => {
	await mount(
		<InSeasonRecipeSearchForm growingZoneOptions={growingZoneOptions} monthOptions={monthOptions} setResults={() => {}} />,
	);

	// Submit without selecting a growing zone — client-side validation fails, error appears
	await page.getByRole('button', { name: 'Search recipes' }).click();
	await expect(page.getByText('Must be a valid UUID')).toBeVisible();

	// Select a growing zone — Growing Zone is the first combobox
	await page.getByRole('combobox').first().click();
	await page.getByRole('option', { name: 'Minneapolis' }).click();

	// Error should clear immediately — this is what the fix in SelectInput ensures
	await expect(page.getByText('Must be a valid UUID')).not.toBeVisible();
});
