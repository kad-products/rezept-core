export const env: Record<string, unknown> = {};

export class DurableObject {
	ctx: DurableObjectState;
	env: Env;

	constructor(state: DurableObjectState, env: Env) {
		this.ctx = state;
		this.env = env;
	}
}

// Mock types to match Cloudflare's structure
export interface DurableObjectState {
	storage: DurableObjectStorage;
	id: DurableObjectId;
	waitUntil: (promise: Promise<unknown>) => void;
	blockConcurrencyWhile: (callback: () => Promise<void>) => Promise<void>;
}

export interface DurableObjectStorage {
	get<T>(key: string): Promise<T | undefined>;
	put<T>(key: string, value: T): Promise<void>;
	delete(key: string): Promise<void>;
	list(options?: { prefix?: string }): Promise<Map<string, unknown>>;
}

export interface DurableObjectId {
	toString(): string;
	name?: string;
}

export interface Env {
	[key: string]: unknown;
}

export default {};
