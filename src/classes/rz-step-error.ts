export class RzStepError extends Error {
	public devMessage: string;

	constructor(
		public code: number,
		public publicMessage: string,
		devMessage: string,
	) {
		super(devMessage);
		this.name = 'RzStepError';
		this.devMessage = devMessage;
	}
}
