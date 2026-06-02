// Extends the generated Cloudflare.Env interface to include TEST_MIGRATIONS,
// which is injected by vitest.workers.config.ts via miniflare.bindings.
// Not present in production — only used by tests/setup.workers.ts.
//
// No top-level import here — a module-level import would turn this into a module
// file, making the namespace augmentation local rather than global.
declare namespace Cloudflare {
	interface Env {
		TEST_MIGRATIONS: import('cloudflare:test').D1Migration[];
	}
}
