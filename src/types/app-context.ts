import type { RzLogger } from '@/logger';
import type { ApiKeyDBRead } from './api-keys';
import type { Permission } from './permissions';
import type { Session } from './sessions';
import type { UserDBRead } from './users';

export interface AppContext {
	user?: UserDBRead | undefined;
	session?: Session | null;
	permissions?: Permission[];
	logger: RzLogger;
	apiKey?: ApiKeyDBRead;
}
