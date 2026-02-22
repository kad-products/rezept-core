import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		globals: true,
		environment: 'node',
		coverage: {
			provider: 'v8', // or 'istanbul'
			reporter: ['text', 'json-summary'],
			include: ['src/actions/**', 'src/middleware/**', 'src/repositories/**', 'src/schemas/**', 'src/session/**', 'src/utils/**'],
			exclude: [
				'**/*.md',
				'**/__tests__/**',
				'**/*.test.ts',
				'**/*.integration.test.ts',
				'src/components/**',
				'src/pages/**',
				'src/layouts/**',
				'src/styles/**',
				'src/session/store.ts', // Just config
			],
			thresholds: {
				branches: 20,
				lines: 30, // using this to make sure we don't miss something big or have dead code
				'src/actions/**': {
					branches: 23,
				},
				'src/middleware/**': {
					branches: 100,
				},
				'src/repositories/**': {
					branches: 44,
				},
				'src/schemas/**': {
					branches: 100,
				},
				'src/session/**': {
					branches: 100,
				},
				'src/utils/**': {
					branches: 100,
				},
			},
		},
		alias: {
			'cloudflare:workers': path.resolve(__dirname, 'tests/mocks/cloudflare-workers.ts'),
			'rwsdk/auth': path.resolve(__dirname, 'tests/mocks/rwsdk-auth.ts'),
			'@': path.resolve(__dirname, './src'),
		},
	},
	resolve: {
		alias: {
			'@/db': path.resolve(__dirname, 'tests/mocks/db.ts'),
		},
	},
});
