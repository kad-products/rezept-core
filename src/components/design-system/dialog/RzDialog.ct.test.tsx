import { expect, test } from '@playwright/experimental-ct-react';
import RzDialog from './RzDialog';

// RzDialog uses Dialog.Portal, so content renders into document.body outside
// the component's DOM subtree. Use `page` (not the mounted component locator)
// to query dialog content.

test('opens when trigger is clicked', async ({ mount, page }) => {
	await mount(
		<RzDialog trigger={<button type="button">Open</button>} title="Confirm Action" description="This cannot be undone.">
			<p>Dialog body content</p>
		</RzDialog>,
	);

	await expect(page.getByRole('dialog')).not.toBeVisible();

	await page.getByRole('button', { name: 'Open' }).click();

	await expect(page.getByRole('dialog')).toBeVisible();
	await expect(page.getByRole('dialog')).toContainText('Confirm Action');
	await expect(page.getByRole('dialog')).toContainText('This cannot be undone.');
	await expect(page.getByRole('dialog')).toContainText('Dialog body content');
});

test('closes when close button is clicked', async ({ mount, page }) => {
	await mount(
		<RzDialog trigger={<button type="button">Open</button>} title="Confirm Action">
			<p>Dialog body content</p>
		</RzDialog>,
	);

	await page.getByRole('button', { name: 'Open' }).click();
	await expect(page.getByRole('dialog')).toBeVisible();

	await page.getByRole('button', { name: 'Close' }).click();
	await expect(page.getByRole('dialog')).not.toBeVisible();
});

test('renders optional description when provided', async ({ mount, page }) => {
	await mount(
		<RzDialog trigger={<button type="button">Open</button>} title="Settings" description="Adjust your preferences.">
			<p>Settings content</p>
		</RzDialog>,
	);

	await page.getByRole('button', { name: 'Open' }).click();
	await expect(page.getByRole('dialog')).toContainText('Adjust your preferences.');
});

test('renders without description when omitted', async ({ mount, page }) => {
	await mount(
		<RzDialog trigger={<button type="button">Open</button>} title="Simple Dialog">
			<p>Content only</p>
		</RzDialog>,
	);

	await page.getByRole('button', { name: 'Open' }).click();
	await expect(page.getByRole('dialog')).toBeVisible();
	await expect(page.getByRole('dialog')).toContainText('Simple Dialog');
	await expect(page.getByRole('dialog')).toContainText('Content only');
});
