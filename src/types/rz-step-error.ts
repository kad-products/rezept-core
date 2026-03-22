export class RzStepError extends Error {
	constructor(
		public code: number,
		message: string,
	) {
		super(message);
		this.name = 'RzStepError';
	}
}
