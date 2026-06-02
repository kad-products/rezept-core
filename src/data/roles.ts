export const userRoles = ['ADMIN', 'BASIC'] as const;
export type UserRole = (typeof userRoles)[number];

export const permissionRoles = ['PUBLIC', ...userRoles] as const;
export type PermissionRole = (typeof permissionRoles)[number];
