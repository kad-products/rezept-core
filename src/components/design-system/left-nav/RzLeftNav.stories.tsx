import type { Meta, StoryObj } from '@storybook/react';
import RzLeftNav from './RzLeftNav';

const meta: Meta<typeof RzLeftNav> = {
	component: RzLeftNav,
};

export default meta;

type Story = StoryObj<typeof RzLeftNav>;

const allNavItems = [
	{ href: '/recipes', label: 'Recipes', requiredPermission: 'recipes:read' as const },
	{ href: '/ingredients', label: 'Ingredients', requiredPermission: 'ingredients:read' as const },
	{ href: '/seasons', label: 'Seasons', requiredPermission: 'seasons:read' as const },
	{ href: '/profile', label: 'Profile', requiredPermission: 'profile:read' as const },
	{ href: '/admin/users', label: 'Users', requiredPermission: 'users:read' as const },
];

export const Default: Story = {
	args: {
		navItems: allNavItems,
		userPermissions: ['recipes:read', 'ingredients:read', 'seasons:read', 'profile:read', 'users:read'],
	},
};

export const PartialPermissions: Story = {
	args: {
		navItems: allNavItems,
		userPermissions: ['recipes:read', 'ingredients:read', 'seasons:read', 'profile:read'],
	},
};

export const Empty: Story = {
	args: {
		navItems: allNavItems,
		userPermissions: [],
	},
};
