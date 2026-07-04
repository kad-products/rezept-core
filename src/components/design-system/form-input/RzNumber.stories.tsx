import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { RzNumber } from './RzNumber';

const meta: Meta<typeof RzNumber> = {
	component: RzNumber,
	parameters: {
		layout: 'centered',
	},
};

export default meta;

type Story = StoryObj<typeof RzNumber>;

export const Empty: Story = {
	args: {
		name: 'quantity',
		value: '',
		onBlur: fn(),
		onChange: fn(),
	},
};

export const WithValue: Story = {
	args: {
		name: 'quantity',
		value: '4',
		onBlur: fn(),
		onChange: fn(),
	},
};

export const NegativeValue: Story = {
	args: {
		name: 'temperature_adjustment',
		value: '-10',
		onBlur: fn(),
		onChange: fn(),
	},
};
