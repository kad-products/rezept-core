import type { WorkflowEvent } from 'cloudflare:workers';
import { env } from 'cloudflare:workers';
import { Chalk } from 'chalk';
import { makeTaggedTemplate } from 'chalk-template';
import type { LogLevel, RzLogger } from './types/rz-logger';

// chalk cannot detect color support inside the Worker runtime (no process.stdout),
// so we force level 1 (16-color ANSI) rather than letting it default to 0 (no color).
const chalk = makeTaggedTemplate(new Chalk({ level: 1 }));

const LEVEL_ORDER: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 };

// Matches any key name containing these substrings (case-insensitive), e.g. publicKey, apiKey, accessToken, clientSecret.
const REDACTED_PATTERN = /password|secret|token|key/i;
const CENSOR = '[Redacted]';

function redact(value: unknown): unknown {
	if (value === null || typeof value !== 'object') return value;
	if (Array.isArray(value)) return value.map(redact);
	return Object.fromEntries(
		Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, REDACTED_PATTERN.test(k) ? CENSOR : redact(v)]),
	);
}

function parseLevel(level: string | undefined, fallback: LogLevel): LogLevel {
	if (level === 'debug' || level === 'info' || level === 'warn' || level === 'error') return level;
	return fallback;
}

function parseTaskOverrides(overrides: string | undefined): Map<string, LogLevel> {
	const map = new Map<string, LogLevel>();
	if (!overrides) return map;
	for (const entry of overrides.split(',')) {
		const [task, level] = entry.split(':').map(s => s.trim());
		if (task && (level === 'debug' || level === 'info' || level === 'warn' || level === 'error')) {
			map.set(task, level);
		}
	}
	return map;
}

function serializeError(err: Error): Record<string, unknown> {
	if (err.cause instanceof Error) {
		return { ...err, innerCause: serializeError(err.cause), message: err.message, stack: err.stack };
	} else {
		return { ...err, message: err.message, stack: err.stack };
	}
}

function write(
	level: LogLevel,
	message: string,
	minLevel: LogLevel,
	bindings: Record<string, unknown>,
	meta: Record<string, unknown> | undefined,
): void {
	if (LEVEL_ORDER[level] < LEVEL_ORDER[minLevel]) return;
	const serializedMeta = meta
		? Object.fromEntries(Object.entries(meta).map(([k, v]) => [k, v instanceof Error ? serializeError(v) : v]))
		: undefined;
	const entry = { level, message, timestamp: new Date().toISOString(), ...bindings, ...serializedMeta };
	if (env.REZEPT_ENV === 'development') {
		const { level, message, timestamp, ...rest } = entry;
		if (level.toUpperCase() === 'WARN') {
			// biome-ignore lint/suspicious/noConsole: intentional single console.log point for the logger
			console.log(chalk`{bold ${timestamp}} {yellow ${level.toUpperCase()}} {white ${message}}`);
		} else if (level.toUpperCase() === 'ERROR') {
			// biome-ignore lint/suspicious/noConsole: intentional single console.log point for the logger
			console.log(chalk`{bold ${timestamp}} {red ${level.toUpperCase()}} {white ${message}}`);
		} else {
			// biome-ignore lint/suspicious/noConsole: intentional single console.log point for the logger
			console.log(chalk`{bold ${timestamp}} {white ${level.toUpperCase()}} {white ${message}}`);
		}

		Object.entries(rest).forEach(([key, value]) => {
			if (REDACTED_PATTERN.test(key)) {
				// biome-ignore lint/suspicious/noConsole: structured log output — intentional single console.log point for the logger
				console.log(chalk`  {cyan ${key}}: {red ${CENSOR}}`);
			} else {
				if (typeof value === 'object') {
					// biome-ignore lint/suspicious/noConsole: structured log output — intentional single console.log point for the logger
					console.log(chalk`  {cyan ${key}}: {white ${JSON.stringify(value, null, 4)}}`);
				} else {
					// biome-ignore lint/suspicious/noConsole: structured log output — intentional single console.log point for the logger
					console.log(chalk`  {cyan ${key}}: {white ${JSON.stringify(value)}}`);
				}
			}
		});
	} else {
		// biome-ignore lint/suspicious/noConsole: structured log output — intentional single console.log point for the logger
		console.log(JSON.stringify(redact(entry)));
	}
}

function buildLogger(bindings: Record<string, unknown>, level: LogLevel, taskOverrides: Map<string, LogLevel>): RzLogger {
	return {
		debug: (message: string, meta?: Record<string, unknown>) => write('debug', message, level, bindings, meta),
		info: (message: string, meta?: Record<string, unknown>) => write('info', message, level, bindings, meta),
		warn: (message: string, meta?: Record<string, unknown>) => write('warn', message, level, bindings, meta),
		error: (message: string, meta?: Record<string, unknown>) => write('error', message, level, bindings, meta),
		child(childBindings: Record<string, unknown>, levelOverride?: LogLevel): RzLogger {
			const taskLevel = typeof childBindings.task === 'string' ? taskOverrides.get(childBindings.task) : undefined;
			return buildLogger({ ...bindings, ...childBindings }, levelOverride ?? taskLevel ?? level, taskOverrides);
		},
	};
}

export function createRequestLogger(request: Request): RzLogger {
	const correlationId = request.headers.get('cf-ray') ?? crypto.randomUUID();
	const path = new URL(request.url).pathname;
	const level = parseLevel(env.LOG_LEVEL, 'info');
	const taskOverrides = parseTaskOverrides(env.LOG_LEVEL_TASK_OVERRIDE);
	return buildLogger({ correlationId, path }, level, taskOverrides);
}

export function createWorkflowLogger(event: WorkflowEvent<unknown>): RzLogger {
	const level = parseLevel(env.LOG_LEVEL, 'info');
	const taskOverrides = parseTaskOverrides(env.LOG_LEVEL_TASK_OVERRIDE);
	return buildLogger(
		{ instanceId: event.instanceId, workflowName: event.workflowName, triggeredAt: event.timestamp.toISOString() },
		level,
		taskOverrides,
	);
}

export function createNoopLogger(): RzLogger {
	const noop = (): void => {};
	return {
		debug: noop,
		info: noop,
		warn: noop,
		error: noop,
		child: () => createNoopLogger(),
	};
}
