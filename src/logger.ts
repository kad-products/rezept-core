const levels = { fatal: 0, error: 1, warn: 2, info: 3, debug: 4, trace: 5 } as const;
type LogLevel = keyof typeof levels;
const defaultLevel = (process.env.LOG_LEVEL || 'info') as LogLevel;

export default class RzLogger {
	_logMessage(level: string, message: string, meta: object) {
		if (!Object.keys(levels).includes(level)) {
			throw new Error('Oh no');
		}
		const lvl = level as LogLevel;
		if (levels[lvl] > levels[defaultLevel]) {
			return;
		}
		console.log({ level, message, ...meta });
	}

	debug(msg: string, meta: object = {}) {
		this._logMessage('debug', msg, meta);
	}

	info(msg: string, meta: object = {}) {
		this._logMessage('info', msg, meta);
	}

	warn(msg: string, meta: object = {}) {
		this._logMessage('warn', msg, meta);
	}

	error(msg: string, meta: object = {}) {
		this._logMessage('error', msg, meta);
	}

	fatal(msg: string, meta: object = {}) {
		this._logMessage('fatal', msg, meta);
	}
}
