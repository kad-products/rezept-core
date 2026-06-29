import { expect, test } from '@playwright/experimental-ct-react';
import { navItems } from '@/data/navigation';
import RzLeftNav from './RzLeftNav';

test('renders basic left nav with single item', async ({ mount }) => {
	const component = await mount(
		<RzLeftNav
			navItems={[
				{
					href: '/foo/bar',
					label: 'My label',
				},
			]}
		/>,
	);
	await expect(component).toHaveScreenshot();
});

test('renders profile left nav for user with no permissions', async ({ mount }) => {
	const component = await mount(<RzLeftNav navItems={navItems.recipes} />);
	await expect(component).toHaveScreenshot();
});
