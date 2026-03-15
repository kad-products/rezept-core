import type { JSX } from 'react';

export type RzTableColumn = {
	label: string;
	key: string;
	render?: (val: string, record: Record<string, unknown>) => JSX.Element | string;
};
