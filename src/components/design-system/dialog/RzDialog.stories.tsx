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
		title: 'Edit Recipe',
		description: "Make changes to your recipe here. Click save when you're done.",
		children: <p>Dialog body content goes here.</p>,
	},
};

export const NoDescription: Story = {
	args: {
		trigger: <button type="button">Delete ingredient</button>,
		title: 'Confirm deletion',
		children: <p>Are you sure you want to delete this ingredient? This action cannot be undone.</p>,
	},
};

export const LongContent: Story = {
	args: {
		trigger: <button type="button">View full instructions</button>,
		title: 'Recipe Instructions',
		description: 'Step-by-step instructions for preparing this dish.',
		children: (
			<ol>
				<li>Preheat oven to 200°C (400°F).</li>
				<li>Peel and cube the butternut squash into 2cm pieces.</li>
				<li>Toss with olive oil, salt, and pepper, then spread on a baking tray.</li>
				<li>Roast for 25–30 minutes until golden and tender, turning halfway through.</li>
				<li>Meanwhile, sauté the onion and garlic in a large saucepan over medium heat until soft.</li>
				<li>Add the roasted squash to the pan along with the vegetable stock.</li>
				<li>Bring to a simmer and cook for a further 10 minutes.</li>
				<li>Use a stick blender to blitz the soup until smooth.</li>
				<li>Stir in the cream and season to taste with salt, pepper, and a pinch of nutmeg.</li>
				<li>Serve hot with crusty bread and a drizzle of pumpkin seed oil.</li>
				<li>Garnish with toasted pumpkin seeds and fresh thyme leaves.</li>
				<li>Store leftovers in an airtight container in the fridge for up to 3 days.</li>
			</ol>
		),
	},
};
