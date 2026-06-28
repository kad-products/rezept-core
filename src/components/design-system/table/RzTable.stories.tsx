import type { Meta, StoryObj } from '@storybook/react';
import RzTable from './RzTable';

const meta: Meta<typeof RzTable> = {
	component: RzTable,
};

export default meta;

type Story = StoryObj<typeof RzTable>;

const columns = [
	{ key: 'name', label: 'Name' },
	{ key: 'season', label: 'Season' },
	{ key: 'time', label: 'Time' },
];

const data = [
	{ id: '1', name: 'Summer Pasta', season: 'Summer', time: '30 min' },
	{ id: '2', name: 'Roasted Squash Soup', season: 'Autumn', time: '45 min' },
	{ id: '3', name: 'Spring Salad', season: 'Spring', time: '15 min' },
];

export const Default: Story = {
	args: { columns, data },
};

export const Empty: Story = {
	args: { columns, data: [] },
};

export const WithEditAction: Story = {
	args: {
		columns: [
			{ key: 'name', label: 'Name' },
			{ key: 'season', label: 'Season' },
			{ key: 'time', label: 'Time' },
			{
				key: 'actions',
				label: 'Actions',
				actions: [
					{
						type: 'link',
						hrefProp: 'editUrl',
						label: 'Edit',
					},
				],
			},
		],
		data: data.map(item => ({ ...item, editUrl: `/edit/${item.id}` })),
	},
};

export const WithCustomRender: Story = {
	args: {
		columns: [
			{ key: 'name', label: 'Name' },
			{ key: 'season', label: 'Season' },
			{
				key: 'time',
				label: 'Time',
				render: val => <strong>{val}</strong>,
			},
		],
		data,
	},
};
