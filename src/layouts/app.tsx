import { QuestionMarkCircledIcon } from '@radix-ui/react-icons';
import classNames from 'classnames';
import { StrictMode } from 'react';
import type { DefaultAppContext } from 'rwsdk/worker';
import { RzLeftNav } from '@/components/design-system';
import { getNavItems } from '@/data/navigation';
import type { NavItem } from '@/types';

export default function AppLayout({
	children,
	currentBasePage,
	pageTitle,
	ctx,
	leftNav,
}: {
	children: React.ReactNode;
	currentBasePage: string | undefined;
	pageTitle: string;
	ctx: DefaultAppContext;
	leftNav?: string;
}): React.ReactNode {
	const userPerms = ctx.permissions || [];

	const filteredNavItems = getNavItems('main', userPerms);
	let leftNavItems: NavItem[] = [];
	if (leftNav) {
		leftNavItems = getNavItems(leftNav, userPerms);
	}

	return (
		<StrictMode>
			<header>
				<nav className="main-nav">
					{filteredNavItems.map(item => {
						const Icon = item.icon || QuestionMarkCircledIcon;
						return (
							<a
								key={item.key}
								className={classNames({
									'nav-item': true,
									'nav-item-active': currentBasePage === item.key,
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
				</nav>
			</header>
			<main>
				<h2 className="page-title">{pageTitle}</h2>
				<div className="app-layout-inner">
					{leftNav && (
						<div className="app-layout-left-nav">
							<RzLeftNav navItems={leftNavItems} />
						</div>
					)}
					<div className="app-layout-content">{children}</div>
				</div>
			</main>
		</StrictMode>
	);
}
