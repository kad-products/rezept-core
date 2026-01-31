import classNames from 'classnames';
import { BiFoodMenu } from 'react-icons/bi';
import { CgProfile } from 'react-icons/cg';
import { CiHome } from 'react-icons/ci';
import { GiFallingLeaf } from 'react-icons/gi';
import { IoLogInOutline } from 'react-icons/io5';
import { MdOutlineChecklistRtl } from 'react-icons/md';
import { seasons } from '@/models/seasons';
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
		profile: { label: 'Profile', href: '/profile', icon: CgProfile },
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
