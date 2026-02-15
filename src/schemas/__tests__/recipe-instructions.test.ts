import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { createRecipeInstructionSchema, updateRecipeInstructionSchema } from '../recipe-instructions';

describe('CreateRecipeInstruction form schema', () => {
	it('accepts valid instruction with all fields', () => {
		const validData = {
			recipeSectionId: randomUUID(),
			stepNumber: 1,
			instruction: 'Preheat oven to 350°F',
			createdBy: randomUUID(),
		};

		const result = createRecipeInstructionSchema.safeParse(validData);
		expect(result.success).toBe(true);
	});

	it('accepts various valid instructions', () => {
		const validInstructions = [
			'Chop the onions finely',
			'Heat oil in a large skillet over medium-high heat',
			'Combine dry ingredients in a bowl',
			'Let rest for 30 minutes before serving',
			'Season with salt and pepper to taste',
		];

		validInstructions.forEach((instruction, index) => {
			const validData = {
				recipeSectionId: randomUUID(),
				stepNumber: index + 1,
				instruction,
				createdBy: randomUUID(),
			};

			const result = createRecipeInstructionSchema.safeParse(validData);
			expect(result.success).toBe(true);
		});
	});

	it('accepts step numbers starting at 1', () => {
		const validData = {
			recipeSectionId: randomUUID(),
			stepNumber: 1,
			instruction: 'First step',
			createdBy: randomUUID(),
		};

		const result = createRecipeInstructionSchema.safeParse(validData);
		expect(result.success).toBe(true);
	});

	it('accepts various step numbers', () => {
		const stepNumbers = [1, 2, 5, 10, 50];

		stepNumbers.forEach(stepNumber => {
			const validData = {
				recipeSectionId: randomUUID(),
				stepNumber,
				instruction: `Step ${stepNumber}`,
				createdBy: randomUUID(),
			};

			const result = createRecipeInstructionSchema.safeParse(validData);
			expect(result.success).toBe(true);
		});
	});

	it('trims whitespace from instruction', () => {
		const validData = {
			recipeSectionId: randomUUID(),
			stepNumber: 1,
			instruction: '  Mix ingredients thoroughly  ',
			createdBy: randomUUID(),
		};

		const result = createRecipeInstructionSchema.safeParse(validData);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.instruction).toBe('Mix ingredients thoroughly');
		}
	});

	it('coerces string stepNumber to number', () => {
		const validData = {
			recipeSectionId: randomUUID(),
			stepNumber: '3' as any,
			instruction: 'Test instruction',
			createdBy: randomUUID(),
		};

		const result = createRecipeInstructionSchema.safeParse(validData);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.stepNumber).toBe(3);
			expect(typeof result.data.stepNumber).toBe('number');
		}
	});

	it('rejects missing required fields', () => {
		const invalidData = {
			instruction: 'Test',
		};

		const result = createRecipeInstructionSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('recipeSectionId');
			expect(paths).toContain('stepNumber');
			expect(paths).toContain('createdBy');
		}
	});

	it('rejects empty instruction', () => {
		const invalidData = {
			recipeSectionId: randomUUID(),
			stepNumber: 1,
			instruction: '',
			createdBy: randomUUID(),
		};

		const result = createRecipeInstructionSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('instruction');
		}
	});

	it('rejects empty instruction after trim', () => {
		const invalidData = {
			recipeSectionId: randomUUID(),
			stepNumber: 1,
			instruction: '   ',
			createdBy: randomUUID(),
		};

		const result = createRecipeInstructionSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('instruction');
		}
	});

	it('rejects instruction longer than 2000 characters', () => {
		const invalidData = {
			recipeSectionId: randomUUID(),
			stepNumber: 1,
			instruction: 'a'.repeat(2001),
			createdBy: randomUUID(),
		};

		const result = createRecipeInstructionSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('instruction');
		}
	});

	it('accepts instruction exactly 2000 characters', () => {
		const validData = {
			recipeSectionId: randomUUID(),
			stepNumber: 1,
			instruction: 'a'.repeat(2000),
			createdBy: randomUUID(),
		};

		const result = createRecipeInstructionSchema.safeParse(validData);
		expect(result.success).toBe(true);
	});

	it('rejects stepNumber less than 1', () => {
		const invalidData = {
			recipeSectionId: randomUUID(),
			stepNumber: 0,
			instruction: 'Test',
			createdBy: randomUUID(),
		};

		const result = createRecipeInstructionSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('stepNumber');
		}
	});

	it('rejects negative stepNumber', () => {
		const invalidData = {
			recipeSectionId: randomUUID(),
			stepNumber: -1,
			instruction: 'Test',
			createdBy: randomUUID(),
		};

		const result = createRecipeInstructionSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('stepNumber');
		}
	});

	it('rejects decimal stepNumber', () => {
		const invalidData = {
			recipeSectionId: randomUUID(),
			stepNumber: 1.5,
			instruction: 'Test',
			createdBy: randomUUID(),
		};

		const result = createRecipeInstructionSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('stepNumber');
		}
	});

	it('rejects invalid UUID formats', () => {
		const tests = [
			{ recipeSectionId: 'bad', stepNumber: 1, instruction: 'Test', createdBy: randomUUID(), expectError: 'recipeSectionId' },
			{ recipeSectionId: randomUUID(), stepNumber: 1, instruction: 'Test', createdBy: 'bad', expectError: 'createdBy' },
		];

		tests.forEach(test => {
			const result = createRecipeInstructionSchema.safeParse(test);
			expect(result.success).toBe(false);
			if (!result.success) {
				const paths = result.error.issues.map(i => i.path[0]);
				expect(paths).toContain(test.expectError);
			}
		});
	});
});

