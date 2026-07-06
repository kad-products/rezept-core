import type { RzLogger } from '@/types';

export function createReactLogger(): RzLogger {
	const noop = (): void => {};
	return {
		debug: noop,
		info: noop,
		warn: noop,
		error: noop,
		child: () => createReactLogger(),
	};
}
