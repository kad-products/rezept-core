import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		globals: true,
		environment: 'node',
		alias: {
			'cloudflare:workers': path.resolve(__dirname, 'tests/mocks/cloudflare-workers.ts'),
		},
	},
	resolve: {
		alias: {
			'@/db': path.resolve(__dirname, 'tests/mocks/db.ts'),
			'@': path.resolve(__dirname, './src'),
		},
	},
});
