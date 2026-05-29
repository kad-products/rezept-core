import { expect, test } from '@playwright/experimental-ct-react';
import RzCard from '../RzCard';

test('renders title and actions', async ({ mount }) => {
	const component = await mount(
		<RzCard
			title="Pasta Carbonara"
			actions={[
				{ href: '/recipes/1', text: 'View' },
				{ href: '/recipes/1/favorite', text: 'Favorite' },
			]}
		/>,
	);
	await expect(component).toHaveScreenshot();
});

test('renders title, body, and actions', async ({ mount }) => {
	const component = await mount(
		<RzCard
			title="Pasta Carbonara"
			body="A classic Roman pasta dish with eggs, cheese, and guanciale."
			actions={[{ href: '/recipes/1', text: 'View' }]}
		/>,
	);
	await expect(component).toHaveScreenshot();
});

test('renders with no body when omitted', async ({ mount }) => {
	const component = await mount(<RzCard title="Untitled Recipe" actions={[]} />);
	await expect(component).toHaveScreenshot();
});

test('renders multiple actions', async ({ mount }) => {
	const component = await mount(
		<RzCard
			title="Pasta Carbonara"
			actions={[
				{ href: '/recipes/1', text: 'View' },
				{ href: '/recipes/1/edit', text: 'Edit' },
				{ href: '/recipes/1/favorite', text: 'Favorite' },
			]}
		/>,
	);
	await expect(component).toHaveScreenshot();
});
