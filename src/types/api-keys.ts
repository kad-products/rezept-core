import type { z } from 'zod';
import type { apiKeys } from '@/models';
import type { apiKeysSchemas } from '@/schemas';

export type ApiKeyDBRead = typeof apiKeys.$inferSelect;
export type ApiKeyFormInput = z.input<typeof apiKeysSchemas.form> & {
	apiKey?: string; // populated after creation, not submitted to DB
};
