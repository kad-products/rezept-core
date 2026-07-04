import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import RzTable from './RzTable';

const meta: Meta<typeof RzTable> = {
	component: RzTable,
};

export default meta;

type Story = StoryObj<typeof RzTable>;

const columns = [
	{ key: 'name', label: 'Name' },
	{ key: 'season', label: 'Season' },
	{ key: 'time', label: 'Prep Time' },
];

const data = [
	{ id: '1', name: 'Summer Pasta', season: 'Summer', time: '30 min' },
	{ id: '2', name: 'Roasted Squash Soup', season: 'Autumn', time: '45 min' },
	{ id: '3', name: 'Spring Salad', season: 'Spring', time: '15 min' },
];

export const Default: Story = {
	args: {
		columns,
		data,
		userPermissions: ['recipes:read', '__controls:read'],
	},
};

export const Empty: Story = {
	args: {
		columns,
		data: [],
		userPermissions: ['recipes:read'],
	},
};

export const WithEditAction: Story = {
	args: {
		columns: [
			...columns,
			{
				key: 'actions',
				label: 'Actions',
				actions: [
					{
						type: 'link' as const,
						hrefProp: 'editUrl',
						label: 'Edit',
						requiredPermission: 'recipes:update' as const,
					},
				],
			},
		],
		data: data.map(item => ({ ...item, editUrl: `/recipes/${item.id}/edit` })),
		userPermissions: ['recipes:read', 'recipes:update'],
	},
};

export const WithButtonAction: Story = {
	args: {
		columns: [
			...columns,
			{
				key: 'actions',
				label: 'Actions',
				actions: [
					{
						type: 'button' as const,
						label: 'Delete',
						requiredPermission: 'recipes:delete' as const,
						handler: fn(),
					},
				],
			},
		],
		data,
		userPermissions: ['recipes:read', 'recipes:delete'],
	},
};

export const ActionsHidden: Story = {
	args: {
		columns: [
			...columns,
			{
				key: 'actions',
				label: 'Actions',
				actions: [
					{
						type: 'link' as const,
						hrefProp: 'editUrl',
						label: 'Edit',
						requiredPermission: 'recipes:update' as const,
					},
				],
			},
		],
		data: data.map(item => ({ ...item, editUrl: `/recipes/${item.id}/edit` })),
		userPermissions: ['recipes:read'],
	},
};

export const WithCustomRender: Story = {
	args: {
		columns: [
			{ key: 'name', label: 'Name' },
			{ key: 'season', label: 'Season' },
			{
				key: 'time',
				label: 'Prep Time',
				render: (val: string) => <strong>{val}</strong>,
			},
		],
		data,
		userPermissions: ['recipes:read'],
	},
};
