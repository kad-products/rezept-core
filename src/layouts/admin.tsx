import { QuestionMarkCircledIcon } from '@radix-ui/react-icons';
import classNames from 'classnames';
import { StrictMode } from 'react';
import type { DefaultAppContext } from 'rwsdk/worker';
import { getNavItems } from '@/data/navigation';
import type { NavItem } from '@/types';

export default function AdminLayout({
	children,
	currentBasePage,
	pageTitle,
	ctx,
}: {
	children: React.ReactNode;
	currentBasePage: string | undefined;
	pageTitle: string;
	ctx: DefaultAppContext;
}): React.ReactNode {
	const userPerms = ctx.permissions || [];

	const mainNavItems = getNavItems('admin', userPerms);

	return (
		<StrictMode>
			<header>
				<nav className="main-nav">
					{mainNavItems.map(item => {
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
				{children}
			</main>
		</StrictMode>
	);
}
