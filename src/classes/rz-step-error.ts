export class RzStepError extends Error {
	public devMessage: string;

	constructor(
		public code: number,
		public publicMessage: string,
		devMessage: string,
		public retryable: boolean = false,
	) {
		super(devMessage);
		this.name = 'RzStepError';
		this.devMessage = devMessage;
	}
}
