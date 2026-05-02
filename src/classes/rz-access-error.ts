export class RzAccessError extends Error {
	constructor(
		public code: number,
		message: string,
	) {
		super(message);
		this.name = 'RzAccessError';
	}
}
