import { DurableObject } from 'cloudflare:workers';
import { MAX_SESSION_DURATION } from 'rwsdk/auth';

type SessionError = 'Invalid session' | 'Session expired';

export interface Session {
	userId?: string | null;
	challenge?: string | null;
	createdAt: number;
	lastAccessedAt: number;
}

export class SessionDurableObject extends DurableObject {
	private session: Session | undefined = undefined;
	constructor(state: DurableObjectState, env: Cloudflare.Env) {
		super(state, env);
		this.session = undefined;
	}

	// seems a little silly but this makes testing much easier
	protected now(): number {
		return Date.now();
	}

	async saveSession({
		userId = null,
		challenge = null,
	}: {
		userId?: string | null;
		challenge?: string | null;
	}): Promise<Session> {
		const now = this.now();
		const session: Session = {
			userId,
			challenge,
			createdAt: now,
			lastAccessedAt: now,
		};

		await this.ctx.storage.put<Session>('session', session);
		this.session = session;
		return session;
	}

	async getSession(): Promise<{ value: Session } | { error: SessionError }> {
		if (this.session) {
			// Update lastAccessedAt even for cached sessions
			this.session.lastAccessedAt = this.now();
			await this.ctx.storage.put<Session>('session', this.session);
			return { value: this.session };
		}

		const session = await this.ctx.storage.get<Session>('session');

		if (!session) {
			return {
				error: 'Invalid session',
			};
		}

		if (session.lastAccessedAt + MAX_SESSION_DURATION < this.now()) {
			await this.revokeSession();
			return {
				error: 'Session expired',
			};
		}

		// Update lastAccessedAt on read
		session.lastAccessedAt = this.now();
		await this.ctx.storage.put<Session>('session', session);
		this.session = session;
		return { value: session };
	}

	async revokeSession() {
		await this.ctx.storage.delete('session');
		this.session = undefined;
	}
}
