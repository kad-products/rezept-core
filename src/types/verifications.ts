import type { z } from 'zod';
import type { verifications } from '@/models';
import type { verificationsSchemas } from '@/schemas';

export type VerificationsDBRead = typeof verifications.$inferSelect;
export type VerificationsFormInput = z.input<typeof verificationsSchemas.form>;
