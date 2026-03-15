import { describe, expect, it } from 'vitest';
import { parseDuration, parseJsonLd } from '../parse-jsonld';
import allrecipesFixture from './fixtures/allrecipes-corn-chowder.json';

describe('parseDuration', () => {
	it('parses minutes only', () => {
		expect(parseDuration('PT15M')).toBe(15);
	});

	it('parses hours only', () => {
		expect(parseDuration('PT1H')).toBe(60);
	});

	it('parses hours and minutes', () => {
		expect(parseDuration('PT1H30M')).toBe(90);
	});

	it('returns undefined for empty string', () => {
		expect(parseDuration('')).toBeUndefined();
	});

	it('returns undefined for non-duration string', () => {
		expect(parseDuration('not a duration')).toBeUndefined();
	});

	it('returns undefined for zero duration', () => {
		expect(parseDuration('PT0M')).toBeUndefined();
	});
});

describe('parseJsonLd', () => {
	describe('with allrecipes fixture', () => {
		it('parses title and unescapes HTML entities', () => {
			const result = parseJsonLd(allrecipesFixture);
			expect(result.title).toBe("Grandma's Corn Chowder");
		});

		it('parses description and unescapes HTML entities', () => {
			const result = parseJsonLd(allrecipesFixture);
			expect(result.description).toContain("grandma's corn chowder");
		});

		it('sets source to the page url', () => {
			const result = parseJsonLd(allrecipesFixture);
			expect(result.source).toBe('https://www.allrecipes.com/recipe/86096/grandmas-corn-chowder/');
		});

		it('parses servings', () => {
			const result = parseJsonLd(allrecipesFixture);
			expect(result.servings).toBe(8);
		});

		it('parses prepTime to minutes', () => {
			const result = parseJsonLd(allrecipesFixture);
			expect(result.prepTime).toBe(15);
		});

		it('parses cookTime to minutes', () => {
			const result = parseJsonLd(allrecipesFixture);
			expect(result.cookTime).toBe(35);
		});

		it('parses raw ingredients as strings', () => {
			const result = parseJsonLd(allrecipesFixture);
			expect(result.rawIngredients).toHaveLength(8);
			expect(result.rawIngredients[0]).toBe('0.5 cup diced bacon');
		});

		it('parses HowToStep instructions', () => {
			const result = parseJsonLd(allrecipesFixture);
			expect(result.instructions).toHaveLength(5);
			expect(result.instructions[0]).toEqual({ stepNumber: 1, instruction: 'Gather all ingredients.' });
		});

		it('assigns sequential step numbers', () => {
			const result = parseJsonLd(allrecipesFixture);
			result.instructions.forEach((step, i) => {
				expect(step.stepNumber).toBe(i + 1);
			});
		});
	});

	describe('schema variations', () => {
		it('handles @type as a plain string', () => {
			const payload = {
				url: 'https://example.com/recipe',
				jsonld: [[{ '@type': 'Recipe', name: 'Test Recipe', recipeInstructions: [] }]],
			};
			const result = parseJsonLd(payload);
			expect(result.title).toBe('Test Recipe');
		});

		it('handles @graph wrapper', () => {
			const payload = {
				url: 'https://example.com/recipe',
				jsonld: [
					[
						{
							'@context': 'http://schema.org',
							'@graph': [
								{ '@type': 'WebPage', name: 'Some Page' },
								{ '@type': 'Recipe', name: 'Graph Recipe', recipeInstructions: [] },
							],
						},
					],
				],
			};
			const result = parseJsonLd(payload);
			expect(result.title).toBe('Graph Recipe');
		});

		it('handles recipeInstructions as plain string', () => {
			const payload = {
				url: 'https://example.com/recipe',
				jsonld: [[{ '@type': 'Recipe', name: 'Test', recipeInstructions: 'Mix everything together.' }]],
			};
			const result = parseJsonLd(payload);
			expect(result.instructions).toEqual([{ stepNumber: 1, instruction: 'Mix everything together.' }]);
		});

		it('handles recipeInstructions as array of strings', () => {
			const payload = {
				url: 'https://example.com/recipe',
				jsonld: [[{ '@type': 'Recipe', name: 'Test', recipeInstructions: ['Step one.', 'Step two.'] }]],
			};
			const result = parseJsonLd(payload);
			expect(result.instructions).toEqual([
				{ stepNumber: 1, instruction: 'Step one.' },
				{ stepNumber: 2, instruction: 'Step two.' },
			]);
		});

		it('returns empty array if instructions are an object', () => {
			const payload = {
				url: 'https://example.com/recipe',
				jsonld: [[{ '@type': 'Recipe', name: 'Test', recipeInstructions: {} }]],
			};
			expect(() => parseJsonLd(payload)).toThrow('Unexpected structure or data type for instructions: {}');
		});

		it('returns empty array if instructions are an object', () => {
			const payload = {
				url: 'https://example.com/recipe',
				jsonld: [[{ '@type': 'Recipe', name: 'Test', recipeInstructions: [1] }]],
			};
			expect(() => parseJsonLd(payload)).toThrow('Unexpected structure or data type for instructions: [1]');
		});

		it('handles missing optional fields gracefully', () => {
			const payload = {
				url: 'https://example.com/recipe',
				jsonld: [[{ '@type': 'Recipe', name: 'Minimal Recipe' }]],
			};
			const result = parseJsonLd(payload);
			expect(result.description).toBeUndefined();
			expect(result.servings).toBeUndefined();
			expect(result.prepTime).toBeUndefined();
			expect(result.cookTime).toBeUndefined();
			expect(result.rawIngredients).toEqual([]);
			expect(result.instructions).toEqual([]);
		});

		it('handles recipeYield as a string with text', () => {
			const payload = {
				url: 'https://example.com/recipe',
				jsonld: [[{ '@type': 'Recipe', name: 'Test', recipeYield: '12 cookies' }]],
			};
			const result = parseJsonLd(payload);
			expect(result.servings).toBe(12);
		});

		it('handles @graph wrapper with other node types before the recipe', () => {
			const payload = {
				url: 'https://example.com/recipe',
				jsonld: [
					[
						{
							'@graph': [
								{ '@type': 'Organization', name: 'Some Org' },
								{ '@type': 'WebPage', name: 'Some Page' },
								{ '@type': 'Recipe', name: 'Graph Recipe', recipeInstructions: [] },
							],
						},
					],
				],
			};
			const result = parseJsonLd(payload);
			expect(result.title).toBe('Graph Recipe');
		});

		it('handles deeply nested array structure from bookmarklet', () => {
			const payload = {
				url: 'https://example.com/recipe',
				jsonld: [[{ '@type': 'Recipe', name: 'Nested Recipe', recipeInstructions: [] }]],
			};
			const result = parseJsonLd(payload);
			expect(result.title).toBe('Nested Recipe');
		});

		it('throws when instructions array contains unexpected item type', () => {
			const payload = {
				url: 'https://example.com/recipe',
				jsonld: [
					[
						{
							'@type': 'Recipe',
							name: 'Test',
							recipeInstructions: [42],
						},
					],
				],
			};
			expect(() => parseJsonLd(payload)).toThrow('Unexpected structure or data type for instructions');
		});

		it('throws when recipeInstructions is an unexpected type', () => {
			const payload = {
				url: 'https://example.com/recipe',
				jsonld: [
					[
						{
							'@type': 'Recipe',
							name: 'Test',
							recipeInstructions: { '@type': 'HowToStep', text: 'Step' }, // object instead of array
						},
					],
				],
			};
			expect(() => parseJsonLd(payload)).toThrow('Unexpected structure or data type for instructions');
		});

		it('handles @graph at top level of jsonld array', () => {
			const payload = {
				url: 'https://example.com/recipe',
				jsonld: [
					{
						'@graph': [
							{ '@type': 'Organization', name: 'Some Org' },
							{ '@type': 'Recipe', name: 'Graph Recipe', recipeInstructions: [] },
						],
					},
				],
			};
			const result = parseJsonLd(payload);
			expect(result.title).toBe('Graph Recipe');
		});

		it('handles flat array of nodes (no double nesting)', () => {
			const payload = {
				url: 'https://example.com/recipe',
				jsonld: [{ '@type': 'Recipe', name: 'Flat Recipe', recipeInstructions: [] }],
			};
			const result = parseJsonLd(payload);
			expect(result.title).toBe('Flat Recipe');
		});

		it('throws when instruction object has no text property', () => {
			const payload = {
				url: 'https://example.com/recipe',
				jsonld: [
					[
						{
							'@type': 'Recipe',
							name: 'Test',
							recipeInstructions: [{ '@type': 'HowToStep' }], // missing text
						},
					],
				],
			};
			expect(() => parseJsonLd(payload)).toThrow('Unexpected structure or data type for instructions');
		});

		it('throws when instruction object has non-string text property', () => {
			const payload = {
				url: 'https://example.com/recipe',
				jsonld: [
					[
						{
							'@type': 'Recipe',
							name: 'Test',
							recipeInstructions: [{ '@type': 'HowToStep', text: 42 }],
						},
					],
				],
			};
			expect(() => parseJsonLd(payload)).toThrow('Unexpected structure or data type for instructions');
		});

		it('Odd/unexpected jsonld items', () => {
			const payload = {
				url: 'https://example.com/recipe',
				jsonld: [undefined],
			};
			expect(() => parseJsonLd(payload)).toThrow('No Recipe schema found in payload');
		});

		it('finds recipe when @graph contains non-recipe nodes before it', () => {
			const payload = {
				url: 'https://example.com/recipe',
				jsonld: [
					{ '@graph': [{ '@type': 'WebSite', name: 'Example' }] }, // @graph with no recipe
					{ '@type': 'Recipe', name: 'After Graph Recipe', recipeInstructions: [] },
				],
			};
			const result = parseJsonLd(payload);
			expect(result.title).toBe('After Graph Recipe');
		});
	});

	describe('error cases', () => {
		it('throws when no recipe node is found', () => {
			const payload = {
				url: 'https://example.com',
				jsonld: [[{ '@type': 'NewsArticle', name: 'Some Article' }]],
			};
			expect(() => parseJsonLd(payload)).toThrow('No Recipe schema found in payload');
		});

		it('throws when recipe has no name', () => {
			const payload = {
				url: 'https://example.com/recipe',
				jsonld: [[{ '@type': 'Recipe' }]],
			};
			expect(() => parseJsonLd(payload)).toThrow('Recipe has no name');
		});

		it('throws when jsonld is empty', () => {
			const payload = { url: 'https://example.com', jsonld: [] };
			expect(() => parseJsonLd(payload)).toThrow('No Recipe schema found in payload');
		});
	});
});

describe('parseServings', () => {
	it('returns undefined for non-numeric string', () => {
		const payload = {
			url: 'https://example.com/recipe',
			jsonld: [[{ '@type': 'Recipe', name: 'Test', recipeYield: 'makes a lot' }]],
		};
		const result = parseJsonLd(payload);
		expect(result.servings).toBeUndefined();
	});

	it('parses leading integer from mixed string', () => {
		const payload = {
			url: 'https://example.com/recipe',
			jsonld: [[{ '@type': 'Recipe', name: 'Test', recipeYield: '12 cookies' }]],
		};
		const result = parseJsonLd(payload);
		expect(result.servings).toBe(12);
	});

	it('returns undefined for null recipeYield', () => {
		const payload = {
			url: 'https://example.com/recipe',
			jsonld: [[{ '@type': 'Recipe', name: 'Test', recipeYield: null }]],
		};
		const result = parseJsonLd(payload);
		expect(result.servings).toBeUndefined();
	});
});
