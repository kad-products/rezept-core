import path from 'node:path';
import { cloudflareTest, readD1Migrations } from '@cloudflare/vitest-pool-workers';
import { defineConfig } from 'vitest/config';

export default defineConfig(async () => {
	const migrations = await readD1Migrations(path.join(__dirname, 'drizzle'));
	return {
		plugins: [
			cloudflareTest({
				// Use a minimal test-only wrangler config (only D1 binding, no DOs/R2/assets).
				// The full wrangler.jsonc includes Durable Objects with new_sqlite_classes and
				// R2 buckets — those cause Miniflare to hold open WebSocket servers that prevent
				// the Node.js process from exiting after tests complete.
				wrangler: { configPath: './tests/wrangler.test.jsonc' },
				miniflare: {
					// Pass migrations so setup.workers.ts can call applyD1Migrations
					bindings: { TEST_MIGRATIONS: migrations },
				},
			}),
		],
		test: {
			include: ['src/**/*.integration.test.ts'],
			setupFiles: ['./tests/setup.workers.ts'],
		},
		resolve: {
			alias: {
				'@': path.resolve(__dirname, 'src'),
			},
		},
	};
});
