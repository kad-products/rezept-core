import classNames from 'classnames';
import { BiFoodMenu } from 'react-icons/bi';
import { CgProfile } from 'react-icons/cg';
import { CiHome } from 'react-icons/ci';
import { FaStoreAlt, FaUsers } from 'react-icons/fa';
import { GiFallingLeaf } from 'react-icons/gi';
import { IoLogInOutline } from 'react-icons/io5';
import { MdFoodBank, MdOutlineChecklistRtl } from 'react-icons/md';
import { PiBooksBold } from 'react-icons/pi';
import type { AppContext } from '@/worker';

export default function StandardLayout({
	children,
	currentBasePage,
	pageTitle,
	ctx = {},
}: {
	children: React.ReactNode;
	currentBasePage: string | undefined;
	pageTitle: string;
	ctx: AppContext;
}) {
	const navItems = {
		home: { label: 'Home', href: '/', icon: CiHome },
		seasons: { label: 'Seasons', href: '/seasons', icon: GiFallingLeaf },
		recipes: { label: 'Recipes', href: '/recipes', icon: BiFoodMenu },
		lists: { label: 'Lists', href: '/lists', icon: MdOutlineChecklistRtl },
		users: { label: 'Users', href: '/users', icon: FaUsers },
		'grocery-stores': { label: 'Grocery Stores', href: '/grocery-stores', icon: FaStoreAlt },
		pantries: { label: 'Pantries', href: '/pantries', icon: MdFoodBank },
		profile: { label: 'Profile', href: '/profile', icon: CgProfile },
		'recipe-boxes': { label: 'Recipe Boxes', href: '/recipe-boxes', icon: PiBooksBold },
	};

	return (
		<>
			<header>
				<nav className="main-nav">
					{Object.entries(navItems).map(([key, item]) => {
						const Icon = item.icon;
						return (
							<a
								key={key}
								className={classNames({
									'nav-item': true,
									'nav-item-active': currentBasePage === key,
								})}
								href={item.href}
							>
								<span className="nav-item-icon">
									<Icon />
								</span>
								<span className="nav-item-label">{item.label}</span>
							</a>
						);
					})}
					{ctx.user ? (
						<a
							className={classNames({
								'nav-item': true,
								'nav-item-active': currentBasePage === 'auth',
							})}
							href="/auth/logout"
						>
							<span className="nav-item-icon">
								<IoLogInOutline />
							</span>
							<span className="nav-item-label">Logout</span>
						</a>
					) : (
						<a
							className={classNames({
								'nav-item': true,
								'nav-item-active': currentBasePage === 'auth',
							})}
							href="/auth/login"
						>
							<span className="nav-item-icon">
								<IoLogInOutline />
							</span>
							<span className="nav-item-label">Login</span>
						</a>
					)}
				</nav>
			</header>
			<main>
				<h2 className="page-title">{pageTitle}</h2>
				{children}
			</main>
		</>
	);
}
