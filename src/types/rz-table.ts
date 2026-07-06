import type { RzLink } from './rz-link';

export type RzTableColumn = {
	label: string;
	key: string;
	actions?: ({
		type: 'link' | 'button';
		hrefProp?: string;
		handler?: (val: string, record: Record<string, unknown>) => void;
	} & Omit<RzLink, 'href'>)[];
	render?: (val: string, record: Record<string, unknown>) => React.ReactNode | string;
};
