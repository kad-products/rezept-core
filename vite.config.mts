import { cloudflare } from '@cloudflare/vite-plugin';
import { visualizer } from 'rollup-plugin-visualizer';
import { redwood } from 'rwsdk/vite';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), '');
	const tunnelHost = env.VITE_BASE_URL ? new URL(env.VITE_BASE_URL).host : null;

	return {
		server: {
			...(tunnelHost && {
				cors: false,
				allowedHosts: [tunnelHost],
				hmr: {
					host: tunnelHost,
					protocol: 'wss',
				},
			}),
		},
		plugins: [
			cloudflare({
				viteEnvironment: { name: 'worker' },
			}),
			redwood(),
			{
				...visualizer({ open: false, filename: 'bundle-stats-client.html' }),
				applyToEnvironment: (env: { name: string }) => env.name === 'client',
			},
			{
				...visualizer({ open: false, filename: 'bundle-stats-worker.html' }),
				applyToEnvironment: (env: { name: string }) => env.name === 'worker',
			},
		],
	};
});
