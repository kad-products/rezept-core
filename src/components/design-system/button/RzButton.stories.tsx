import type { Meta, StoryObj } from '@storybook/react';
import RzButton from './RzButton';

const meta: Meta<typeof RzButton> = {
	component: RzButton,
};

export default meta;

type Story = StoryObj<typeof RzButton>;

export const Default: Story = {
	args: {
		isSubmitting: false,
		label: 'Submit',
	},
};

export const WithBody: Story = {
	args: {
		label: 'Longer button text to test how the button handles wrapping and overflow in different layouts.',
	},
};
