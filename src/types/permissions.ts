import type { permissions } from '@/middleware/permissions';

type Resource = keyof typeof permissions;
type Action = keyof (typeof permissions)[Resource];
export type Permission = `${Resource}:${Action}`;
