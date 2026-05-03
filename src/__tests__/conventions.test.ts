import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

const SRC = join(__dirname, '..');

function getFiles(dir: string, exclude: string[] = []): string[] {
	const abs = join(SRC, dir);
	return (readdirSync(abs, { recursive: true, withFileTypes: true }) as import('fs').Dirent[])
		.filter(e => e.isFile() && /\.tsx?$/.test(e.name))
		.map(e => join(e.parentPath, e.name))
		.filter(p => !exclude.some(ex => p.includes(ex)));
}

function read(p: string): string {
	return readFileSync(p, 'utf-8');
}

function rel(p: string): string {
	return relative(SRC, p);
}

const SKIP = ['__tests__', 'readme.md'];

// ─── Actions ──────────────────────────────────────────────────────────────────

describe('actions', () => {
	// utils.ts and webauthn.ts are non-entry utility files — 'use server' not required there
	const ACTION_SKIP = [...SKIP, 'utils.ts', 'webauthn.ts', 'index.ts'];
	const entryFiles = getFiles('actions', ACTION_SKIP);
	const allFiles = getFiles('actions', SKIP);

	it("every action entry file has 'use server'", () => {
		const bad = entryFiles.filter(p => !read(p).includes("'use server'"));
		expect(bad.map(rel), "Missing 'use server'").toHaveLength(0);
	});

	it('no action file uses export default', () => {
		const bad = allFiles.filter(p => /\bexport default\b/.test(read(p)));
		expect(bad.map(rel), 'export default not allowed in actions (no barrel export)').toHaveLength(0);
	});

	it('no action file imports from @/db or @/models', () => {
		const bad = allFiles.filter(p => /from ['"]@\/(db|models)['"]/.test(read(p)));
		expect(bad.map(rel), 'Direct db/models import not allowed in actions; use repositories').toHaveLength(0);
	});
});

// ─── Repositories ──────────────────────────────────────────────────────────────

describe('repositories', () => {
	const files = getFiles('repositories', [...SKIP, 'index.ts']);

	it("no repository file has 'use server'", () => {
		const bad = files.filter(p => read(p).includes("'use server'"));
		expect(bad.map(rel), "'use server' not allowed in repositories").toHaveLength(0);
	});

	it('no repository file uses export default', () => {
		const bad = files.filter(p => /\bexport default\b/.test(read(p)));
		expect(bad.map(rel), 'export default not allowed in repositories; use named exports').toHaveLength(0);
	});
});

// ─── Pages ────────────────────────────────────────────────────────────────────

describe('pages', () => {
	const files = getFiles('pages', SKIP);

	it('no page file imports requestInfo as a value', () => {
		// Pages must receive request info via function parameter, not the rwsdk global
		const bad = files.filter(p => /^import(?!\s+type)\s*\{[^}]*\brequestInfo\b/m.test(read(p)));
		expect(bad.map(rel), 'requestInfo global must not be imported; destructure from function parameter instead').toHaveLength(0);
	});

	it('no page file imports from @/db or @/models', () => {
		const bad = files.filter(p => /from ['"]@\/(db|models)['"]/.test(read(p)));
		expect(bad.map(rel), 'Direct db/models import not allowed in pages; use repositories').toHaveLength(0);
	});
});

// ─── Components ───────────────────────────────────────────────────────────────

describe('components', () => {
	const files = getFiles('components', SKIP);

	it('no component file imports from @/repositories', () => {
		const bad = files.filter(p => /from ['"]@\/repositories['"/]/.test(read(p)));
		expect(bad.map(rel), 'Repository imports not allowed in components; pass data as props').toHaveLength(0);
	});

	it('no component file imports from @/db or @/models', () => {
		const bad = files.filter(p => /from ['"]@\/(db|models)['"]/.test(read(p)));
		expect(bad.map(rel), 'Direct db/models import not allowed in components').toHaveLength(0);
	});
});

// ─── Schemas ──────────────────────────────────────────────────────────────────

describe('schemas', () => {
	const files = getFiles('schemas', [...SKIP, 'index.ts', 'utils.ts']);

	it('no schema file imports from @/db or @/models', () => {
		const bad = files.filter(p => /from ['"]@\/(db|models)['"]/.test(read(p)));
		expect(bad.map(rel), 'Direct db/models import not allowed in schemas').toHaveLength(0);
	});
});

// ─── Interrupters ─────────────────────────────────────────────────────────────

describe('interrupters', () => {
	const files = getFiles('interrupters', [...SKIP, 'index.ts']);

	it('no interrupter file uses export default', () => {
		const bad = files.filter(p => /\bexport default\b/.test(read(p)));
		expect(bad.map(rel), 'export default not allowed in interrupters; use named exports re-exported via index.ts').toHaveLength(
			0,
		);
	});
});

// ─── API handlers ─────────────────────────────────────────────────────────────

describe('api', () => {
	// routes.ts is a route config file, utils.ts is a utility — neither are handler entry points
	const files = getFiles('api', [...SKIP, 'routes.ts', 'utils.ts']);

	it("no API handler file has 'use server'", () => {
		const bad = files.filter(p => read(p).includes("'use server'"));
		expect(bad.map(rel), "'use server' not allowed in API handlers").toHaveLength(0);
	});
});

// ─── Steps ────────────────────────────────────────────────────────────────────

describe('steps', () => {
	const files = getFiles('steps', [...SKIP, 'index.ts']);

	it('no step file imports from @/db or @/models', () => {
		const bad = files.filter(p => /from ['"]@\/(db|models)['"]/.test(read(p)));
		expect(bad.map(rel), 'Direct db/models import not allowed in steps; use repositories').toHaveLength(0);
	});
});

// ─── Middleware ────────────────────────────────────────────────────────────────

describe('middleware', () => {
	const files = getFiles('middleware', SKIP);

	it('every middleware file has a default export', () => {
		const bad = files.filter(p => !/\bexport default\b/.test(read(p)));
		expect(bad.map(rel), 'Middleware files must use default export').toHaveLength(0);
	});
});

// ─── Barrel exports ───────────────────────────────────────────────────────────

describe('barrel exports', () => {
	it('src/actions has no index.ts (barrel exports break the SSR build)', () => {
		expect(existsSync(join(SRC, 'actions/index.ts'))).toBe(false);
	});

	it.each(['repositories', 'schemas', 'steps', 'interrupters'])('src/%s has an index.ts barrel file', dir => {
		expect(existsSync(join(SRC, `${dir}/index.ts`))).toBe(true);
	});

	const allSource = getFiles('.', SKIP);

	it('no source file uses a @/repositories sub-path import', () => {
		const bad = allSource.filter(p => /from ['"]@\/repositories\//.test(read(p)));
		expect(bad.map(rel), 'Import from @/repositories barrel, not sub-paths').toHaveLength(0);
	});

	it('no source file uses a @/schemas sub-path import', () => {
		const bad = allSource.filter(p => /from ['"]@\/schemas\//.test(read(p)));
		expect(bad.map(rel), 'Import from @/schemas barrel, not sub-paths').toHaveLength(0);
	});

	it('no source file uses a @/steps sub-path import', () => {
		const bad = allSource.filter(p => /from ['"]@\/steps\//.test(read(p)));
		expect(bad.map(rel), 'Import from @/steps barrel, not sub-paths').toHaveLength(0);
	});

	it('no source file uses a @/interrupters sub-path import', () => {
		const bad = allSource.filter(p => /from ['"]@\/interrupters\//.test(read(p)));
		expect(bad.map(rel), 'Import from @/interrupters barrel, not sub-paths').toHaveLength(0);
	});
});
