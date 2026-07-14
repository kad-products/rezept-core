import type { z } from 'zod';
import type { growingZones } from '@/models';
import type { growingZonesSchemas } from '@/schemas';

export type GrowingZonesDBRead = typeof growingZones.$inferSelect;
export type GrowingZonesFormInput = z.input<typeof growingZonesSchemas.form>;
