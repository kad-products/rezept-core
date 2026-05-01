export const RzRepositoryErrorTypes = {
	UnexpectedRecordCount: 'unexpected-record-count',
	InvalidUUID: 'invalid-uuid',
} as const;

export class RzRepositoryError extends Error {
	constructor(
		public type: (typeof RzRepositoryErrorTypes)[keyof typeof RzRepositoryErrorTypes],
		public details: unknown[],
	) {
		let message = '';
		switch (type) {
			case RzRepositoryErrorTypes.UnexpectedRecordCount: {
				const [actual, expected, entity] = details as [number, number, string];
				message = `Expected ${expected} ${entity} record(s), but found ${actual}`;
				break;
			}
			case RzRepositoryErrorTypes.InvalidUUID: {
				const [value, entity] = details as [string, string];
				message = `The value "${value}" is not a valid ID for a ${entity}`;
				break;
			}
			default:
				message = 'An unknown repository error occurred';
		}
		super(message);
		this.name = 'RzRepositoryError';
		this.type = type;
	}
}
