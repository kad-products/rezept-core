export class RzStepError extends Error {
	public devMessage: string;

	constructor(
		public code: number,
		public publicMessage: string,
		devMessage?: string,
	) {
		const dev = devMessage ?? publicMessage;
		super(dev);
		this.name = 'RzStepError';
		this.devMessage = dev;
	}
}
