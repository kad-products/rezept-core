import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, devices } from '@playwright/experimental-ct-react';

const __dirname: string = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
	testDir: './src',
	testMatch: '**/*.ct.test.tsx',
	timeout: 10 * 1000,
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	reporter: 'html',
	use: {
		trace: 'on-first-retry',
		screenshot: 'on',
		ctPort: 3100,
		ctViteConfig: {
			resolve: {
				alias: [
					{
						find: '@/actions/submit-recipe-search',
						replacement: resolve(__dirname, './tests/mocks/actions/submit-recipe-search.ts'),
					},
					{ find: '@', replacement: resolve(__dirname, './src') },
				],
			},
		},
	},
	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] },
		},
	],
});
