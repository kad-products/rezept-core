import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createNoopLogger } from '@/logger';
import type { RzLogger } from '@/types';

const mockEnv = vi.hoisted(() => ({
	REZEPT_ENV: 'development' as string,
	RECIPE_RAW_INGREDIENTS_TO_INGREDIENTS_WORKFLOW: {
		create: vi.fn(),
	},
	RECIPE_INGREDIENTS_LINKED_TO_INGREDIENTS_WORKFLOW: {
		create: vi.fn(),
	},
}));

vi.mock('cloudflare:workers', () => ({ env: mockEnv }));

vi.mock('@/interrupters', () => ({
	requireAuthentication: vi.fn(),
	requirePermissions: vi.fn(() => vi.fn()),
}));

import { requireAuthentication } from '@/interrupters';
import handler, { _postHandler } from '../workflows';

const mockWorkflowInstance = { id: 'workflow-instance-id' };

describe('_postHandler', () => {
	let ctx: { user: { id: string }; logger: RzLogger };

	beforeEach(() => {
		vi.clearAllMocks();
		ctx = { user: { id: 'user-id' }, logger: createNoopLogger() };
		mockEnv.RECIPE_RAW_INGREDIENTS_TO_INGREDIENTS_WORKFLOW.create.mockResolvedValue(mockWorkflowInstance);
		mockEnv.RECIPE_INGREDIENTS_LINKED_TO_INGREDIENTS_WORKFLOW.create.mockResolvedValue(mockWorkflowInstance);
	});

	describe('recipe-raw-ingredients-to-ingredients workflow', () => {
		it('returns 200 with the workflow instance on success', async () => {
			const response = await _postHandler({
				params: { workflowName: 'recipe-raw-ingredients-to-ingredients' },
				ctx,
			} as any);

			expect(response.status).toBe(200);
			const body = (await response.json()) as any;
			expect(body.success).toBe(true);
			expect(body.data).toEqual(mockWorkflowInstance);
		});

		it('calls workflow create with userId spread into params', async () => {
			await _postHandler({
				params: { workflowName: 'recipe-raw-ingredients-to-ingredients', recipeId: 'r-123' },
				ctx,
			} as any);

			expect(mockEnv.RECIPE_RAW_INGREDIENTS_TO_INGREDIENTS_WORKFLOW.create).toHaveBeenCalledWith({
				params: {
					workflowName: 'recipe-raw-ingredients-to-ingredients',
					recipeId: 'r-123',
					userId: 'user-id',
				},
			});
		});

		it('uses the authenticated user id from ctx', async () => {
			ctx.user.id = 'another-user-id';

			await _postHandler({
				params: { workflowName: 'recipe-raw-ingredients-to-ingredients' },
				ctx,
			} as any);

			expect(mockEnv.RECIPE_RAW_INGREDIENTS_TO_INGREDIENTS_WORKFLOW.create).toHaveBeenCalledWith(
				expect.objectContaining({ params: expect.objectContaining({ userId: 'another-user-id' }) }),
			);
		});

		it('returns an error response when workflow create throws', async () => {
			mockEnv.RECIPE_RAW_INGREDIENTS_TO_INGREDIENTS_WORKFLOW.create.mockRejectedValue(new Error('Workflow service unavailable'));

			const response = await _postHandler({
				params: { workflowName: 'recipe-raw-ingredients-to-ingredients' },
				ctx,
			} as any);

			expect(response.status).toBe(500);
			const body = (await response.json()) as any;
			expect(body.success).toBe(false);
		});
	});

	describe('recipe-ingredients-linked-to-ingredients workflow', () => {
		it('returns 200 with the workflow instance on success', async () => {
			const response = await _postHandler({
				params: { workflowName: 'recipe-ingredients-linked-to-ingredients' },
				ctx,
			} as any);

			expect(response.status).toBe(200);
			const body = (await response.json()) as any;
			expect(body.success).toBe(true);
			expect(body.data).toEqual(mockWorkflowInstance);
		});

		it('calls workflow create with userId spread into params', async () => {
			await _postHandler({
				params: { workflowName: 'recipe-ingredients-linked-to-ingredients', recipeId: 'r-123' },
				ctx,
			} as any);

			expect(mockEnv.RECIPE_INGREDIENTS_LINKED_TO_INGREDIENTS_WORKFLOW.create).toHaveBeenCalledWith({
				params: {
					workflowName: 'recipe-ingredients-linked-to-ingredients',
					recipeId: 'r-123',
					userId: 'user-id',
				},
			});
		});

		it('uses the authenticated user id from ctx', async () => {
			ctx.user.id = 'another-user-id';

			await _postHandler({
				params: { workflowName: 'recipe-ingredients-linked-to-ingredients' },
				ctx,
			} as any);

			expect(mockEnv.RECIPE_INGREDIENTS_LINKED_TO_INGREDIENTS_WORKFLOW.create).toHaveBeenCalledWith(
				expect.objectContaining({ params: expect.objectContaining({ userId: 'another-user-id' }) }),
			);
		});

		it('returns an error response when workflow create throws', async () => {
			mockEnv.RECIPE_INGREDIENTS_LINKED_TO_INGREDIENTS_WORKFLOW.create.mockRejectedValue(
				new Error('Workflow service unavailable'),
			);

			const response = await _postHandler({
				params: { workflowName: 'recipe-ingredients-linked-to-ingredients' },
				ctx,
			} as any);

			expect(response.status).toBe(500);
			const body = (await response.json()) as any;
			expect(body.success).toBe(false);
		});
	});

	describe('unknown workflow name', () => {
		it('returns 500 for an unrecognised workflow name', async () => {
			const response = await _postHandler({ params: { workflowName: 'not-a-real-workflow' }, ctx } as any);

			expect(response.status).toBe(500);
			const body = (await response.json()) as any;
			expect(body.success).toBe(false);
		});

		it('does not call any workflow binding for an unrecognised name', async () => {
			await _postHandler({ params: { workflowName: 'not-a-real-workflow' }, ctx } as any);

			expect(mockEnv.RECIPE_RAW_INGREDIENTS_TO_INGREDIENTS_WORKFLOW.create).not.toHaveBeenCalled();
		});
	});
});

