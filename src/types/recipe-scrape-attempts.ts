import type { recipeScrapeAttemptSource, recipeScrapeAttempts } from '@/models';

export type RecipeScrapeAttemptDBRead = typeof recipeScrapeAttempts.$inferSelect;
export type RecipeScrapeAttemptSource = (typeof recipeScrapeAttemptSource)[number];
