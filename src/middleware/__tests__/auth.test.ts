import { ErrorResponse } from 'rwsdk/worker';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import authMiddleware from '../auth';

// Mock the dependencies
vi.mock('@/session/store', () => ({
	sessions: {
		load: vi.fn(),
		remove: vi.fn(),
	},
}));

vi.mock('rwsdk/worker', () => {
	const mockRequestInfo = {
		ctx: {} as any,
		request: new Request('https://example.com/test'),
		response: {
			headers: new Headers(),
		},
	};

	return {
		get requestInfo() {
			return mockRequestInfo;
		},
		ErrorResponse: class ErrorResponse extends Error {
			constructor(
				public code: number,
				message: string,
			) {
				super(message);
				this.name = 'ErrorResponse';
			}
		},
	};
});

// Import after mocking
import { sessions } from '@/session/store';

describe('setupPasskeyAuth', () => {
	let mockRequestInfo: any;

	beforeEach(() => {
		vi.clearAllMocks();
		mockRequestInfo = {
			ctx: {
				session: {},
			},
			request: new Request('https://example.com/test'),
			response: {
				headers: new Headers(),
			},
		};
	});

	it('loads session and sets it on context', async () => {
		const mockSession = {
			userId: 'test-user-123',
			createdAt: Date.now(),
			lastAccessedAt: Date.now(),
		};
		vi.mocked(sessions.load).mockResolvedValue(mockSession);

		await authMiddleware(mockRequestInfo);

		expect(sessions.load).toHaveBeenCalledWith(mockRequestInfo.request);
		expect(mockRequestInfo.ctx.session).toBe(mockSession);
	});

	it('redirects to login on 401 error', async () => {
		vi.mocked(sessions.load).mockRejectedValue(new ErrorResponse(401, 'Unauthorized'));

		await expect(authMiddleware(mockRequestInfo)).rejects.toThrow(Response);

		try {
			await authMiddleware(mockRequestInfo);
		} catch (error) {
			expect(error).toBeInstanceOf(Response);
			expect((error as Response).status).toBe(302);
			expect((error as Response).headers.get('Location')).toBe('/auth/login');
		}

		expect(sessions.remove).toHaveBeenCalledWith(mockRequestInfo.request, mockRequestInfo.response.headers);
	});

	it('removes session before redirecting on 401', async () => {
		vi.mocked(sessions.load).mockRejectedValue(new ErrorResponse(401, 'Unauthorized'));

		try {
			await authMiddleware(mockRequestInfo);
		} catch {
			// Expected
		}

		expect(sessions.remove).toHaveBeenCalledWith(mockRequestInfo.request, mockRequestInfo.response.headers);
	});

	it('rethrows non-401 ErrorResponse', async () => {
		const error = new ErrorResponse(403, 'Forbidden');
		vi.mocked(sessions.load).mockRejectedValue(error);

		await expect(authMiddleware(mockRequestInfo)).rejects.toThrow(error);
		expect(sessions.remove).not.toHaveBeenCalled();
	});

	it('rethrows non-ErrorResponse errors', async () => {
		const error = new Error('Something went wrong');
		vi.mocked(sessions.load).mockRejectedValue(error);

		await expect(authMiddleware(mockRequestInfo)).rejects.toThrow(error);
		expect(sessions.remove).not.toHaveBeenCalled();
	});

	it('sets Location header correctly on redirect', async () => {
		vi.mocked(sessions.load).mockRejectedValue(new ErrorResponse(401, 'Unauthorized'));

		try {
			await authMiddleware(mockRequestInfo);
		} catch (error) {
			const response = error as Response;
			expect(response.headers.get('Location')).toBe('/auth/login');
		}
	});
});