describe('route handler', () => {
	const executeChain = async (requestInfo: any): Promise<Response | undefined> => {
		for (const fn of handler.post) {
			const result = await (fn as (info: unknown) => Promise<Response | undefined>)(requestInfo);
			if (result instanceof Response) return result;
		}
	};

	let ctx: any;
	let authCheck: ReturnType<typeof vi.fn>;
	let permissionCheck: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		vi.clearAllMocks();
		mockEnv.RECIPE_RAW_INGREDIENTS_TO_INGREDIENTS_WORKFLOW.create.mockResolvedValue(mockWorkflowInstance);
		authCheck = handler.post[0] as ReturnType<typeof vi.fn>;
		vi.mocked(authCheck).mockReturnValue(undefined);
		permissionCheck = handler.post[1] as ReturnType<typeof vi.fn>;
		vi.mocked(permissionCheck).mockResolvedValue(undefined);
		ctx = { user: { id: 'user-id' }, logger: createNoopLogger() };
	});

	it('handler chain ends with _postHandler', () => {
		expect(handler.post[handler.post.length - 1]).toBe(_postHandler);
	});

	it('includes requireAuthentication in the chain', () => {
		expect(handler.post).toContain(requireAuthentication);
	});

	it('returns 401 for unauthenticated requests', async () => {
		vi.mocked(authCheck).mockReturnValueOnce(Response.json({ error: 'Unauthorized' }, { status: 401 }));
		const response = await executeChain({
			params: { workflowName: 'recipe-raw-ingredients-to-ingredients' },
			ctx: { ...ctx, user: null },
		});
		expect(response?.status).toBe(401);
	});

	it('blocks the request when the permission check fails', async () => {
		const forbidden = Response.json({ success: false, error: 'Forbidden' }, { status: 403 });
		vi.mocked(permissionCheck).mockResolvedValue(forbidden);
		const response = await executeChain({ params: { workflowName: 'recipe-raw-ingredients-to-ingredients' }, ctx });
		expect(response?.status).toBe(403);
	});

	it('reaches _postHandler when auth and permissions pass', async () => {
		const response = await executeChain({ params: { workflowName: 'recipe-raw-ingredients-to-ingredients' }, ctx });
		expect(response?.status).toBe(200);
		const body = (await response?.json()) as any;
		expect(body.success).toBe(true);
	});
});
