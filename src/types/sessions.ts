import type { Permission } from './permissions';

export interface Session {
	userId?: string | null;
	challenge?: string | null;
	lastAccessedAt: number;
	permissionsOverride?: Permission[];
}

export type SessionError = 'Invalid session' | 'Session expired';
