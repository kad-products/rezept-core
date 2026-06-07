import type { WorkflowEvent } from 'cloudflare:workers';
import { env } from 'cloudflare:workers';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface RzLogger {
	debug(message: string, meta?: Record<string, unknown>): void;
	info(message: string, meta?: Record<string, unknown>): void;
	warn(message: string, meta?: Record<string, unknown>): void;
	error(message: string, meta?: Record<string, unknown>): void;
	child(bindings: Record<string, unknown>, levelOverride?: LogLevel): RzLogger;
}

const LEVEL_ORDER: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 };

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
	return { ...err, message: err.message, stack: err.stack };
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
	// biome-ignore lint/suspicious/noConsole: structured log output — intentional single console.log point for the logger
	console.log(JSON.stringify(entry));
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
