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
		userPermissions: ['recipes:read', '__controls:read'],
		actions: [
			{ href: '/recipes/1', label: 'View', requiredPermission: '__controls:read' },
			{ href: '/recipes/1/edit', label: 'Edit', requiredPermission: 'recipes:update' },
		],
	},
};

export const WithBody: Story = {
	args: {
		title: 'Roasted Squash Soup',
		body: 'A warming autumn soup made with butternut squash, roasted garlic, and fresh thyme.',
		userPermissions: ['recipes:read', '__controls:read', 'recipes:update'],
		actions: [
			{ href: '/recipes/2', label: 'View', requiredPermission: '__controls:read' },
			{ href: '/recipes/2/edit', label: 'Edit', requiredPermission: 'recipes:update' },
		],
	},
};

export const ReactNodeBody: Story = {
	args: {
		title: 'Spring Salad',
		body: (
			<ul>
				<li>Mixed greens</li>
				<li>Cherry tomatoes</li>
				<li>Shaved fennel</li>
				<li>Lemon vinaigrette</li>
			</ul>
		),
		userPermissions: ['recipes:read', '__controls:read'],
		actions: [{ href: '/recipes/3', label: 'View', requiredPermission: '__controls:read' }],
	},
};

export const ActionsHidden: Story = {
	args: {
		title: 'Herb-Crusted Lamb',
		body: 'A classic spring roast with rosemary, mint, and garlic.',
		userPermissions: ['recipes:read'],
		actions: [{ href: '/recipes/4/edit', label: 'Edit', requiredPermission: 'recipes:update' }],
	},
};

export const NoActions: Story = {
	args: {
		title: 'Tomato Bruschetta',
		body: 'Grilled bread rubbed with garlic and topped with fresh tomatoes and basil.',
		userPermissions: ['recipes:read'],
		actions: [],
	},
};
