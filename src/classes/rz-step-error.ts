export class RzStepError extends Error {
	public devMessage: string;

	constructor(
		public code: number,
		public publicMessage: string,
		devMessage: string,
		public retryable: boolean = false,
		cause?: unknown,
	) {
		super(devMessage, { cause });
		this.name = 'RzStepError';
		this.devMessage = devMessage;
	}
}
