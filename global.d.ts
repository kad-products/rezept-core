import type RzLogger from '@/logger';
import type { Session } from '@/session/durable-object';
import type { ApiKey, User } from '@/types';

interface AppContext {
	user?: User | undefined;
	session?: Session | null;
	permissions?: string[];
	logger: RzLogger;
	apiKey?: ApiKey;
}

declare module 'rwsdk/worker' {
	interface DefaultAppContext extends AppContext {}
}
