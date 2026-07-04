import type { Meta, StoryObj } from '@storybook/react';
import RzLink from './RzLink';

const meta: Meta<typeof RzLink> = {
	component: RzLink,
	parameters: {
		layout: 'centered',
	},
};

export default meta;

type Story = StoryObj<typeof RzLink>;

export const Visible: Story = {
	args: {
		href: '/recipes',
		label: 'View Recipes',
		requiredPermission: 'recipes:read',
		userPermissions: ['recipes:read'],
	},
};

export const Hidden: Story = {
	args: {
		href: '/recipes/new',
		label: 'Add Recipe',
		requiredPermission: 'recipes:create',
		userPermissions: ['recipes:read'],
	},
};

export const ExternalLink: Story = {
	args: {
		href: 'https://example.com/seasonal-guide',
		label: 'Seasonal Ingredient Guide',
		requiredPermission: '__controls:read',
		userPermissions: ['__controls:read'],
		target: '_blank',
		rel: 'noopener noreferrer',
	},
};

export const JSXLabel: Story = {
	args: {
		href: '/ingredients',
		label: <strong>Browse Ingredients</strong>,
		requiredPermission: 'ingredients:read',
		userPermissions: ['ingredients:read'],
	},
};
