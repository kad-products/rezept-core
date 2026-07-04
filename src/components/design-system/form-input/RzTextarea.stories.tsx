import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { RzTextarea } from './RzTextarea';

const meta: Meta<typeof RzTextarea> = {
	component: RzTextarea,
	parameters: {
		layout: 'centered',
	},
};

export default meta;

type Story = StoryObj<typeof RzTextarea>;

export const Empty: Story = {
	args: {
		name: 'recipe_notes',
		value: '',
		onBlur: fn(),
		onChange: fn(),
	},
};

export const WithValue: Story = {
	args: {
		name: 'recipe_notes',
		value: 'Use the freshest tomatoes you can find. Heirloom varieties work especially well in summer.',
		onBlur: fn(),
		onChange: fn(),
	},
};

export const LongValue: Story = {
	args: {
		name: 'recipe_notes',
		value: `Preheat oven to 200°C before starting.

Prepare the squash the night before if possible — roasting from room temperature gives a better caramelisation.

The soup freezes well for up to 3 months. Thaw overnight in the fridge and reheat gently on the stove, adding a splash of stock if it thickens too much.

Season generously at the end — squash absorbs a lot of salt. A pinch of nutmeg and white pepper works better than black.

Garnish options: toasted pumpkin seeds, crème fraîche swirl, crispy sage leaves, or a drizzle of chilli oil.`,
		onBlur: fn(),
		onChange: fn(),
	},
};
