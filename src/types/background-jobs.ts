import type { backgroundJobStatus, backgroundJobs } from '@/models';

export type BackgroundJobDBRead = typeof backgroundJobs.$inferSelect;
export type BackgroundJobStatus = (typeof backgroundJobStatus)[number];
