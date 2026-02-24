import type permissions from '@/data/permissions';

type Resource = keyof typeof permissions;
// This distributes over each resource individually and then unions all the action keys together, so import gets included since it's a valid key on recipes.
type Action = { [R in Resource]: keyof (typeof permissions)[R] }[Resource];
export type Permission = `${Resource}:${Action}`;
