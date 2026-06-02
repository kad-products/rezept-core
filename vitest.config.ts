import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		globals: true,
		environment: 'node',
		exclude: ['**/*.workers.test.ts', '**/*.ct.test.tsx', '**/*.e2e.test.ts', 'node_modules/**'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json-summary', 'html'],
			include: ['src/**/*.ts'],
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
				branches: 30,
				lines: 30, // using this to make sure we don't miss something big or have dead code
				'src/actions/**': {
					branches: 84,
				},
				'src/api/**': {
					branches: 100,
				},
				'src/classes/**': {
					branches: 66,
				},
				'src/durable-objects/**': {
					branches: 100,
				},
				'src/interrupters/**': {
					branches: 100,
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
