import { env } from 'cloudflare:workers';
import { defineDurableSession } from 'rwsdk/auth';

// biome-ignore lint/nursery/useExplicitType: SessionStoreFromDurableObject return type is not exported from rwsdk
export const sessions = defineDurableSession({
	secretKey: env.SESSION_SECRET_KEY,
	sessionDurableObject: env.SESSION_DURABLE_OBJECT,
});
