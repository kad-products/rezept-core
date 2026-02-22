import type { Session } from '@/session/durable-object';
import type { User } from '@/types';

interface AppContext {
	user?: User | undefined;
	session?: Session | null;
	permissions?: string[];
}

declare module 'rwsdk/worker' {
	interface DefaultAppContext extends AppContext {}
}
