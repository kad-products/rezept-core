'use client';
import { lazy, Suspense } from 'react';

// Dynamically imported so the TanStack/Solid.js bundle is excluded from the
// production worker build. Static imports are not tree-shaken in the SSR/worker
// pipeline even when the usage is behind import.meta.env.DEV guards.
// import.meta.env.SSR is true in the worker/SSR environment — devtools are client-only
// UI and must not be loaded server-side (they pull in solid-js which fails in the worker).
const LazyDevtools =
	import.meta.env.DEV && !import.meta.env.SSR
		? lazy(() =>
				Promise.all([
					import('@tanstack/react-devtools').then(m => m.TanStackDevtools),
					import('@tanstack/react-form-devtools').then(m => m.formDevtoolsPlugin),
				]).then(([TanStackDevtools, formDevtoolsPlugin]) => ({
					default: () => <TanStackDevtools plugins={[formDevtoolsPlugin()]} />,
				})),
			)
		: (): null => null;

export function FormDevtools(): React.ReactNode {
	if (!import.meta.env.DEV) return null;
	return (
		<Suspense>
			<LazyDevtools />
		</Suspense>
	);
}
