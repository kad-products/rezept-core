import type { apiKeys } from '@/models';

export type APIKey = typeof apiKeys.$inferSelect;

export type APIKeyFormData = {
	name: string;
	id?: string | undefined;
	userId: string;
	permissions: string[];
	revokeAt?: string | null;
	apiKey?: string;
};
