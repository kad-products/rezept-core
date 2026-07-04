import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { StorybookConfig } from '@storybook/react-vite';

const __dirname: string = fileURLToPath(new URL('.', import.meta.url));

const config: StorybookConfig = {
	stories: ['../src/components/**/*.stories.tsx'],
	framework: {
		name: '@storybook/react-vite',
		options: {},
	},
	viteFinal: async viteConfig => {
		viteConfig.resolve ??= {};
		viteConfig.resolve.alias = {
			...((viteConfig.resolve.alias as Record<string, string>) ?? {}),
			'@': resolve(__dirname, '../src'),
		};
		return viteConfig;
	},
};

export default config;
