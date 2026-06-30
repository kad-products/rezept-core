#!/usr/bin/env node
/**
 * Post-processes worker-configuration.d.ts after `wrangler types` runs.
 *
 * Wrangler 4.60+ marks bindings as `Type | undefined` when a binding is absent
 * from any named environment (cloudflare/workers-sdk#8475). This causes type errors
 * throughout the codebase because all binding usage assumes they are required.
 *
 * We intentionally don't pre-add bindings to upper environments until the resource
 * exists in Cloudflare, so this script strips the `| undefined` from the Env interface
 * to keep binding types required.
 */

import { readFileSync, writeFileSync } from 'node:fs';

const filePath = 'worker-configuration.d.ts';
const content = readFileSync(filePath, 'utf-8');

// Target only the body of `interface Env { ... }` inside the Cloudflare namespace.
// The lazy [\s\S]*? stops at the first closing brace, which is correct because
// binding types use generics (<>) not nested braces.
const fixed = content.replace(
	/(interface Env \{)([\s\S]*?)(\})/,
	(_, open, body, close) => open + body.replace(/\s*\|\s*undefined(?=;)/g, '') + close,
);

if (fixed === content) {
	console.log('fix-env-types: nothing to strip');
} else {
	writeFileSync(filePath, fixed, 'utf-8');
	console.log('fix-env-types: stripped | undefined from Env bindings in worker-configuration.d.ts');
}
