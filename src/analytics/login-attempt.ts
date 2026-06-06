import { env } from 'cloudflare:workers';

type AEDLoginAttemptDataPoint = {
	type: 'PASSKEY' | 'PASSWORD';
	stage: 'START' | 'FINISH';
	success: boolean;
	userId?: string;
};

export function trackLoginAttempt(dataPoint: AEDLoginAttemptDataPoint): void {
	// convert to CF's somewhat goofy data point structure
	const indexes = [dataPoint.userId ? dataPoint.userId : 'unknown'];
	const blobs = [dataPoint.type, dataPoint.stage, dataPoint.success.toString()];

	env.AED_LOGIN_ATTEMPTS.writeDataPoint({ indexes, blobs });
}
