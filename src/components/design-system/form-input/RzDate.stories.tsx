import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { RzDate } from './RzDate';

const meta: Meta<typeof RzDate> = {
	component: RzDate,
	parameters: {
		layout: 'centered',
	},
};

export default meta;

type Story = StoryObj<typeof RzDate>;

export const Empty: Story = {
	args: {
		name: 'harvest_date',
		value: '',
		onBlur: fn(),
		onChange: fn(),
	},
};

export const WithValue: Story = {
	args: {
		name: 'harvest_date',
		value: '2024-06-15',
		onBlur: fn(),
		onChange: fn(),
	},
};
