import { env } from 'cloudflare:workers';
import { defineDurableSession } from 'rwsdk/auth';

export const sessions = defineDurableSession({
	secretKey: env.SESSION_SECRET_KEY,
	sessionDurableObject: env.SESSION_DURABLE_OBJECT,
});