describe('UpdateRecipeInstruction form schema', () => {
	it('accepts valid update with all fields', () => {
		const validData = {
			id: randomUUID(),
			recipeSectionId: randomUUID(),
			stepNumber: 2,
			instruction: 'Updated instruction',
			updatedBy: randomUUID(),
		};

		const result = updateRecipeInstructionSchema.safeParse(validData);
		expect(result.success).toBe(true);
	});

	it('accepts update with deletedBy', () => {
		const validData = {
			id: randomUUID(),
			recipeSectionId: randomUUID(),
			stepNumber: 1,
			instruction: 'Test',
			updatedBy: randomUUID(),
			deletedBy: randomUUID(),
		};

		const result = updateRecipeInstructionSchema.safeParse(validData);
		expect(result.success).toBe(true);
	});

	it('rejects update missing required fields', () => {
		const invalidData = {
			instruction: 'Test',
		};

		const result = updateRecipeInstructionSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('id');
			expect(paths).toContain('recipeSectionId');
			expect(paths).toContain('stepNumber');
			expect(paths).toContain('updatedBy');
		}
	});

	it('applies same validation rules as create schema', () => {
		// Empty instruction
		const emptyInstruction = {
			id: randomUUID(),
			recipeSectionId: randomUUID(),
			stepNumber: 1,
			instruction: '   ',
			updatedBy: randomUUID(),
		};
		expect(updateRecipeInstructionSchema.safeParse(emptyInstruction).success).toBe(false);

		// Long instruction
		const longInstruction = {
			id: randomUUID(),
			recipeSectionId: randomUUID(),
			stepNumber: 1,
			instruction: 'a'.repeat(2001),
			updatedBy: randomUUID(),
		};
		expect(updateRecipeInstructionSchema.safeParse(longInstruction).success).toBe(false);

		// Invalid stepNumber
		const invalidStep = {
			id: randomUUID(),
			recipeSectionId: randomUUID(),
			stepNumber: 0,
			instruction: 'Test',
			updatedBy: randomUUID(),
		};
		expect(updateRecipeInstructionSchema.safeParse(invalidStep).success).toBe(false);
	});
});
