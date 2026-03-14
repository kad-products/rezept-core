import { env } from 'cloudflare:workers';
import { type createSessionCookie, defineDurableSession, MAX_SESSION_DURATION } from 'rwsdk/auth';

const createCookie: typeof createSessionCookie = ({ name, sessionId, maxAge }) => {
	return `${name}=${sessionId}; Path=/; HttpOnly; Secure; SameSite=None${
		maxAge != null ? `; Max-Age=${maxAge === true ? MAX_SESSION_DURATION / 1000 : maxAge}` : ''
	}`;
};

export const sessions = defineDurableSession({
	secretKey: env.SESSION_SECRET_KEY,
	sessionDurableObject: env.SESSION_DURABLE_OBJECT,
	createCookie,
});
