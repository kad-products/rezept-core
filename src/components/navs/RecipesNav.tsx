import { RzLeftNav } from '../design-system';

export default function RecipesNav(): React.ReactNode {
	const recipesNavItems = [
		{
			href: '/recipes',
			label: 'Recipes',
		},
		{
			href: '/recipes/uploads',
			label: 'Uploads',
		},
		{
			href: '/recipes/scrapes',
			label: 'Scrapes',
		},
	];
	return <RzLeftNav navItems={recipesNavItems} />;
}
