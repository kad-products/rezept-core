import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		globals: true,
		environment: 'node',
		exclude: ['**/*.workers.test.ts', '**/*.ct.test.tsx', 'node_modules/**'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json-summary'],
			exclude: [
				'**/*.md',
				'**/__tests__/**',
				'**/*.test.ts',
				'**/*.integration.test.ts',
				'src/components/**',
				'src/pages/**',
				'src/layouts/**',
				'src/styles/**',
			],
			thresholds: {
				branches: 20,
				lines: 30, // using this to make sure we don't miss something big or have dead code
				'src/actions/**': {
					branches: 85,
				},
				'src/api/**': {
					branches: 80,
				},
				'src/classes/**': {
					branches: 60,
				},
				'src/durable-objects/**': {
					branches: 100,
				},
				'src/interrupters/**': {
					branches: 50,
				},
				'src/middleware/**': {
					branches: 100,
				},
				'src/repositories/**': {
					branches: 100,
				},
				'src/schemas/**': {
					branches: 100,
				},
				'src/steps/**': {
					branches: 74,
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
