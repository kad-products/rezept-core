export interface Session {
	userId?: string | null;
	challenge?: string | null;
	createdAt: number;
	lastAccessedAt: number;
}

export type SessionError = 'Invalid session' | 'Session expired';
