import type { JSX } from 'react';

export type RzTableColumn = {
	label: string;
	key: string;
	actions?: {
		type: 'link' | 'button';
		hrefProp?: string;
		label: string;
	}[];
	render?: (val: string, record: Record<string, unknown>) => JSX.Element | string;
};
