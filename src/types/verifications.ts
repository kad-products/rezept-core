import type { z } from 'zod';
import type { verifications } from '@/models';
import type { verificationsSchemas } from '@/schemas';

export type VerificationDBRead = typeof verifications.$inferSelect;
export type VerificationFormInput = z.input<typeof verificationsSchemas.form>;
