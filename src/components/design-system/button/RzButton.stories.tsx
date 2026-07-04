import type { Meta, StoryObj } from '@storybook/react';
import RzButton from './RzButton';

const meta: Meta<typeof RzButton> = {
	component: RzButton,
	parameters: {
		layout: 'centered',
	},
};

export default meta;

type Story = StoryObj<typeof RzButton>;

export const Default: Story = {
	args: {
		isSubmitting: false,
		label: 'Save Recipe',
	},
};

export const Submitting: Story = {
	args: {
		isSubmitting: true,
		label: 'Save Recipe',
	},
};

export const LongLabel: Story = {
	args: {
		isSubmitting: false,
		label: 'Save changes to this recipe and update all related seasonal ingredients',
	},
};
