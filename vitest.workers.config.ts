import { cloudflareTest } from '@cloudflare/vitest-pool-workers';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [
		cloudflareTest({
			wrangler: { configPath: './dist/worker/wrangler.json' },
		}),
	],
	test: {
		include: ['src/**/*.workers.test.ts'],
	},
});
