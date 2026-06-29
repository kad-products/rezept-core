import type { JSX } from 'react';
import type { Permission } from '@/types';

export type RzLink = {
	href: string;
	label: JSX.Element | string;
	requiredPermission: Permission;
} & React.ComponentPropsWithoutRef<'a'>;
