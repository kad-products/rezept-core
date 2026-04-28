const levels = { fatal: 0, error: 1, warn: 2, info: 3, debug: 4, trace: 5 } as const;
type LogLevel = keyof typeof levels;
const defaultLevel = (process.env.LOG_LEVEL || 'info') as LogLevel;

export default class RzLogger {
	_logMessage(level: string, message: string | unknown | null, meta: object): void {
		if (!message) {
			return;
		}
		if (typeof message !== 'string') message = JSON.stringify(message, null, 4);
		if (!Object.keys(levels).includes(level)) {
			throw new Error('Oh no');
		}
		const lvl = level as LogLevel;
		if (levels[lvl] > levels[defaultLevel]) {
			return;
		}
		// biome-ignore lint/suspicious/noConsole: is disabled in some files, so we use console.log directly here to avoid lint errors, but in the future we may want to implement different log levels or outputs
		console.log({ level, message, ...meta });
	}

	debug(msg: string | unknown | null, meta: object = {}): void {
		this._logMessage('debug', msg, meta);
	}

	info(msg: string | unknown | null, meta: object = {}): void {
		this._logMessage('info', msg, meta);
	}

	warn(msg: string | unknown | null, meta: object = {}): void {
		this._logMessage('warn', msg, meta);
	}

	error(msg: string | unknown | null, meta: object = {}): void {
		this._logMessage('error', msg, meta);
	}

	fatal(msg: string | unknown | null, meta: object = {}): void {
		this._logMessage('fatal', msg, meta);
	}
}
