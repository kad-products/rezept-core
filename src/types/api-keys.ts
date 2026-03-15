import type { apiKeys } from '@/models';

export type ApiKey = typeof apiKeys.$inferSelect;

export type ApiKeyFormData = {
	name: string;
	id?: string | undefined;
	userId: string;
	permissions: string[];
	revokeAt?: string | null;
	apiKey?: string;
};
