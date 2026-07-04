import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { RzText } from './RzText';

const meta: Meta<typeof RzText> = {
	component: RzText,
	parameters: {
		layout: 'centered',
	},
};

export default meta;

type Story = StoryObj<typeof RzText>;

export const Empty: Story = {
	args: {
		name: 'recipe_name',
		value: '',
		onBlur: fn(),
		onChange: fn(),
	},
};

export const WithValue: Story = {
	args: {
		name: 'recipe_name',
		value: 'Roasted Butternut Squash Soup',
		onBlur: fn(),
		onChange: fn(),
	},
};

export const LongValue: Story = {
	args: {
		name: 'recipe_name',
		value: 'Slow-Roasted Herb-Crusted Leg of Lamb with Rosemary, Garlic, and Anchovy served with Seasonal Vegetables',
		onBlur: fn(),
		onChange: fn(),
	},
};
