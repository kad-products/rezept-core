import type { Meta, StoryObj } from '@storybook/react';
import RzDialog from './RzDialog';

const meta: Meta<typeof RzDialog> = {
	component: RzDialog,
	parameters: {
		layout: 'centered',
	},
};

export default meta;

type Story = StoryObj<typeof RzDialog>;

export const Default: Story = {
	args: {
		trigger: <button type="button">Open dialog</button>,
		title: 'Edit profile',
		description: "Make changes to your profile here. Click save when you're done.",
		children: <p>Dialog body content goes here.</p>,
	},
};

export const NoDescription: Story = {
	args: {
		trigger: <button type="button">Open dialog</button>,
		title: 'Confirm action',
		children: <p>Are you sure you want to continue?</p>,
	},
};
