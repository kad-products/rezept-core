import { test as base, expect } from '@playwright/test';

export const test = base.extend({
	page: async ({ page }, use) => {
		const consoleErrors: string[] = [];
		const pageErrors: string[] = [];

		page.on('console', msg => {
			if (msg.type() === 'error') {
				consoleErrors.push(msg.text());
			}
		});

		page.on('pageerror', err => {
			pageErrors.push(err.message);
		});

		await use(page);

		expect(consoleErrors, 'console.error was called during test').toHaveLength(0);
		expect(pageErrors, 'Uncaught page error during test (possible hydration mismatch)').toHaveLength(0);
	},
});

export { expect } from '@playwright/test';
