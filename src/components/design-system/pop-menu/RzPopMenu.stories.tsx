import type { Meta, StoryObj } from '@storybook/react';
import RzPopMenu from './RzPopMenu';

const meta: Meta<typeof RzPopMenu> = {
	component: RzPopMenu,
	parameters: {
		layout: 'centered',
	},
};

export default meta;

type Story = StoryObj<typeof RzPopMenu>;

const allItems = [
	{ href: '/recipes/1', label: 'View', requiredPermission: '__controls:read' as const },
	{ href: '/recipes/1/edit', label: 'Edit', requiredPermission: 'recipes:update' as const },
	{ href: '/recipes/1/delete', label: 'Delete', requiredPermission: 'recipes:delete' as const },
];

export const Default: Story = {
	args: {
		items: allItems,
		userPermissions: ['__controls:read', 'recipes:update', 'recipes:delete'],
	},
};

export const PartialPermissions: Story = {
	args: {
		items: allItems,
		userPermissions: ['__controls:read'],
	},
};

export const AllHidden: Story = {
	args: {
		items: allItems,
		userPermissions: [],
	},
};

export const SingleItem: Story = {
	args: {
		items: [{ href: '/recipes/1', label: 'View Recipe', requiredPermission: '__controls:read' as const }],
		userPermissions: ['__controls:read'],
	},
};
