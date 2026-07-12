import type permissions from '@/data/permissions';

export type Permission = {
	[K in keyof typeof permissions]: `${K & string}:${keyof (typeof permissions)[K] & string}`;
}[keyof typeof permissions];
