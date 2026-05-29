import { expect, test } from '@playwright/experimental-ct-react';
import RootErrorHandler from '../RootErrorHandler';

test('renders error message', async ({ mount }) => {
	const error = new Error('Something went wrong');
	const component = await mount(<RootErrorHandler error={error} />);
	await expect(component).toHaveScreenshot();
});

test('renders error with additional properties', async ({ mount }) => {
	const error = Object.assign(new Error('Database connection failed'), {
		code: 'DB_ERROR',
		statusCode: 500,
	});
	const component = await mount(<RootErrorHandler error={error} />);
	await expect(component).toHaveScreenshot();
});
