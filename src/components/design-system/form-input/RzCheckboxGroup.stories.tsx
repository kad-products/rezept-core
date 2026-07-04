import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { RzCheckboxGroup } from './RzCheckboxGroup';

const meta: Meta<typeof RzCheckboxGroup> = {
	component: RzCheckboxGroup,
	parameters: {
		layout: 'centered',
	},
};

export default meta;

type Story = StoryObj<typeof RzCheckboxGroup>;

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

export const NoneChecked: Story = {
	args: {
		options: seasonOptions,
		value: [],
		onChange: fn(),
	},
};

export const SomeChecked: Story = {
	args: {
		options: seasonOptions,
		value: ['spring', 'summer'],
		onChange: fn(),
	},
};

export const AllChecked: Story = {
	args: {
		options: seasonOptions,
		value: ['spring', 'summer', 'autumn', 'winter'],
		onChange: fn(),
	},
};

export const ManyOptions: Story = {
	args: {
		options: ingredientOptions,
		value: ['tomato', 'fennel', 'kale'],
		onChange: fn(),
	},
};
