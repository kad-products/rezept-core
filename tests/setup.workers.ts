/// <reference types="@cloudflare/vitest-pool-workers/types" />
/// <reference path="./workers-env.d.ts" />
import { applyD1Migrations, reset } from 'cloudflare:test';
import { env } from 'cloudflare:workers';
import { beforeEach } from 'vitest';

// The workers pool does not automatically isolate D1 storage between tests.
// Before each test: wipe all bindings and re-apply migrations so every test
// starts with a clean schema and no leftover data.
beforeEach(async () => {
	await reset();
	await applyD1Migrations(env.REZEPT_CORE, env.TEST_MIGRATIONS);
});
