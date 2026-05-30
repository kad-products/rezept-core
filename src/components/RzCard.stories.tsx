import type { Meta, StoryObj } from '@storybook/react';
import RzCard from './RzCard';

const meta: Meta<typeof RzCard> = {
	component: RzCard,
};

export default meta;

type Story = StoryObj<typeof RzCard>;

export const Default: Story = {
	args: {
		title: 'Summer Pasta',
		actions: [{ href: '#', text: 'View' }],
	},
};

export const WithBody: Story = {
	args: {
		title: 'Summer Pasta',
		body: 'A light and fresh pasta dish with seasonal vegetables.',
		actions: [{ href: '#', text: 'View' }],
	},
};
