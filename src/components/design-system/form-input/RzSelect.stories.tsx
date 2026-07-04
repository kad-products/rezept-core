import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { RzSelect } from './RzSelect';

const meta: Meta<typeof RzSelect> = {
	component: RzSelect,
	parameters: {
		layout: 'centered',
	},
};

export default meta;

type Story = StoryObj<typeof RzSelect>;

const seasonOptions = [
	{ value: 'spring', label: 'Spring' },
	{ value: 'summer', label: 'Summer' },
	{ value: 'autumn', label: 'Autumn' },
	{ value: 'winter', label: 'Winter' },
];

const ingredientOptions = [
	{ value: 'tomato', label: 'Tomato' },
	{ value: 'courgette', label: 'Courgette' },
	{ value: 'aubergine', label: 'Aubergine' },
	{ value: 'fennel', label: 'Fennel' },
	{ value: 'asparagus', label: 'Asparagus' },
	{ value: 'pea', label: 'Pea' },
	{ value: 'broad-bean', label: 'Broad Bean' },
	{ value: 'artichoke', label: 'Globe Artichoke' },
	{ value: 'beetroot', label: 'Beetroot' },
	{ value: 'spinach', label: 'Spinach' },
	{ value: 'kale', label: 'Kale' },
	{ value: 'leek', label: 'Leek' },
];

export const Unselected: Story = {
	args: {
		value: '',
		onChange: fn(),
		options: seasonOptions,
	},
};

export const WithSelection: Story = {
	args: {
		value: 'summer',
		onChange: fn(),
		options: seasonOptions,
	},
};

export const ManyOptions: Story = {
	args: {
		value: '',
		onChange: fn(),
		options: ingredientOptions,
	},
};
