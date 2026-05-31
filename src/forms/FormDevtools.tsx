'use client';
import { lazy, Suspense } from 'react';

// Dynamically imported so the TanStack/Solid.js bundle is excluded from the
// production worker build. Static imports are not tree-shaken in the SSR/worker
// pipeline even when the usage is behind import.meta.env.DEV guards.
const LazyDevtools = import.meta.env.DEV
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
