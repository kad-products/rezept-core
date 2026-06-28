import type { JSX } from 'react';
import type { RzLink } from './rz-link';

export type RzTableColumn = {
	label: string;
	key: string;
	actions?: ({
		type: 'link' | 'button';
		hrefProp?: string;
	} & Omit<RzLink, 'href'>)[];
	render?: (val: string, record: Record<string, unknown>) => JSX.Element | string;
};
